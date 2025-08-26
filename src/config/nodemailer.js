const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host : process.env.SMTP_HOST,
    port : process.env.SMTP_PORT || 587,
    secure : false,
    auth : {
        user : process.env.SMTP_USER,
        pass : process.env.SMTP_PASS     
    }
})


transporter.verify((err, res) => {
    if(err){
        console.err("ERROR IN NODEMAILER CONFIG");
    }else{
        console.log("Nodemailer config ready");
    }
})

module.exports = transporter;