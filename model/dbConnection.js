const mongoose = require('mongoose'); // Mongoose helps us to connect to the mongoDB

const mongoURI = 'mongodb://localhost:27017/UserDB';

mongoose.connect(mongoURI);

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        require: true
        },
    email:{
        type: String,
        require: true
        },
    password: {
        type: String,
        require: true
        },
    re_enter_password: {
        type: String,
        require: true
    }
});

const userModel = mongoose.model('userDB', userSchema);
module.exports = userModel;