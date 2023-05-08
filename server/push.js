const vapid = require("./vapid.json");
const urlSafeBase64 = require('urlsafe-base64');

const getKey = () => {
  return urlSafeBase64.decode(vapid.publicKey);
};

module.exports = {
  getKey,
};
