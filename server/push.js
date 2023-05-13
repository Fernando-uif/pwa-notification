const urlSafeBase64 = require("urlsafe-base64");
const fs = require("fs");
const vapid = require("./vapid.json");
const suscripciones = require("./subs-db.json");
const webpush = require("web-push");

webpush.setVapidDetails(
  "mailto:fst_96@hotmail.com",
  vapid.publicKey,
  vapid.privateKey
);

const getKey = () => {
  return urlSafeBase64.decode(vapid.publicKey);
};

const addSubscription = (suscription) => {
  console.log(suscription, "Tenemos la suscription");
  suscripciones.push(suscription);
  fs.writeFileSync(`${__dirname}/subs-db.json`, JSON.stringify([suscription]));
};

const sendNotification = (post) => {
 
  suscripciones.forEach((suscripcion, index) => {

    webpush.sendNotification(suscripcion, JSON.stringify(post));
  });
};

module.exports = {
  getKey,
  addSubscription,
  sendNotification,
};
