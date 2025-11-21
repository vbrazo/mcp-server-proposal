// API server
// INTENTIONAL ISSUES: Missing security headers and best practices

const express = require('express');
require('dotenv').config();

const app = express();

// SECURITY ISSUE: No helmet for security headers
// SECURITY ISSUE: No CORS configuration
// SECURITY ISSUE: No rate limiting
// SECURITY ISSUE: No input validation middleware

app.use(express.json());

// CODE QUALITY ISSUE: Hardcoded sensitive data
const adminToken = 'admin-token-12345';

app.get('/api/health', (req, res) => {
  // SECURITY ISSUE: Exposing internal information
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV,
    aws_key: process.env.AWS_ACCESS_KEY_ID,
    db_host: process.env.DB_HOST
  });
});

app.post('/api/admin', (req, res) => {
  const { token } = req.body;
  
  // SECURITY ISSUE: Plain text token comparison
  if (token === adminToken) {
    res.json({ message: 'Admin access granted' });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// SECURITY ISSUE: No authentication required
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  // Would delete user without authentication
  res.json({ message: `User ${id} deleted` });
});

module.exports = app;

