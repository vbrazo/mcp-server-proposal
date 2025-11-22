const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('Connected successfully!');

    // Read the schema file
    const schemaPath = path.join(__dirname, '../src/db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Running migrations...');
    
    // Execute the schema (PostgreSQL handles multiple statements)
    await client.query(schema);
    
    console.log('Migration completed successfully!');
    
    client.release();
  } catch (error) {
    console.error('Migration failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();

