// Routes.js - Módulo de rutas
var express = require("express");
var router = express.Router();

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

module.exports = router;
