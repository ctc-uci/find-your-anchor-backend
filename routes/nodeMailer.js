const express = require('express');
const transporter = require('../transporter');

const emailRouter = express();

emailRouter.use(express.json());

emailRouter.post('/send', (req, res) => {
  const { email, messageHtml } = req.body;

  const mail = {
    from: `Bob Ross bobross69pogchamp@gmail.com`,
    to: email,
    subject: 'Contact form request',
    html: messageHtml,
  };

  transporter.sendMail(mail, (err) => {
    // console.log(data);
    if (err) {
      res.json({
        msg: 'fail',
      });
    } else {
      res.json({
        msg: 'success',
      });
    }
  });
});

module.exports = emailRouter;
