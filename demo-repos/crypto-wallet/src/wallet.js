// Wallet operations
// INTENTIONAL VULNERABILITY: Dangerous eval() and security issues

const crypto = require('./crypto');
const keys = require('./keys');

// SECURITY ISSUE: Using eval() with user input
// This allows arbitrary code execution!
function executeTransaction(transactionScript) {
  try {
    // CRITICAL VULNERABILITY: eval() with untrusted input
    const result = eval(transactionScript);
    return result;
  } catch (error) {
    console.error('Transaction failed:', error);
    return null;
  }
}

// SECURITY ISSUE: No signature verification
function sendTransaction(to, amount, privateKey) {
  // Missing: proper signature generation and verification
  const transaction = {
    to: to,
    amount: amount,
    from: keys.getWalletKey('mainWallet').address,
    timestamp: Date.now()
  };
  
  // SECURITY ISSUE: Weak hash for transaction ID
  transaction.id = crypto.hashWithMD5(JSON.stringify(transaction));
  
  console.log('Sending transaction:', transaction);
  return transaction;
}

// SECURITY ISSUE: No rate limiting
// SECURITY ISSUE: No authentication
function getBalance(address) {
  // Would return balance without proper authentication
  return {
    address: address,
    balance: 1000000,
    currency: 'ETH'
  };
}

// SECURITY ISSUE: Accepting arbitrary commands
function processCommand(command) {
  // VULNERABILITY: eval() again!
  try {
    return eval(command);
  } catch (error) {
    return { error: error.message };
  }
}

// SECURITY ISSUE: No encryption for storage
function saveWallet(walletData) {
  // Should encrypt wallet data before saving
  // Currently saves in plaintext
  console.log('Saving wallet (plaintext):', JSON.stringify(walletData));
}

// SECURITY ISSUE: Logging private keys
console.log('Wallet initialized with private key:', keys.MASTER_PRIVATE_KEY);

// CODE QUALITY ISSUE: Global mutable state
let globalWalletState = {
  balance: 0,
  transactions: []
};

module.exports = {
  executeTransaction,
  sendTransaction,
  getBalance,
  processCommand,
  saveWallet,
  globalWalletState
};
