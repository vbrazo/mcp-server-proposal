// Main server file
// INTENTIONAL VULNERABILITIES: Various security and quality issues

const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const auth = require('./auth');
const db = require('./db');

const app = express();

app.use(bodyParser.json());

// SECURITY ISSUE: No CORS protection
// SECURITY ISSUE: No helmet for security headers
// SECURITY ISSUE: No rate limiting

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // SECURITY ISSUE: No input validation
    const user = await auth.loginUser(email, password);
    
    if (user) {
      // SECURITY ISSUE: Exposing sensitive user data
      res.json({ success: true, user });
    } else {
      // SECURITY ISSUE: Information disclosure
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    // SECURITY ISSUE: Exposing error details
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Search endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    // SECURITY ISSUE: No input sanitization
    const results = await db.searchProducts(q);
    
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CODE QUALITY ISSUE: Console.log in production
console.log('Starting server...');
console.log('API Key:', config.stripe.apiKey);
console.log('JWT Secret:', config.jwt.secret);

// Start server
app.listen(config.app.port, () => {
  console.log(`Server running on port ${config.app.port}`);
});

module.exports = app;
