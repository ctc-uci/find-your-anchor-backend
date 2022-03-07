const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const boxFormRouter = require('./routes/boxForm');
const exportCSVRouter = require('./routes/exportCSV');
const s3UploadRouter = require('./routes/s3upload');

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

app.use('/boxForm', boxFormRouter);
app.use('/exportCSV', exportCSVRouter);
app.use('/s3Upload', s3UploadRouter);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
