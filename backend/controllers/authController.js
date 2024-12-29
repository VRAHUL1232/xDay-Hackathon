// backend/controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcrypt');
const { generateToken } = require('../middleware/auth');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.json({ 
        status: 'Failed',
        error: 'User not found' 
      });
    }

    const user = users[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.json({ 
        status: 'Failed',
        error: 'Invalid password' 
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      status: 'Success',
      id: user.id,
      email: user.email,
      token: token
    });
  } catch (error) {
    console.error(error);
    res.json({ 
      status: 'Failed',
      error: error.message 
    });
  }
};

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const [existingUsers] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.json({ 
        status: 'Failed',
        error: 'Email already registered' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const [result] = await db.execute(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );

    const user = {
      id: result.insertId,
      email: email
    };

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      status: 'Success',
      id: user.id,
      email: user.email,
      token: token
    });
  } catch (error) {
    console.error(error);
    res.json({ 
      status: 'Failed',
      error: error.message 
    });
  }
};

module.exports = {
  login,
  register
};


