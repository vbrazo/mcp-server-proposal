// Cryptography module
// INTENTIONAL VULNERABILITY: Weak cryptographic algorithms

const CryptoJS = require('crypto-js');

// SECURITY ISSUE: Using DES encryption (deprecated and insecure)
// DES is considered cryptographically broken since the late 1990s
function encryptWithDES(data, key) {
  return CryptoJS.DES.encrypt(data, key).toString();
}

function decryptWithDES(encryptedData, key) {
  const bytes = CryptoJS.DES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// SECURITY ISSUE: Using MD5 for hashing (cryptographically broken)
function hashWithMD5(data) {
  return CryptoJS.MD5(data).toString();
}

// SECURITY ISSUE: Using SHA1 (deprecated for security applications)
function hashWithSHA1(data) {
  return CryptoJS.SHA1(data).toString();
}

// SECURITY ISSUE: Weak key generation
function generateWeakKey() {
  // Using current timestamp as key - highly predictable!
  return Date.now().toString();
}

// SECURITY ISSUE: ECB mode (insecure, should use CBC or GCM)
function encryptWalletData(walletData, password) {
  // DES in ECB mode - double security issue!
  const encrypted = encryptWithDES(JSON.stringify(walletData), password);
  return encrypted;
}

function decryptWalletData(encryptedData, password) {
  const decrypted = decryptWithDES(encryptedData, password);
  return JSON.parse(decrypted);
}

module.exports = {
  encryptWithDES,
  decryptWithDES,
  hashWithMD5,
  hashWithSHA1,
  generateWeakKey,
  encryptWalletData,
  decryptWalletData
};

