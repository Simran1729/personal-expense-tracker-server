const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email: {
        type : String,
        required: true,
        unique: true
    },
    otp : {
        type: String,
        minlength : 6,
        maxlength : 6,
        required: true
    },    
}, {timestamps: true});



//creates TTL for otp model - deletes the documents by checking createdAt field and deletes after expireAfterSeconds
otpSchema.index({createdAt: 1}, {expireAfterSeconds : 300})

const OtpModel = mongoose.model('OTP', otpSchema);
module.exports = OtpModel;