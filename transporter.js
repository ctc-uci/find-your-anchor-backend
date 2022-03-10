const nodemailer = require('nodemailer');
const cred = require('./emailConfig.json');

require('dotenv').config();

const transport = {
  host: 'smtp.gmail.com', // e.g. smtp.gmail.com
  auth: {
    user: cred.username,
    pass: cred.password,
  },
  from: cred.username,
  secure: true,
};

const transporter = nodemailer.createTransport(transport);

module.exports = transporter;
