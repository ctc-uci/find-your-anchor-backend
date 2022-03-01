const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const boxFormRouter = require('./routes/boxForm');
const s3UploadRouter = require('./routes/s3upload');
const userRouter = require('./routes/users');
const { authRouter, verifyToken } = require('./routes/auth');

const app = express();
// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(cookieParser());

const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`,
    credentials: true,
  }),
);

app.use('/boxForm', [verifyToken, boxFormRouter]);
app.use('/s3Upload', [verifyToken, s3UploadRouter]);
app.use('/users', userRouter);
app.use('/auth', authRouter);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
