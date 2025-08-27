const USER = require('../models/user.model')
const OTP = require('../models/otp.model')
const PASSWORD_RESET = require('../models/passwordRest.model')

const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const {hashPassword, verifyPassword} = require('../utils/bcryptPassword');
const {generateOtp } = require('../utils/otp');
const {sendEmail} = require('../utils/mail')

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_RESET = process.env.JWT_RESET;


exports.test = (req, res) => {
    const otp = generateOtp();
    console.log("otp is : ", otp);
    res.status(200).json({
        "message" : "workign fine"
    })
}

exports.signUp = async(req, res) => {
    try{
        const {name, email, password} = req.body;
        if(!email || !name || !password){
            return res.status(400).json({
                "message" : "Either email, password or name is missing"
            });
        }

        const hashedPassword = await hashPassword(password);
        const createResp = await USER.create({name, email, password: hashedPassword, active: false});
        if(createResp._id){
            return res.status(201).json({
                "message" : "User created successfully. Please verify OTP to login"
            })
        }
    } catch(err){
        if(err.code == 11000){
            res.status(409).json({
                "message" : "User with this email already exists"
            })
        }
        else{
            res.status(500).json({
                "message" : "Internal Server error, please try again"
            })
        }
    }
}

exports.refresh = async(req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken){
        return res.status(401).json({
            message : "No refresh Token found"
        })
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, user) => {
        if(err){
            return res.status(403).json({
                message : "Invalid refresh Token"
            })
        }

        const payload = {
            name : user.name, 
            email : user.email,
            id : user.id
        }
        const newAccessToken = jwt.sign(payload, JWT_SECRET);
        res.status(200).json({
            accessToken: newAccessToken
        })
    })
}

exports.login = async(req, res) => {
    try{
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                "message" : "Email or password is missing"
            })
        }

        const userExist = await USER.findOne({email});
        if(!userExist){
            return res.status(404).json({
                "message" : "No user found with this email"
            })
        }

        if(!(userExist.active)){
            return res.status(403).json({
                "message" : "User is not acive, can't login, please verify email first"
            })
        }

        const isMatch = await verifyPassword(userExist.password, password);
        if(isMatch){
                const payload = {
                name : userExist.name, 
                email : userExist.email,
                id : userExist._id
            }
            const accessToken = jwt.sign(payload, JWT_SECRET, {expiresIn : "1h"});
            const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {expiresIn : "1d"});

            return res
            .cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure : false,
                sameSite : "lax",
                maxAge: 1 * 24 * 60 * 60 * 1000,
            })
            .status(200)
            .json({
                "message" : "User logged in successfully",
                accessToken
            })
            
        }else{
            return res.status(401).json({
                "message" : "Invalid credentials"
            })
        }
    } catch(err){
        res.status(500).json({
            "message" : "Failed to Login. Please try again"
        })
    }
}

exports.sendOTP = async(req, res) => {
    try{
        const {email} = req.body;
        if(!email){
            return res.status(400).json({
                "message" : "No email found in the request"
            })
        }

        const otp = generateOtp();

        await OTP.deleteMany({ email });  

        const saveOTP = await OTP.create({email, otp});

        if(!saveOTP){
            return res.status(500).json({
                "message" : "Error saving otp"
            })
        }

        const subject = "Your OTP for Verification";
        const body = `<p>Your OTP for verification is: <b>${otp}</b></p>
                            <p>It will expire in 5 minutes.</p>`;

        const emailRes = await sendEmail(email, subject, body);
        if(emailRes){
            return res.status(200).json({
                "message" : "OTP sent successfully"
            })
        }else{
            return res.status(502).json({
                "messsage" : "Error sending email, please try again later"
            })
        }
    } catch(err){
        return res.status(500).json({
            message : "Error sending OTP. Please try again"
        })
    }
}

