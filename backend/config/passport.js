const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                return done(null, user);
            }

            // If user doesn't exist, create new user
            // Note: We might want to check if email exists to link accounts
            const existingUserStart = await User.findOne({ email: profile.emails[0].value });
            if (existingUserStart) {
                // Link googleId to existing user
                existingUserStart.googleId = profile.id;
                await existingUserStart.save();
                return done(null, existingUserStart);
            }

            user = new User({
                username: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id
            });

            await user.save();
            done(null, user);
        } catch (err) {
            console.error(err);
            done(err, null);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user);
    });
});
