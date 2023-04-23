/* eslint-disable */
const axios = require('axios');
const Agent = require('agentkeepalive');
const HttpsAgent = Agent.HttpsAgent;

let instance;

// Create a reusable connection instance that can be passed around to different controllers
const keepAliveAgent = new Agent({
  keepAlive: true,
  // maxSockets: 128, // or 128 / os.cpus().length if running node across multiple CPUs
  // maxFreeSockets: 128, // or 128 / os.cpus().length if running node across multiple CPUs
  // timeout: 60000, // active socket keepalive for 60 seconds
  // freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
});

// HTTPS agent
const httpsKeepAliveAgent = new HttpsAgent({
  keepAlive: true,
  // maxSockets: 128, // or 128 / os.cpus().length if running node across multiple CPUs
  // maxFreeSockets: 128, // or 128 / os.cpus().length if running node across multiple CPUs
  // timeout: 60000, // active socket keepalive for 30 seconds
  // freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
});

module.exports = function () {
  if (!instance) {
    instance = axios.create({
      httpAgent: keepAliveAgent,
      httpsAgent: httpsKeepAliveAgent,
    });
  }
  return instance;
};
