//imports
const express = require('express');
const app = express(); //app variable inherits all the actions of express api
const User = require('./model/dbConnection');
const bcrypt = require('bcrypt'); //Helps us to encrypt the user password
const session = require('express-session');
const mongoDBSession = require('connect-mongodb-session')(session); //Used to save session in the db

//Variable declarations
const port = 3000;
const store = new mongoDBSession({
    uri: User.uri,
    collection: 'mySession'
})

//middlewares: Middleware's always run prior to the original code execution
app.set('view engine', 'ejs'); //Specified ejs as a view engine
app.use(express.static('public')); //This line check's the public folder to show the static files to the user
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret123',
     resave: false,
     saveUninitialized: false,
     store: store
}))

const isAuth = (req, res, next) =>{
    if(req.session.isAuth){
        next();
    }else{
        res.redirect('/');
    }
}

//Code
app.get('/', (req, res) => {
    res.render("index");
    console.log(req.session);
    console.log(req.session.id);
})

app.get('/register', (req, res) => {
    res.render('registrationPage');
})

app.post("/register", async (req, res) => {
    try {
        let { username, email, password, re_enter_password } = req.body;
        
        // Check if the user with the given email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).send('User with this email already exists');
        }

        // Check if password matches re-entered password
        if (password !== re_enter_password) {
            return res.status(400).send('Passwords do not match');
        }

        const lowerCaseEmail = email.toLowerCase();
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create a new user
        const newUser = new User({
            username,
            email: lowerCaseEmail,
            password: hashedPassword
        });

        // Log the newUser object
        console.log(newUser);

        // Save the new user to the database
        await newUser.save();
        
        res.status(201).redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating user');
    }
});

app.get('/login', (req, res) =>{
    res.render('loginPage');
})

app.post('/login', async(req, res) => {
    
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if(!email){
        res.redirect('/register');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
        return res.send(`Username and password does not match`);
    }
    req.session.isAuth = true;
    return res.redirect('/dashboard');
})

app.get('/dashboard', isAuth, (req, res) => {
    return res.render('dashboard');
})

app.listen(port);
module.exports = app;