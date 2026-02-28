const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const passport = require('passport');
const session = require('cookie-session');
require('./config/passport'); // Passport config
const authRoutes = require('./routes/auth');
const { initCronJobs } = require('./scripts/cronJobs');

const app = express();

// Initialize Cron Jobs
initCronJobs();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
app.use(express.json());

// Session Middleware
app.use(session({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_KEY || 'secretkey']
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Database Connection with retry logic
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000,
        });
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};

connectDB();

// Serve static assets
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/finance', require('./routes/finance'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/user', require('./routes/user'));
app.use('/api/ai', require('./routes/ai'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
