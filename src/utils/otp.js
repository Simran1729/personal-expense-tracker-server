const transporter = require('../config/nodemailer')
const otpGenerator = require('otp-generator');


const generateOtp = () => {
    const otp = otpGenerator.generate(6, {
        upperCaseAlphabets : false,
        lowerCaseAlphabets : false,
        digits: true,
        specialChars : false
    })
    return otp;
}   

module.exports = {generateOtp}