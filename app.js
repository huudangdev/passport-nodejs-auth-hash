const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const PORT = process.env.PORT || 5000;
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

// Passport config
require('./config/passport')(passport);

// db config
const db = require('./config/keys').MongoURI;

// db connect
mongoose.connect(db, { useNewUrlParser : true })
    .then(() => console.log('DB connected...'))
    .catch(err => console.log(err));

//Ejs
app.use(expressLayouts);
app.set('view engine', 'ejs');

//Body parser
app.use(express.urlencoded({extended: false}));

// Express Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// connect flash
app.use(flash());

// Global Vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

//Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

app.listen(PORT, () => {
    console.log('Server listened on Port' + PORT);
});