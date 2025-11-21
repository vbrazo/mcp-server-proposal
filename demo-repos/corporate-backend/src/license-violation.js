// LICENSE ISSUE: Using GPL-licensed library in proprietary code
// This violates the PROPRIETARY license in package.json

// COMPLIANCE ISSUE: Importing GPL-licensed library
const gplLib = require('gpl-licensed-lib');

function processData(data) {
  // Using GPL-licensed functionality in proprietary software
  // This creates a license compliance violation
  return gplLib.transform(data);
}

// COMPLIANCE ISSUE: Distributing GPL code without GPL license
function compileReport(data) {
  const processed = processData(data);
  
  // Additional processing
  return {
    timestamp: new Date(),
    data: processed,
    source: 'proprietary-system'
  };
}

module.exports = {
  processData,
  compileReport
};

