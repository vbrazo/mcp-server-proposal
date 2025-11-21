// Input validation module
// INTENTIONAL VULNERABILITY: Missing input validation

// SECURITY ISSUE: No input sanitization
function validateAddress(address) {
  // Missing: checksum validation, format validation
  // Just checks if it starts with 0x - not secure!
  return address.startsWith('0x');
}

// SECURITY ISSUE: No amount validation
function validateAmount(amount) {
  // Missing: range checks, decimal validation, overflow protection
  return amount > 0;
}

// SECURITY ISSUE: No SQL injection protection
function buildQuery(userInput) {
  // Direct string concatenation - SQL injection vulnerability!
  return `SELECT * FROM transactions WHERE address = '${userInput}'`;
}

// SECURITY ISSUE: No XSS protection
function formatTransactionHTML(transaction) {
  // Direct HTML insertion without sanitization
  return `
    <div class="transaction">
      <p>To: ${transaction.to}</p>
      <p>Amount: ${transaction.amount}</p>
      <p>Note: ${transaction.note}</p>
    </div>
  `;
}

// SECURITY ISSUE: Regex DoS vulnerability
function validateEmail(email) {
  // Catastrophic backtracking vulnerability
  const regex = /^([a-zA-Z0-9]+)*@([a-zA-Z0-9]+)*\.com$/;
  return regex.test(email);
}

// SECURITY ISSUE: No length limits
function processUserNote(note) {
  // No maximum length check - can cause DoS
  return note;
}

// SECURITY ISSUE: Path traversal vulnerability
function loadConfigFile(filename) {
  const fs = require('fs');
  // No path validation - allows '../../../etc/passwd'
  return fs.readFileSync(`./config/${filename}`, 'utf8');
}

// SECURITY ISSUE: Command injection
function execSystemCommand(userCommand) {
  const { exec } = require('child_process');
  // Direct execution of user input - command injection!
  exec(userCommand, (error, stdout, stderr) => {
    console.log(stdout);
  });
}

module.exports = {
  validateAddress,
  validateAmount,
  buildQuery,
  formatTransactionHTML,
  validateEmail,
  processUserNote,
  loadConfigFile,
  execSystemCommand
};
