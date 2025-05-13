const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { ensureAuthenticated } = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');

// Configuration de multer pour le téléchargement d'images
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limite à 5MB
  },
});

// Profil utilisateur
router.get('/profile', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.uid;
    
    // Récupérer les informations de l'utilisateur
    const user = await User.findById(userId);
    
    // Récupérer les posts de l'utilisateur
    const posts = await Post.findByUser(userId);
    
    res.render('profile', {
      user,
      posts,
      isCurrentUser: true
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Erreur lors du chargement du profil');
    res.redirect('/dashboard');
  }
});

// Profil d'un autre utilisateur
router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.session.user.uid;
    
    // Récupérer les informations de l'utilisateur
    const user = await User.findById(userId);
    
    if (!user) {
      req.flash('error_msg', 'Utilisateur non trouvé');
      return res.redirect('/dashboard');
    }
    
    // Récupérer les posts de l'utilisateur
    const posts = await Post.findByUser(userId);
    
    // Vérifier si l'utilisateur actuel suit cet utilisateur
    const isFollowing = user.followers && user.followers[currentUserId];
    
    res.render('profile', {
      user,
      posts,
      isCurrentUser: userId === currentUserId,
      isFollowing
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Erreur lors du chargement du profil');
    res.redirect('/dashboard');
  }
});

// Mettre à jour le profil
router.post('/profile', ensureAuthenticated, upload.single('profileImage'), async (req, res) => {
  try {
    const userId = req.session.user.uid;
    const { name, bio } = req.body;
    
    const updateData = {
      name,
      bio
    };
    
    // Si une image est téléchargée, l'envoyer à Cloudinary
    if (req.file) {
      // Convertir le buffer en base64
      const base64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${base64}`;
      
      // Télécharger l'image sur Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: 'image',
        folder: 'social_network_profiles',
      });
      
      updateData.profileImageUrl = result.secure_url;
      
      // Mettre à jour l'image de profil dans la session
      req.session.user.profileImageUrl = result.secure_url;
    }
    
    // Mettre à jour le nom dans la session
    req.session.user.name = name;
    
    // Mettre à jour les informations de l'utilisateur dans la base de données
    await User.update(userId, updateData);
    
    req.flash('success_msg', 'Profil mis à jour avec succès');
    res.redirect('/users/profile');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Erreur lors de la mise à jour du profil');
    res.redirect('/users/profile');
  }
});

// Suivre un utilisateur
router.post('/:id/follow', ensureAuthenticated, async (req, res) => {
  try {
    const followId = req.params.id;
    const userId = req.session.user.uid;
    
    if (followId === userId) {
      req.flash('error_msg', 'Vous ne pouvez pas vous suivre vous-même');
      return res.redirect('back');
    }
    
    await User.follow(userId, followId);
    
    req.flash('success_msg', 'Vous suivez maintenant cet utilisateur');
    res.redirect('back');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Erreur lors du suivi de l\'utilisateur');
    res.redirect('back');
  }
});

// Ne plus suivre un utilisateur
router.post('/:id/unfollow', ensureAuthenticated, async (req, res) => {
  try {
    const followId = req.params.id;
    const userId = req.session.user.uid;
    
    await User.unfollow(userId, followId);
    
    req.flash('success_msg', 'Vous ne suivez plus cet utilisateur');
    res.redirect('back');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Erreur lors du désabonnement');
    res.redirect('back');
  }
});

module.exports = router;