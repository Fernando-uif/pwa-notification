const db = new PouchDB("mensajes");

// utilidades para grabar pouchDb
function guardarMensaje(mensaje) {
  mensaje._id = new Date().toISOString();
  return db.put(mensaje).then(() => {
    self.registration.sync.register("nuevo-post");
    const newResponse = { ok: true, offline: true };
    return new Response(JSON.stringify(newResponse));
  });
}
// Postear mensajes a la base de datos
const postearMensajes = () => {
  const posteos = [];

  return db.allDocs({ includes_docs: true }).then((docs) => {
    docs.rows.forEach((row) => {
      const doc = row.doc;
      const fetchProm = fetch("api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(doc),
      }).then((res) => {
        return db.remove(doc);
      });
      posteos.push(fetchProm);
    });
    return Promise.all(posteos);
  });
};
