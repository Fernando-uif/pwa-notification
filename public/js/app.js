var url = window.location.href;
var swLocation = "/twittor/sw.js";
let swReg;
if (navigator.serviceWorker) {
  if (url.includes("localhost")) {
    swLocation = "/sw.js";
  }
  window.addEventListener("load", () => {
    console.log("Ya cargo todo");
    navigator.serviceWorker.register(swLocation).then(function (reg) {
      swReg = reg;

      swReg.pushManager.getSubscription().then(verificaSuscripcion);
    });
  });
}

// Referencias de jQuery

var titulo = $("#titulo");
var nuevoBtn = $("#nuevo-btn");
var salirBtn = $("#salir-btn");
var cancelarBtn = $("#cancel-btn");
var postBtn = $("#post-btn");
var avatarSel = $("#seleccion");
var timeline = $("#timeline");

var modal = $("#modal");
var modalAvatar = $("#modal-avatar");
var avatarBtns = $(".seleccion-avatar");
var txtMensaje = $("#txtMensaje");
const btnActivadas = $(".btn-noti-activadas");
const btnDesactivadas = $(".btn-noti-desactivadas");

// El usuario, contiene el ID del hÃ©roe seleccionado
var usuario;

// ===== Codigo de la aplicaciÃ³n

function crearMensajeHTML(mensaje, personaje) {
  var content = `
    <li class="animated fadeIn fast">
        <div class="avatar">
            <img src="img/avatars/${personaje}.jpg">
        </div>
        <div class="bubble-container">
            <div class="bubble">
                <h3>@${personaje}</h3>
                <br/>
                ${mensaje}
            </div>
            
            <div class="arrow"></div>
        </div>
    </li>
    `;

  timeline.prepend(content);
  cancelarBtn.click();
}

// Globals
function logIn(ingreso) {
  if (ingreso) {
    nuevoBtn.removeClass("oculto");
    salirBtn.removeClass("oculto");
    timeline.removeClass("oculto");
    avatarSel.addClass("oculto");
    modalAvatar.attr("src", "img/avatars/" + usuario + ".jpg");
  } else {
    nuevoBtn.addClass("oculto");
    salirBtn.addClass("oculto");
    timeline.addClass("oculto");
    avatarSel.removeClass("oculto");

    titulo.text("Seleccione Personaje");
  }
}

// Seleccion de personaje
avatarBtns.on("click", function () {
  usuario = $(this).data("user");

  titulo.text("@" + usuario);

  logIn(true);
});

// Boton de salir
salirBtn.on("click", function () {
  logIn(false);
});

// Boton de nuevo mensaje
nuevoBtn.on("click", function () {
  modal.removeClass("oculto");
  modal.animate(
    {
      marginTop: "-=1000px",
      opacity: 1,
    },
    200
  );
});

// Boton de cancelar mensaje
cancelarBtn.on("click", function () {
  if (!modal.hasClass("oculto")) {
    modal.animate(
      {
        marginTop: "+=1000px",
        opacity: 0,
      },
      200,
      function () {
        modal.addClass("oculto");
        txtMensaje.val("");
      }
    );
  }
});

// Boton de enviar mensaje
postBtn.on("click", function () {
  var mensaje = txtMensaje.val();
  if (mensaje.length === 0) {
    cancelarBtn.click();
    return;
  }
  let data = {
    mensaje,
    user: usuario,
  };

  fetch("api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => console.log("app.js", data));
  crearMensajeHTML(mensaje, usuario);
});

// Obtener mensajes del servidor
const getMensajes = async () => {
  return fetch("http://localhost:3000/api")
    .then((response) => response.json())
    .then((data) => {
      data.forEach((post) => {
        crearMensajeHTML(post.mensaje, post.user);
      });
    });
};

// Detectar cambios de conexion
const isOnline = () => {
  if (navigator.onLine) {
    mdtoast.success("Online", { duration: 1000 });
  } else {
    // No tenemos cone
    mdtoast.error("Offline", { duration: 1000 });
  }
};

window.addEventListener("online", isOnline);
window.addEventListener("offline", isOnline);

isOnline();

const enviarNotificacion = () => {
  const notificationOpts = {
    body: "Este es el cuarpo de la notificacion",
    icon: "https://picsum.photos/200/300",
  };
  const notifi = new Notification("Hola mundo", notificationOpts);
  notifi.onclick = () => {
    console.log("Click a la notificacion");
  };
};

// Notificaciones
const verificaSuscripcion = (activadas) => {
  console.log(activadas,'Tenemos activadas');
  if (activadas) {
    btnActivadas.removeClass("oculto");
    btnDesactivadas.addClass("oculto");
  } else {
    btnActivadas.addClass("oculto");
    btnDesactivadas.removeClass("oculto");
  }
};

const notificarme = () => {
  if (!window.Notification) {
    console.log("Este navegador no soporta notificacione");
    return;
  }
  if (Notification.permission === "granted") {
    console.log(Notification, Notification.permission);
    enviarNotificacion();
  } else if (
    Notification.permission !== "denied" ||
    Notification.permission === "default"
  ) {
    Notification.requestPermission(function (permission) {
      console.log(permission);
      if (permission === "granted") {
        enviarNotificacion();
      }
    });
  }
};
// notificarme();
// verificaSuscripcion();

// Get Key
const getPublicKey = () => {
  return fetch("api/key")
    .then((res) => res.arrayBuffer())
    .then((key) => new Uint8Array(key));
};
// getPublicKey().then(console.log);
btnDesactivadas.on("click", function () {
  if (!swReg) return console.log("No hay registro del SW");
  getPublicKey().then(function (key) {
    console.log(key, "Tenemos la key");
    swReg.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: key,
      })
      .then(function (res) {
        return res.toJSON();
      })
      .then(function (suscription) {
        fetch("api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(suscription),
        })
          .then(verificaSuscripcion)
          .catch(console.log);
      });
  });
});
