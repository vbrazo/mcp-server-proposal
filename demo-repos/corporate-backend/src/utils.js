// Utility functions
// CODE QUALITY ISSUE: Very long function with high complexity

// CODE QUALITY ISSUE: This function is over 200 lines long
// It violates single responsibility principle and has too high complexity
function processComplexBusinessLogic(data, options) {
  let result = {};
  let errors = [];
  let warnings = [];
  let processed = 0;
  let skipped = 0;
  
  // Nested conditionals increase complexity
  if (data && data.length > 0) {
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      
      if (item.type === 'A') {
        if (item.status === 'active') {
          if (item.value > 100) {
            if (options.processLarge) {
              result[item.id] = item.value * 2;
              processed++;
            } else {
              warnings.push(`Large value skipped: ${item.id}`);
              skipped++;
            }
          } else {
            result[item.id] = item.value;
            processed++;
          }
        } else if (item.status === 'pending') {
          if (options.processPending) {
            result[item.id] = item.value;
            processed++;
          } else {
            skipped++;
          }
        } else {
          errors.push(`Invalid status: ${item.status}`);
        }
      } else if (item.type === 'B') {
        if (item.status === 'active') {
          if (item.value < 50) {
            if (options.processSmall) {
              result[item.id] = item.value / 2;
              processed++;
            } else {
              skipped++;
            }
          } else if (item.value < 200) {
            result[item.id] = item.value;
            processed++;
          } else {
            if (options.capValues) {
              result[item.id] = 200;
              warnings.push(`Value capped: ${item.id}`);
              processed++;
            } else {
              result[item.id] = item.value;
              processed++;
            }
          }
        } else {
          errors.push(`Inactive item: ${item.id}`);
        }
      } else if (item.type === 'C') {
        if (item.category === 'premium') {
          if (item.status === 'active') {
            result[item.id] = item.value * 1.5;
            processed++;
          } else if (item.status === 'trial') {
            result[item.id] = item.value;
            processed++;
          } else {
            errors.push(`Invalid premium status: ${item.status}`);
          }
        } else if (item.category === 'standard') {
          result[item.id] = item.value;
          processed++;
        } else if (item.category === 'basic') {
          if (options.processBasic) {
            result[item.id] = item.value * 0.8;
            processed++;
          } else {
            skipped++;
          }
        } else {
          errors.push(`Unknown category: ${item.category}`);
        }
      } else if (item.type === 'D') {
        if (options.experimental) {
          if (item.beta === true) {
            result[item.id] = item.value;
            warnings.push(`Beta feature: ${item.id}`);
            processed++;
          } else {
            errors.push(`Non-beta D type: ${item.id}`);
          }
        } else {
          skipped++;
        }
      } else {
        errors.push(`Unknown type: ${item.type}`);
      }
      
      // More nested logic
      if (item.metadata) {
        if (item.metadata.priority === 'high') {
          if (result[item.id]) {
            result[item.id] *= 1.2;
          }
        } else if (item.metadata.priority === 'low') {
          if (result[item.id]) {
            result[item.id] *= 0.9;
          }
        }
        
        if (item.metadata.tags) {
          for (let j = 0; j < item.metadata.tags.length; j++) {
            const tag = item.metadata.tags[j];
            if (tag === 'urgent') {
              warnings.push(`Urgent item: ${item.id}`);
            } else if (tag === 'deprecated') {
              warnings.push(`Deprecated item: ${item.id}`);
            }
          }
        }
      }
    }
  } else {
    errors.push('No data provided');
  }
  
  // More complex logic
  if (options.validateResults) {
    const keys = Object.keys(result);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = result[key];
      
      if (value < 0) {
        errors.push(`Negative value: ${key}`);
        delete result[key];
      } else if (value > 10000) {
        warnings.push(`Very large value: ${key}`);
        if (options.capAtMax) {
          result[key] = 10000;
        }
      }
    }
  }
  
  // Even more logic
  if (options.generateReport) {
    const report = {
      total: data.length,
      processed: processed,
      skipped: skipped,
      errors: errors.length,
      warnings: warnings.length,
      timestamp: new Date(),
      performance: {
        avgProcessingTime: processed > 0 ? 10 : 0,
        successRate: (processed / data.length) * 100
      }
    };
    
    console.log('Report:', JSON.stringify(report));
  }
  
  // Return complex object
  return {
    success: errors.length === 0,
    result: result,
    metadata: {
      processed: processed,
      skipped: skipped,
      errors: errors,
      warnings: warnings,
      options: options
    }
  };
}

// CODE QUALITY ISSUE: TODO comments
// TODO: Refactor this function - it's way too long
// FIXME: High cyclomatic complexity
// HACK: This needs proper error handling

module.exports = {
  processComplexBusinessLogic
};

