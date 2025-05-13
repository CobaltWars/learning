const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Configuration de la session
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: true
}));

// Configuration de flash
app.use(flash());

// Variables globales
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.user = req.session.user;
  next();
});

// Configuration de Handlebars
app.engine('handlebars', engine({
  defaultLayout: 'main',
  helpers: {
    formatDate: function(date) {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    eq: function(a, b) {
      return a === b;
    },
    objLength: function(obj) {
      return obj ? Object.keys(obj).length : 0;
    }
  }
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/posts', require('./routes/posts'));
app.use('/users', require('./routes/users'));

// Page d'accueil
app.get('/', (req, res) => {
  res.render('index');
});

// Tableau de bord
const { ensureAuthenticated } = require('./middleware/auth');
const Post = require('./models/Post');

app.get('/dashboard', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.uid;
    
    // Récupérer le fil d'actualité
    const posts = await Post.getFeed(userId);
    
    res.render('dashboard', {
      user: req.session.user,
      posts
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Erreur lors du chargement du tableau de bord');
    res.redirect('/');
  }
});

// Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));