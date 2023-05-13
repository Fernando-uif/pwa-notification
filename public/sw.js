// imports
importScripts("https://cdn.jsdelivr.net/npm/pouchdb@8.0.1/dist/pouchdb.min.js");
importScripts("js/sw-db.js");
importScripts("js/sw-utils.js");

const STATIC_CACHE = "static-v1";
const DYNAMIC_CACHE = "dynamic-v2";
const INMUTABLE_CACHE = "inmutable-v1";

const APP_SHELL = [
  "/",
  "index.html",
  "css/style.css",
  "img/favicon.ico",
  "img/avatars/hulk.jpg",
  "img/avatars/ironman.jpg",
  "img/avatars/spiderman.jpg",
  "img/avatars/thor.jpg",
  "img/avatars/wolverine.jpg",
  "js/app.js",
  "js/sw-utils.js",
];

const APP_SHELL_INMUTABLE = [
  "https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.0/animate.css",
  "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js",
  "https://cdn.jsdelivr.net/npm/pouchdb@8.0.1/dist/pouchdb.min.js",
  "https://unpkg.com/@dmuy/toast@2.0.3/dist/mdtoast.css",
  // 'https://unpkg.com/@dmuy/toast@{version}/dist/mdtoast.js'
];

self.addEventListener("install", (e) => {
  const cacheStatic = caches
    .open(STATIC_CACHE)
    .then((cache) => cache.addAll(APP_SHELL));

  const cacheInmutable = caches
    .open(INMUTABLE_CACHE)
    .then((cache) => cache.addAll(APP_SHELL_INMUTABLE));
  e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});

self.addEventListener("activate", (e) => {
  const respuesta = caches.keys().then((keys) => {
    keys.forEach((key) => {
      if (key !== STATIC_CACHE && key.includes("static")) {
        return caches.delete(key);
      }

      if (key !== DYNAMIC_CACHE && key.includes("dynamic")) {
        return caches.delete(key);
      }
    });
  });

  e.waitUntil(respuesta);
});

self.addEventListener("fetch", (e) => {
  let respuesta;
  if (e.request.url.includes("/api")) {
    respuesta = manejoApiMensajes(DYNAMIC_CACHE, e.request);
  } else {
    respuesta = caches.match(e.request).then((res) => {
      if (res) {
        actualizaCacheStatico(STATIC_CACHE, e.request, APP_SHELL_INMUTABLE);
        return res;
      } else {
        return fetch(e.request).then((newRes) => {
          return actualizaCacheDinamico(DYNAMIC_CACHE, e.request, newRes);
        });
      }
    });
  }
  e.respondWith(respuesta);
});
// Tareas asincronas
self.addEventListener("sync", (event) => {
  if (event.tag === "nuevo-post") {
    // Cuando hay conexion, postear
    const respuesta = postearMensajes();
    event.waitUntil(respuesta);
  }
});

// Escuchar Push
self.addEventListener("push", (event) => {
  const data = JSON.parse(event.data.text());

  const title = data.titulo;
  const options = {
    body: data.cuerpo,
    // icon:'img/icons/icon-72x72.png'
    icon: `img/avatars/${data.usuario}.jpg`,
    badge: "img/favicon.ico",
    image: "https://picsum.photos/1000/1000",
    vibrate: [
      125, 75, 125, 275, 200, 275, 125, 75, 125, 275, 200, 600, 200, 600,
    ],
    openUrl: "/",
    data: {
      // url: "https://google.com",
      url: "/",
      id: data.user,
    },
    actions: [
      {
        action: "thor-action",
        title: "Thor",
        icon: "img/avatar/thor.jpg",
      },
      {
        action: "spiderman-action",
        title: "spiderman",
        icon: "img/avatar/spiderman.jpg",
      },
    ],
  };
  console.log(options, "Tenemos las opciones");
  event.waitUntil(self.registration.showNotification(title, options));
});

// Cierra la notificacion
self.addEventListener("notificationclose", (event) => {
  console.log("Notificacion cerrada", event);
});

// Dandole click a la notificacion
// Dandole click a la notificacion
self.addEventListener("notificationclick", (event) => {
  console.log("Se dio click a la notificacion", event);
  const notification = event.notification;
  const action = event.action;

  const respuesta = clients.matchAll().then((clientes) => {
    let cliente = clientes.find((cliente) => {
      return cliente.visibilityState === "visible";
    });
    if (cliente !== undefined) {
      cliente.navigate(notification.data.url);
      cliente.focus();
    } else {
      clients.openWindow(notification.data.url);
    }
    return notification.close();
  });
  event.waitUntil(respuesta);
});