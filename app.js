const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Uncomment this when we start querying the database
// const {db} = require('./config');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const app = express();

const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`,
    credentials: true,
  }),
);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
