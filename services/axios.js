const axios = require('axios');
const https = require('https');

let instance;

module.exports = function () {
  if (!instance) {
    instance = axios.create({
      httpsAgent: new https.Agent({ keepAlive: true }),
    });
  }
  return instance;
};
