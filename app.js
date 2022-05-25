const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const boxHistoryRouter = require('./routes/boxHistory');
const exportCSVRouter = require('./routes/exportCSV');
const anchorBoxRouter = require('./routes/anchorBox');
const s3UploadRouter = require('./routes/s3upload');
const userRouter = require('./routes/users');
const { authRouter } = require('./routes/auth');
const emailRouter = require('./routes/nodeMailer');
const adminInviteRouter = require('./routes/adminInvite');

const app = express();
// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(cookieParser());

const PORT = process.env.PORT || 3001;
// by default the react app host will be on port 80
const origin =
  process.env.NODE_ENV === 'production' ? `${process.env.REACT_APP_HOST}` : 'http://localhost:3000';

app.use(
  cors({
    origin,
    credentials: true,
  }),
);

app.use('/boxHistory', boxHistoryRouter);
app.use('/exportCSV', exportCSVRouter);
app.use('/anchorBox', anchorBoxRouter);
app.use('/s3Upload', s3UploadRouter);
app.use('/users', userRouter);
app.use('/auth', authRouter);
app.use('/nodemailer', emailRouter);
app.use('/adminInvite', adminInviteRouter);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
