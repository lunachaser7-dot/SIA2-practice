// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db'); // your DB connection
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const financeRoutes = require('./routes/finance');
const analyticsRoutes = require('./routes/analytics');
const app = express();
const PORT = process.env.PORT || 3002;

const frontendPath = path.join(__dirname, '../frontend');
const backendHost = `http://127.0.0.1:${PORT}`;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(frontendPath));

app.get('/config.js', (req, res) => {
  const apiRoot = `${backendHost}/api`;
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`window.API_BASE_URL = '${apiRoot}';
window.BACKEND_HOST = '${backendHost}';
window.apiUrl = function(path) {
  if (!path) return window.API_BASE_URL;
  return path.startsWith('/') ? window.API_BASE_URL + path : window.API_BASE_URL + '/' + path;
};`);
});

// LOGIN ENDPOINT
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    const users = result.rows;

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const { password: _, ...userData } = user;
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '8h' }
    );

    res.json({ message: 'Login successful', user: userData, token });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { fullname, email, password, role = 'user' } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ message: 'Full name, email, and password are required.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [fullname, email, hashedPassword, role]
    );

    const result2 = await db.query('SELECT id, name, email, role FROM users WHERE email = ?', [email]);
    const user = result2.rows[0];
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '8h' }
    );

    res.json({ message: 'Account created successfully.', token, user });
  } catch (err) {
    console.error('Register error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already exists.' });
    }
    res.status(500).json({ message: 'Unable to create account at this time.' });
  }
});

app.use('/api/finance', financeRoutes);
app.use('/api/analytics', analyticsRoutes);

// Start server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ Backend running at http://127.0.0.1:${PORT}`);
});