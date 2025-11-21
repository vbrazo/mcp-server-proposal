// Key management module
// INTENTIONAL VULNERABILITY: Hardcoded private keys

// SECURITY ISSUE: Private key hardcoded in source code
// This is a major security vulnerability - private keys should NEVER be in code!
const MASTER_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj
MzEfYyjiWA4R4/M2bS1+fWIcPm15A8vMfbOKmJIxn4SznnGJYZ/lM9nVgkNXLIv3
zO6uRkIj8K/Dt5YH9P1KKQB0kLCQZ1NfLLK1l7Ydh0qNxJsZY8YPVKx5xJgLNOZE
9mF9ZoQ/v6cKvLKpQKQBNXZB1f2CqKp3zBLqM3g2HQ8gNxKLQJ1NZm3F6QpJqC7N
YQN3qNzMxC8fKJCqYL9VvBzVhMvJfLQxPQXBKqLpV6NxJL3Q6NvMxZHKJQH9L3F6
QpJqC7NYQxPQXBKqLp
-----END PRIVATE KEY-----`;

// SECURITY ISSUE: Seed phrase in plaintext
const RECOVERY_SEED = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

// SECURITY ISSUE: API keys and secrets
const EXCHANGE_API_KEY = 'api_key_1234567890abcdefghijklmnop';
const EXCHANGE_API_SECRET = 'api_secret_0987654321zyxwvutsrqponmlkjih';

// SECURITY ISSUE: Storing keys in JavaScript object (not secure storage)
const walletKeys = {
  mainWallet: {
    address: '0x1234567890123456789012345678901234567890',
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    publicKey: '0x04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aadcd6e8d5'
  },
  backupWallet: {
    address: '0x9876543210987654321098765432109876543210',
    privateKey: '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e',
    publicKey: '0x04c5b0c2b7c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0'
  }
};

// SECURITY ISSUE: No key rotation mechanism
// SECURITY ISSUE: No HSM or secure enclave usage
// SECURITY ISSUE: Keys stored in memory

function getMasterKey() {
  return MASTER_PRIVATE_KEY;
}

function getWalletKey(walletName) {
  return walletKeys[walletName];
}

function getRecoverySeed() {
  return RECOVERY_SEED;
}

// SECURITY ISSUE: Logging sensitive data
console.log('Master private key loaded');
console.log('Recovery seed:', RECOVERY_SEED);

module.exports = {
  getMasterKey,
  getWalletKey,
  getRecoverySeed,
  MASTER_PRIVATE_KEY,
  RECOVERY_SEED,
  EXCHANGE_API_KEY,
  EXCHANGE_API_SECRET
};
