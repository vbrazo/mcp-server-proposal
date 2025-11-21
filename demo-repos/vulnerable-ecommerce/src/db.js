// Database operations
// INTENTIONAL VULNERABILITY: SQL Injection

const mysql = require('mysql');
const config = require('./config');

const connection = mysql.createConnection(config.database);

// SECURITY ISSUE: SQL Injection vulnerability
// Uses string concatenation instead of parameterized queries
function getUserByEmail(email) {
  const query = 'SELECT * FROM users WHERE email = \'' + email + '\'';
  
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results) => {
      if (error) reject(error);
      resolve(results[0]);
    });
  });
}

// SECURITY ISSUE: SQL Injection in search
function searchProducts(searchTerm) {
  const query = `SELECT * FROM products WHERE name LIKE '%${searchTerm}%'`;
  
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results) => {
      if (error) reject(error);
      resolve(results);
    });
  });
}

// SECURITY ISSUE: Direct user input in WHERE clause
function deleteUser(userId) {
  const query = 'DELETE FROM users WHERE id = ' + userId;
  
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results) => {
      if (error) reject(error);
      resolve(results);
    });
  });
}

module.exports = {
  getUserByEmail,
  searchProducts,
  deleteUser,
  connection
};
