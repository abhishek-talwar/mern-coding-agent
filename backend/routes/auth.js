const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// GitHub OAuth route
router.get('/github', passport.authenticate('github', {
  scope: ['repo', 'user:email'],
}));

// GitHub OAuth callback
router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // Create or update user
      let user = await User.findOne({ githubId: req.user.githubId });

      if (!user) {
        user = await User.create({
          githubId: req.user.githubId,
          username: req.user.username,
          email: req.user.email,
          avatar: req.user.avatar,
          accessToken: req.user.accessToken,
          refreshToken: req.user.refreshToken,
        });
      } else {
        user.accessToken = req.user.accessToken;
        user.refreshToken = req.user.refreshToken;
        await user.save();
      }

      // Generate JWT token
      const token = generateToken(user._id);

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('GitHub OAuth Error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=authentication_failed`);
    }
  }
);

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-accessToken -refreshToken');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  // In a real app, you might invalidate the token or add it to a blacklist
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
