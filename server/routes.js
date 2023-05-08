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
  const mensaje = {
    mensaje: req.body.mensaje,
    user: req.body.user,
  };

  mensajes.push(mensaje);

  res.status(200).json({
    ok: true,
    mensaje,
  });
});

// Almacenar la subscripcion
router.post("/subscribe", (req, res) => {
  res.json("subscribe");
});

// Almacenar la suscripcion
router.get("/key", (req, res) => {
  const key = push.getKey();
  res.send(key);
});

// Enviar una notificacion push a las personas que nosotros querramos
// Esto se controla del lado del server
router.post("/push", (req, res) => {
  res.json("push del post");
});

module.exports = router;
