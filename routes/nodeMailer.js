const express = require('express');
const transporter = require('../transporter');

const emailRouter = express();

emailRouter.use(express.json());

emailRouter.post('/send', (req, res) => {
  const { email, messageHtml } = req.body;
  const mail = {
    from: `${process.env.REACT_APP_EMAIL_FIRST_NAME} ${process.env.REACT_APP_EMAIL_LAST_NAME} ${process.env.REACT_APP_EMAIL_USERNAME}`,
    to: email,
    subject: 'Contact form request',
    html: messageHtml,
  };

  transporter.sendMail(mail, (err) => {
    if (err) {
      res.status(400).send('Fail');
    } else {
      res.status(200).send('Success');
    }
  });
});

module.exports = emailRouter;