exports.verifyOTP = async(req, res) => {
    try{
        
        const {email, otp} = req.body;
        if(!email || !otp) {
            return res.status(400).json({
                "message" : "Email and otp are required"
            })
        }

        const user = await USER.findOne({email});
        if(!user){
            return res.status(404).json({
                "message" : "No user found with this email. Please try signing in again"
            })
        }
        
        if(!email || !otp){
            return res.status(400).json({
                "message" : "Email or otp not found"
            })
        }

        const otpRecord = await OTP.findOne({email});
        if(!otpRecord){
            return res.status(404).json({
                "message" : "No otp record found for this user"
            })
        }

        console.log("")
        if(otpRecord.otp !== otp){
            console.log("match failed");
            console.log(otpRecord.otp);
            console.log(otp);            
            return res.status(400).json({
                "message" : "Invalid OTP"
            })
        }

       user.active = true;
       await user.save();


       await OTP.deleteMany({email});

            const payload = {
                name : user.name, 
                email : user.email,
                id : user._id
            }



            const accessToken = jwt.sign(payload, JWT_SECRET, {expiresIn : "1h"});
            const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {expiresIn : "1d"});

            return res
            .cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure : false,
                sameSite : "lax",
                maxAge: 2 * 24 * 60 * 60 * 1000
            })
            .status(200)
            .json({
                "message" : "User verified successfully",
                accessToken
            })


    } catch(err){
        return res.status(500).json({
            message : "Error verifiying OTP"
        })
    }
}

exports.changePassword = async(req, res) => {
    try{
        const {email, oldPassword, newPassword} = req.body;
        if(!email || !oldPassword || !newPassword){
            return res.status(400).json({
                "message" : "Email, or oldpassword or new password is missing"
            })
        }
        const userExist = await USER.findOne({email});

        if(!userExist){
             return res.status(404).json({
                "message" : "No user found with this email"
             })       
        }

        // console.log("userExists", userExist);
        const isMatch = await verifyPassword(userExist.password, oldPassword);

        console.log("isMatch : ", isMatch)
        if(!isMatch){
            return res.status(401).json({
                "message" : "Password didn't match, please enter valid password"
            })
        }

        //passwords mathced, hash the new password and update the user
        const newhash = await hashPassword(newPassword);

        userExist.password = newhash;
        await userExist.save();

        return res.status(200).json({
            "message" : "Password changed successfully"
        })

    } catch(err){
        return res.status(500).json({
            "message" : "Error changing password"
        })
    }
}

exports.forgotPassword = async(req, res) => {
    try{
        const {email} = req.body;

        const genericOk = () => {
            res.status(200).json({
                "message" : "If the user exists with this email, instructions has been shared on the email"
            })
        }

        const user = await USER.findOne({email});
        if(!user || !user.active){
           return genericOk();
        }

        await PASSWORD_RESET.deleteMany({user_id : user._id});

        const jti = crypto.randomUUID();

        await PASSWORD_RESET.create({
            user_id : user._id,
            jti : jti
        })

        const payload = {
            sub : user._id,
            jti : jti,
        }
        const resetToken = jwt.sign(payload, JWT_RESET, {expiresIn : "15m"});
        const encodedToken = encodeURIComponent(resetToken)

        
        const link = `http://localhost:3000/reset-password?token=${encodeURIComponent(encodedToken)}`;

        const subject = "Reset password link Email";
        const html = `
            <p>We received a request to reset your password.</p>
            <p>token IS : ${resetToken} </p>
            <p><a href="${link}">Click <u>here</u> to reset your password</a> (link expires in 15 minutes).</p>
            <p>If you didn’t request this, you can safely ignore this email.</p>
            `;
        
        try{
            await sendEmail(user.email, subject, html);
        }catch(e){
            console.error("Sending email failed for forgot password", e);
        }
        return genericOk();
    } catch(err){
        return res.status(500).json({
            "message" : "Error in Forgot Password route"
        })
    }
}

exports.resetPassword = async(req, res) => {
    try{
        const {token, newPassword} = req.body || {};
        if(!token || !newPassword){
            return res.status(400).json({
                "message" : "Either token or New Password is missing"
            })
        }
    
        let payload;
        try{
            payload = jwt.verify(token, JWT_RESET);
        } catch (e) {
        return res.status(400).json({ message: 'Invalid or expired reset link.' });
        }

        const {sub , jti} = payload;
          if (!sub || !jti) {
        return res.status(400).json({ message: 'Invalid or expired reset link.' });
        }

        const pr = await PASSWORD_RESET.findOneAndDelete({user_id : sub, jti});
        if (!pr) {
        return res.status(400).json({ message: 'Invalid or expired reset link.' });
        }

        const newHash = await hashPassword(newPassword);
        await USER.updateOne(
                {_id : sub},
                {$set : {password : newHash}}
             )

        return res.status(200).json({ message: 'Password has been reset.' });

    } catch(err){
        return res.status(500).json({
            "message" : "Error reseting password"
        })
    }
}