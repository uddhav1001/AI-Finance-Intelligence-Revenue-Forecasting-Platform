const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        const savedUser = await newUser.save();
        res.status(201).json({ message: 'User created successfully', userId: savedUser._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Generate token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

        res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            // We return a generic message even if the user doesn't exist to prevent email enum attacks
            return res.json({ message: 'If that email exists, a reset link has been sent.' });
        }

        // Generate token
        const crypto = require('crypto');
        const token = crypto.randomBytes(32).toString('hex');

        // Hash it for DB storage
        user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
        await user.save();

        // Send Email
        const { sendPasswordResetEmail } = require('../utils/emailService');
        const resetUrl = `http://localhost:5173/reset-password/${token}`;
        await sendPasswordResetEmail(user.email, resetUrl, user.username);

        res.json({ message: 'If that email exists, a reset link has been sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Could not process request' });
    }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { password } = req.body;
        const crypto = require('crypto');

        // Hash the token from the URL to compare with the DB
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token is invalid or has expired' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Clear reset fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password has been safely reset. You may now log in.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Could not process request' });
    }
});

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

        // Redirect to frontend with token
        // In a production app, it's safer to use cookies or a secure way to transfer the token
        // For simplicity, we'll pass it in the query string (be careful with this in production!)
        res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
    }
);

module.exports = router;
