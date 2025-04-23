const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const Memory = require('./models/Memory');

const app = express();
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Test route
app.get('/', (req, res) => {
  res.send('NeuraNote Backend is running!');
});

// Save memory route
app.post('/memories', async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: 'Request body is missing' });
  }
  const { userId, text } = req.body;
  if (!userId || !text) {
    return res.status(400).json({ error: 'userId and text are required' });
  }
  try {
    const memory = new Memory({ userId, text });
    await memory.save();
    res.status(201).json(memory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save memory' });
  }
});

// Retrieve memories route
app.get('/memories', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  try {
    const memories = await Memory.find({ userId }).sort({ createdAt: -1 });
    res.json(memories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});