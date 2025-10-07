const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signup = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    if (!email && !phone) return res.status(400).json({ message: 'Provide email or phone' });

    // Check for existing user with email only
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: 'User already exists' });

    const user = new User({ email, phone: phone || undefined });
    await user.setPassword(password);
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const user = await User.findOne({ $or: [{ email }, { phone }] });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const validPassword = await user.validatePassword(password);
    if (!validPassword) return res.status(401).json({ message: 'Incorrect password' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback_secret_key_12345', { expiresIn: '1d' });
    
    // Return user data along with token
    res.json({ 
      token,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone
      },
      message: 'Login successful'
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

module.exports = { signup, login };
