const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

const User = require('../models/User');

//login page
router.get('/login', (req, res) => {
    res.render('login');
})

// register page
router.get('/register', (req, res) => {
    res.render('register');
})

//register post
router.post('/register', (req, res) => {
    const {name, email, password, password2} = req.body;
    let errors = [];

    //Check valid
    // - is Empty
    if (!name || !email || !password || !password2) {
        errors.push({msg: 'Please fill in all fields'});
    } 
    // - password match
    if (password !== password2) {
        errors.push({msg : 'Password not match'});
    }
    // - character pass leng
    if (password.length < 6) {
        errors.push({msg: 'Password should be at least 6 characters'});
    }
    //End valid
    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        })
    } else {
        //valid already
        User.findOne({email: email})
            .then(user => {
                if (user) {
                //exists
                    errors.push({msg: 'This email is already'});
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    })
                    // hash pass
                    bcrypt.genSalt(10, (err, salt) => 
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            //set pass
                            newUser.password = hash;
                            //save
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are now registered and can log in');
                                    res.redirect('/users/login');
                                })
                                .catch(err => console.log(err));
                        })
                    )
                }
            })
    }
});

// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// LogOut Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('users/login');
})


module.exports = router;