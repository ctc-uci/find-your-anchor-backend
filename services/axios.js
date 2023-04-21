/* eslint-disable */
const axios = require('axios');
const https = require('https');

let instance;

module.exports = function () {
  if (!instance) {
    instance = axios.create({
      timeout: 60000,
      httpsAgent: new https.Agent({ keepAlive: true }),
    });
  }
  return instance;
};
