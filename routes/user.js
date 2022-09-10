const express = require('express');
const router = express.Router({mergeParams: true});
const myError = require('../utils/ExpressErrors');
const asyncError = require('../utils/AsyncError.js');
const User = require('../models/user');
const passport = require('passport');
const { Session } = require('express-session');


router.get('/register', (req, res)=>{
    res.render('users/registration');
})
router.post('/register', asyncError(async (req, res)=>{
 try{
    const {email, username, password} = req.body;
    const user = new User({email, username});
    const registered = await User.register(user, password);
    req.login(registered, function(err) {
        if (err) { return next(err); }
        req.flash('success', 'Welcome to Camp King!');
        res.redirect('/campgrounds');
      });
 }
 catch(err){
    req.flash('error', err.message);
    res.redirect('/register')
 }
}))

router.get('/login', (req, res)=>{
    res.render('users/login');
})
router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login',keepSessionInfo: true,}), (req, res)=>{
    req.flash('success', 'Successfully logged in, enjoyy!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    // console.log(redirectUrl);
    // console.log(req.session.returnTo);
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})
router.get('/logout', (req, res, next)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success', 'Successfully logged out!');
          res.redirect('/campgrounds');
      });
   
})

module.exports = router;