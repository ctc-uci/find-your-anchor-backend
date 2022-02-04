const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const boxFormRouter = require('./routes/boxForm');
require('dotenv').config();

// Uncomment this when we start querying the database
// const {db} = require('./config');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const app = express();
// body parser middleware
// app.use(express.json({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`,
  }),
);

// Routes
app.use('/boxForm', boxFormRouter);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
