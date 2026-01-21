import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // check if user with email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    const user = new User({ username, email, password });
    const newUser = await user.save();
    res.status(201).json({ 
      id: newUser._id,
      username: newUser.username,
      email: newUser.email 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Incorrect email or password.' });
    }
    
    // Verify password
    const isValidPassword = await user.isCorrectPassword(password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Incorrect email or password.' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { 
        _id: user._id,
        username: user.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ 
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new user
router.post('/', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    const newUser = await user.save();
    res.status(201).json({ 
      id: newUser._id,
      username: newUser.username,
      email: newUser.email 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update user
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (req.body.username) user.username = req.body.username;
    if (req.body.email) user.email = req.body.email;
    if (req.body.password) user.password = req.body.password;
    
    const updatedUser = await user.save();
    res.json({ 
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
