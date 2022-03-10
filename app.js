const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const boxRouter = require('./routes/boxHistory');
const boxFormRouter = require('./routes/boxForm');
const s3UploadRouter = require('./routes/s3upload');
const emailRouter = require('./routes/nodeMailer');

const app = express();
// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`,
    credentials: true,
  }),
);

app.use('/boxHistory', boxRouter);
app.use('/boxForm', boxFormRouter);
app.use('/s3Upload', s3UploadRouter);
app.use('/nodemailer', emailRouter);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
