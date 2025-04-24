const express = require('express');
const mongoose = require('mongoose');
const admin = require('firebase-admin');
require('dotenv').config();

const Memory = require('./models/Memory');
const authRoutes = require('./routes/auth');

// Initialize Firebase Admin
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes
app.use('/auth', authRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('NeuraNote Backend is running!');
});

// Save memory route (protected)
app.post('/memories', verifyToken, async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: 'Request body is missing' });
  }
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'text is required' });
  }
  try {
    const memory = new Memory({ userId: req.user.uid, text });
    await memory.save();
    res.status(201).json(memory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save memory' });
  }
});

// Retrieve memories route (protected)
app.get('/memories', verifyToken, async (req, res) => {
  try {
    const memories = await Memory.find({ userId: req.user.uid }).sort({ createdAt: -1 });
    res.json(memories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
