const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { ensureAuthenticated } = require('../middleware/auth');
const Post = require('../models/Post');

// Configuration de multer pour le téléchargement d'images
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limite à 5MB
  },
});

// Créer un nouveau post
router.post('/', ensureAuthenticated, upload.single('image'), async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.session.user.uid;
    
    let imageUrl = null;
    
    // Si une image est téléchargée, l'envoyer à Cloudinary
    if (req.file) {
      // Convertir le buffer en base64
      const base64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${base64}`;
      
      // Télécharger l'image sur Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: 'image',
        folder: 'social_network',
      });
      
      imageUrl = result.secure_url;
    }
    
    // Créer le post dans la base de données
    await Post.create({
      userId,
      userName: req.session.user.name,
      userProfileImageUrl: req.session.user.profileImageUrl,
      content,
      imageUrl,
      likes: {},
      comments: {}
    });
    
    req.flash('success_msg', 'Post créé avec succès');
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Erreur lors de la création du post');
    res.redirect('/dashboard');
  }
});

// Liker un post
router.post('/:id/like', ensureAuthenticated, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.session.user.uid;
    
    await Post.like(postId, userId);
    
    res.redirect('back');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Erreur lors du like');
    res.redirect('back');
  }
});

// Unliker un post
router.post('/:id/unlike', ensureAuthenticated, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.session.user.uid;
    
    await Post.unlike(postId, userId);
    
    res.redirect('back');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Erreur lors du unlike');
    res.redirect('back');
  }
});

// Ajouter un commentaire
router.post('/:id/comment', ensureAuthenticated, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.session.user.uid;
    const { content } = req.body;
    
    await Post.addComment(postId, {
      userId,
      userName: req.session.user.name,
      userProfileImageUrl: req.session.user.profileImageUrl,
      content
    });
    
    res.redirect('back');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Erreur lors de l\'ajout du commentaire');
    res.redirect('back');
  }
});

module.exports = router;