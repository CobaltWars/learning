const express = require('express');
const router = express.Router();
const { auth } = require('../config/firebase');
const User = require('../models/User');

// Page d'inscription
router.get('/register', (req, res) => {
  res.render('register');
});

// Traitement de l'inscription
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, password2 } = req.body;
    
    // Validation
    let errors = [];
    
    if (!name || !email || !password || !password2) {
      errors.push({ msg: 'Veuillez remplir tous les champs' });
    }
    
    if (password !== password2) {
      errors.push({ msg: 'Les mots de passe ne correspondent pas' });
    }
    
    if (password.length < 6) {
      errors.push({ msg: 'Le mot de passe doit comporter au moins 6 caractères' });
    }
    
    if (errors.length > 0) {
      return res.render('register', {
        errors,
        name,
        email
      });
    }
    
    // Créer un utilisateur dans Firebase Auth
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Créer un profil utilisateur dans la base de données
    await User.create(user.uid, {
      name,
      email,
      profileImageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      bio: '',
      followers: {},
      following: {},
      createdAt: new Date().toISOString()
    });
    
    req.flash('success_msg', 'Vous êtes maintenant inscrit et pouvez vous connecter');
    res.redirect('/auth/login');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Une erreur est survenue lors de l\'inscription');
    res.redirect('/auth/register');
  }
});

// Page de connexion
router.get('/login', (req, res) => {
  res.render('login');
});

// Traitement de la connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Connexion à Firebase Auth
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Récupérer les informations du profil
    const userData = await User.findById(user.uid);
    
    // Créer une session
    req.session.user = {
      uid: user.uid,
      email: user.email,
      name: userData.name,
      profileImageUrl: userData.profileImageUrl
    };
    
    req.flash('success_msg', 'Vous êtes maintenant connecté');
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Email ou mot de passe incorrect');
    res.redirect('/auth/login');
  }
});

// Déconnexion
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;