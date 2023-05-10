const urlSafeBase64 = require("urlsafe-base64");
const fs = require("fs");
const vapid = require("./vapid.json");
const suscripciones = require("./subs-db.json");

const getKey = () => {
  return urlSafeBase64.decode(vapid.publicKey);
};

const addSubscription = (suscription) => {
  console.log(suscription, "Tenemos la suscription");
  suscripciones.push(suscription);
  fs.writeFileSync(`${__dirname}/subs-db.json`, JSON.stringify([suscription]));
};



module.exports = {
  getKey,
  addSubscription,
};
