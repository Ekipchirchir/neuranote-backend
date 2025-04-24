const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Signup route
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const user = await admin.auth().createUser({
      email,
      password,
    });
    res.status(201).json({ uid: user.uid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login route (returns ID token)
router.post('/login', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: 'ID token is required' });
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    res.json({ uid: decodedToken.uid, idToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid ID token' });
  }
});

module.exports = router;