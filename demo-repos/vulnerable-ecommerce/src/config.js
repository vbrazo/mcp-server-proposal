// E-commerce configuration
// INTENTIONAL VULNERABILITY: Hardcoded API key

const config = {
  app: {
    name: 'Vulnerable E-Commerce',
    port: process.env.PORT || 3000,
  },
  
  database: {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'ecommerce'
  },
  
  // SECURITY ISSUE: Hardcoded Stripe API key (fake for demo)
  stripe: {
    apiKey: ''
  },
  
  // SECURITY ISSUE: Hardcoded JWT secret
  jwt: {
    secret: ''
  }
};

module.exports = config;
