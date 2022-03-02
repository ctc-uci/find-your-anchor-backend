const nodemailer = require('nodemailer');
const cred = require('./emailConfig.json');

require('dotenv').config();

const transport = {
  host: 'smtp.gmail.com', // e.g. smtp.gmail.com
  auth: {
    user: cred.username,
    pass: cred.password,
  },
  from: 'bobross69pogchamp@gmail.com',
  secure: true,
};

const transporter = nodemailer.createTransport(transport);

transporter.verify(() => {
  // if (error) {
  //   console.log(error);
  // } else {
  //   console.log('All works fine, congratz!');
  // }
});

module.exports = transporter;
