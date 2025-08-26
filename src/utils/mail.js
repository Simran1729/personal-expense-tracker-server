const transporter = require('../config/nodemailer')

const sendMailHelper = async(mailConfig) => {
    try{
        const mailOptions = mailConfig;
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent is : ", info.messageId);
        return true;
    } catch(err){
        console.error("Error sending email");
        return false;
    }
}


const sendEmail = async(email, subject, html) =>{
    try{
        const mailOptions = {
                from: process.env.SMTP_USER,
                to: email,
                subject: subject,
                html: html
        }

        const info = await sendMailHelper(mailOptions);
        console.log("response from sendMailHelper", info);
        return true;
    }catch(err){
        console.error("ERROR SENDING EMAIL THROUGH SEND MAIL");
        return false;
    }
}


module.exports = {sendEmail};