const express = require("express");
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/test', authController.test)

router.post('/signup', authController.signUp);

router.post('/send-otp', authController.sendOTP);

router.post('/refresh', authController.refresh);

router.post('/verify-otp', authController.verifyOTP);

router.post('/login', authController.login);

router.post('/change-password', authController.changePassword);

router.post('/forgot-password', authController.forgotPassword);

router.post('/reset-password', authController.resetPassword);

module.exports = router;