const { Pool, types } = require("pg"); 
require("dotenv").config();

types.setTypeParser(1082, function(stringValue) {
  return stringValue; 
});

const pool = new Pool({
  // This tells the app to look inside the .env file for the URL
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;