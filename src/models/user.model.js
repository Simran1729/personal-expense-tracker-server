const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name : {type: String, required: true},
    password : {type : String, required: true},
    email : {type : String, required: true, unique: true},
    token : {
        type: String
    }
}, {strict: true})

const UserModel = mongoose.model('User', userSchema);
module.exports = UserModel;