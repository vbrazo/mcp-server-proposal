// Authentication module
// INTENTIONAL VULNERABILITY: Weak password hashing

const md5 = require('md5');
const db = require('./db');

// SECURITY ISSUE: Using MD5 for password hashing
// MD5 is cryptographically broken and should not be used for passwords
function hashPassword(password) {
  return md5(password);
}

// SECURITY ISSUE: No password complexity requirements
function registerUser(email, password, name) {
  const passwordHash = hashPassword(password);
  
  const query = `INSERT INTO users (email, password, name) VALUES ('${email}', '${passwordHash}', '${name}')`;
  
  return new Promise((resolve, reject) => {
    db.connection.query(query, (error, results) => {
      if (error) reject(error);
      resolve(results);
    });
  });
}

// SECURITY ISSUE: Timing attack vulnerability
async function loginUser(email, password) {
  const user = await db.getUserByEmail(email);
  
  if (!user) {
    return null;
  }
  
  const passwordHash = hashPassword(password);
  
  // SECURITY ISSUE: Plain comparison vulnerable to timing attacks
  if (user.password === passwordHash) {
    return user;
  }
  
  return null;
}

// SECURITY ISSUE: No rate limiting
async function resetPassword(email, newPassword) {
  const passwordHash = hashPassword(newPassword);
  const query = `UPDATE users SET password = '${passwordHash}' WHERE email = '${email}'`;
  
  return new Promise((resolve, reject) => {
    db.connection.query(query, (error, results) => {
      if (error) reject(error);
      resolve(results);
    });
  });
}

module.exports = {
  registerUser,
  loginUser,
  resetPassword,
  hashPassword
};

