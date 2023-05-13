// Routes.js - Módulo de rutas
const express = require("express");
const push = require("./push");
const router = express.Router();

const mensajes = [
  {
    _id: 0,
    user: "spiderman",
    mensaje: "hola mundo",
  },
];

// Get mensajes
router.get("/", function (req, res) {
  res.status(200).json(mensajes);
});
router.post("/", function (req, res) {
  res.json("push enviado");
});

// Almacenar la subscripcion
router.post("/subscribe", (req, res) => {
  const suscription = req.body;
  res.json("subscribe");
  push.addSubscription(suscription);
});

// Almacenar la suscripcion
router.get("/key", (req, res) => {
  const key = push.getKey();
  res.send(key);
});

// Enviar una notificacion push a las personas que nosotros querramos
// Esto se controla del lado del server
router.post("/push", (req, res) => {
  const post = {
    titulo: req.body.titulo,
    cuerpo: req.body.cuerpo,
    usuario: req.body.usuario,
  };
  
  push.sendNotification(post)
  res.json(post);
});

module.exports = router;
