const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const boxHistoryRouter = require('./routes/boxHistory');
const exportCSVRouter = require('./routes/exportCSV');
const uploadCSVRouter = require('./routes/uploadCSV');
const anchorBoxRouter = require('./routes/anchorBox');
const validateBoxRouter = require('./routes/validateBox');
const s3UploadRouter = require('./routes/s3upload');
const userRouter = require('./routes/users');
const { authRouter } = require('./routes/auth');
const emailRouter = require('./routes/nodeMailer');
const adminInviteRouter = require('./routes/adminInvite');

const app = express();
// body parser middleware
app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));

app.use(bodyParser.raw());
app.use(cookieParser());

const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`,
    credentials: true,
  }),
);

app.use('/boxHistory', boxHistoryRouter);
app.use('/exportCSV', exportCSVRouter);
app.use('/uploadCSV', uploadCSVRouter);
app.use('/validateBox', validateBoxRouter);
app.use('/anchorBox', anchorBoxRouter);
app.use('/s3Upload', s3UploadRouter);
app.use('/users', userRouter);
app.use('/auth', authRouter);
app.use('/nodemailer', emailRouter);
app.use('/adminInvite', adminInviteRouter);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
