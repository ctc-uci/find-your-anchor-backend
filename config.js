require('dotenv').config();
const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

const connectionString = `postgresql://${process.env.REACT_APP_DATABASE_USER}:${process.env.REACT_APP_DATABASE_PASSWORD}@${process.env.REACT_APP_DATABASE_HOST}:${process.env.REACT_APP_DATABASE_PORT}/${process.env.REACT_APP_DATABASE_NAME}`;

const db = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
  ssl: true,
});

module.exports = { db };
