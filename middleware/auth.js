module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.session.user) {
      return next();
    }
    req.flash('error_msg', 'Veuillez vous connecter pour accéder à cette page');
    res.redirect('/auth/login');
  }
};