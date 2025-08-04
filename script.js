let sonido_ganador = new Audio("sonido_ganador.ogg");
let sonido_win = new Audio("sonido_win.ogg");
let sonido_perdedor = new Audio("sonido_perdedor.ogg");
let sonido_gameover = new Audio("sonido_gameover.ogg");
let sonido_descubrir = new Audio("sonido_descubrir.ogg");
let sonido_juegonuevo = new Audio("sonido_nuevojuego.ogg");
let sonido_abrirarea = new Audio("sonido_abrirarea.ogg");
let sonido_marca = new Audio("sonido_marca.ogg");

let filas = 20;
let columnas = 20;
let lado = 30; 

let marcas = 0;

let minas = 40; 

let tablero = [];

let enJuego = true;
let juegoIniciado = false;

let historial = {
  jugadas: 0,
  ganadas: 0,
  perdidas: 0,
};

window.onload = function () {
  cargarHistorial();
  cargarEstadoPartida();
  nuevoJuego(false); 
};

function nuevoJuego(crearNueva = true) {
  if (crearNueva) {
    sonido_juegonuevo.play();
    reiniciarVariables();
    generarTableroHTML(); 
    generarTableroJuego(); 
    añadirEventos(); 
    refrescarTablero();
    guardarEstadoPartida(); 
  } else {
    if (sessionStorage.getItem("estadoTablero")) {
      tablero = JSON.parse(sessionStorage.getItem("estadoTablero"));
      filas = parseInt(sessionStorage.getItem("filas"));
      columnas = parseInt(sessionStorage.getItem("columnas"));
      minas = parseInt(sessionStorage.getItem("minas"));
      marcas = parseInt(sessionStorage.getItem("marcas"));
      enJuego = sessionStorage.getItem("enJuego") === "true";
      juegoIniciado = sessionStorage.getItem("juegoIniciado") === "true";

      generarTableroHTML();
      añadirEventos();
      refrescarTablero();

      actualizarPanelMinas();
    } else {
      nuevoJuego(true);
    }
  }
}

function reiniciarVariables() {
  marcas = 0;
  enJuego = true;
  juegoIniciado = false;
}

function generarTableroHTML() {
  let html = "";
  for (let f = 0; f < filas; f++) {
    html += `<tr>`;
    for (let c = 0; c < columnas; c++) {
      html += `<td id="celda-${c}-${f}" style="width:${lado}px;height:${lado}px"></td>`;
    }
    html += `</tr>`;
  }
  let tableroHTML = document.getElementById("tablero");
  tableroHTML.innerHTML = html;
  tableroHTML.style.width = columnas * lado + "px";
  tableroHTML.style.height = filas * lado + "px";
  tableroHTML.style.background = "#3b3b5a"; 
}

function añadirEventos() {
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      let celda = document.getElementById(`celda-${c}-${f}`);
      celda.oncontextmenu = (e) => e.preventDefault(); 
      celda.addEventListener("dblclick", function (me) {
        dobleClic(celda, c, f, me);
      });
      celda.addEventListener("mouseup", function (me) {
        clicSimple(celda, c, f, me);
      });
    }
  }
}

function dobleClic(celda, c, f, me) {
  if (!enJuego) return;

  abrirArea(c, f);
  refrescarTablero();
}

function clicSimple(celda, c, f, me) {
  if (!enJuego) return;

  if (tablero[c][f].estado === "descubierto") return;

  switch (me.button) {
    case 0: 
      if (tablero[c][f].estado === "marcado") break;

      while (!juegoIniciado && tablero[c][f].valor === -1) {
        generarTableroJuego();
      }

      tablero[c][f].estado = "descubierto";
      sonido_descubrir.play();
      juegoIniciado = true;

      if (tablero[c][f].valor === 0) abrirArea(c, f);
      break;

    case 2: 
      if (tablero[c][f].estado === "marcado") {
        tablero[c][f].estado = undefined;
        marcas--;
      } else {
        tablero[c][f].estado = "marcado";
        marcas++;
      }
      sonido_marca.play();
      break;
  }
  refrescarTablero();
}

function abrirArea(c, f) {
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      try {
        if (
          tablero[c + i][f + j].estado !== "descubierto" &&
          tablero[c + i][f + j].estado !== "marcado"
        ) {
          tablero[c + i][f + j].estado = "descubierto";
          sonido_abrirarea.play();
          if (tablero[c + i][f + j].valor === 0) abrirArea(c + i, f + j);
        }
      } catch (e) {}
    }
  }
}

function refrescarTablero() {
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      let celda = document.getElementById(`celda-${c}-${f}`);

      celda.classList.remove("celda-descubierta");

      if (tablero[c][f].estado === "descubierto") {
        celda.classList.add("celda-descubierta");
        celda.style.boxShadow = "none";

        switch (tablero[c][f].valor) {
          case -1:
            celda.innerHTML = `<i class="fas fa-bomb"></i>`;
            celda.style.color = "black";
            celda.style.background = "white";
            break;
          case 0:
            celda.innerHTML = "";
            break;
          default:
            celda.innerHTML = tablero[c][f].valor;
            celda.style.color = getColorPorNumero(tablero[c][f].valor);
            break;
        }
      } else if (tablero[c][f].estado === "marcado") {
        celda.innerHTML = `<i class="fas fa-flag"></i>`;
        celda.style.background = "cadetblue";
        celda.style.color = "black";
      } else {
        celda.innerHTML = "";
        celda.style.background = "";
        celda.style.boxShadow = "";
      }
    }
  }
  verificarGanador();
  verificarPerdedor();
  actualizarPanelMinas();

  guardarEstadoPartida();
}

function getColorPorNumero(num) {
  const colores = {
    1: "blue",
    2: "green",
    3: "red",
    4: "navy",
    5: "maroon",
    6: "turquoise",
    7: "black",
    8: "gray",
  };
  return colores[num] || "black";
}

function actualizarPanelMinas() {
  const panel = document.getElementById("minas");
  panel.innerHTML = minas - marcas;
}

function verificarGanador() {
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (tablero[c][f].estado !== "descubierto") {
        if (tablero[c][f].valor === -1) continue;
        else return;
      }
    }
  }
  const tableroHTML = document.getElementById("tablero");
  tableroHTML.style.background = "green";
  enJuego = false;
  sonido_ganador.play();
  sonido_win.play();

  actualizarHistorialGanadas();

  limpiarPartidaGuardada();
}

function verificarPerdedor() {
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (
        tablero[c][f].valor === -1 &&
        tablero[c][f].estado === "descubierto"
      ) {
        const tableroHTML = document.getElementById("tablero");
        tableroHTML.style.background = "red";
        enJuego = false;
        sonido_perdedor.play();
        sonido_gameover.play();

        actualizarHistorialPerdidas();

        limpiarPartidaGuardada();
      }
    }
  }
  if (enJuego) return;

  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (tablero[c][f].valor === -1) {
        let celda = document.getElementById(`celda-${c}-${f}`);
        if (celda) {
          celda.innerHTML = `<i class="fas fa-bomb"></i>`;
          celda.style.color = "black";
          celda.style.background = "white";
        }
      }
    }
  }
}

function vaciarTablero() {
  tablero = [];
  for (let c = 0; c < columnas; c++) {
    tablero.push([]);
  }
}

function ponerMinas() {
  let minasColocadas = 0;
  while (minasColocadas < minas) {
    let c = Math.floor(Math.random() * columnas);
    let f = Math.floor(Math.random() * filas);
    if (!tablero[c][f]) {
      tablero[c][f] = { valor: -1 };
      minasColocadas++;
    }
  }
}

function contadoresMinas() {
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (!tablero[c][f]) {
        let contador = 0;
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            try {
              if (tablero[c + i][f + j].valor === -1) {
                contador++;
              }
            } catch (e) {}
          }
        }
        tablero[c][f] = { valor: contador };
      }
    }
  }
}

function generarTableroJuego() {
  vaciarTablero();
  ponerMinas();
  contadoresMinas();
}

function guardarEstadoPartida() {
  sessionStorage.setItem("estadoTablero", JSON.stringify(tablero));
  sessionStorage.setItem("filas", filas);
  sessionStorage.setItem("columnas", columnas);
  sessionStorage.setItem("minas", minas);
  sessionStorage.setItem("marcas", marcas);
  sessionStorage.setItem("enJuego", enJuego);
  sessionStorage.setItem("juegoIniciado", juegoIniciado);
}

function cargarEstadoPartida() {
  if (sessionStorage.getItem("estadoTablero")) {
    tablero = JSON.parse(sessionStorage.getItem("estadoTablero"));
    filas = parseInt(sessionStorage.getItem("filas"));
    columnas = parseInt(sessionStorage.getItem("columnas"));
    minas = parseInt(sessionStorage.getItem("minas"));
    marcas = parseInt(sessionStorage.getItem("marcas"));
    enJuego = sessionStorage.getItem("enJuego") === "true";
    juegoIniciado = sessionStorage.getItem("juegoIniciado") === "true";
  }
}

function limpiarPartidaGuardada() {
  sessionStorage.removeItem("estadoTablero");
  sessionStorage.removeItem("filas");
  sessionStorage.removeItem("columnas");
  sessionStorage.removeItem("minas");
  sessionStorage.removeItem("marcas");
  sessionStorage.removeItem("enJuego");
  sessionStorage.removeItem("juegoIniciado");
}

function guardarHistorial() {
  localStorage.setItem("historialBuscaminas", JSON.stringify(historial));
}

function cargarHistorial() {
  const datos = localStorage.getItem("historialBuscaminas");
  if (datos) {
    historial = JSON.parse(datos);
  }
  mostrarHistorialEnUI();
}

function actualizarHistorialGanadas() {
  historial.jugadas++;
  historial.ganadas++;
  guardarHistorial();
  mostrarHistorialEnUI();
}

function actualizarHistorialPerdidas() {
  historial.jugadas++;
  historial.perdidas++;
  guardarHistorial();
  mostrarHistorialEnUI();
}

function mostrarHistorialEnUI() {
  let contenedor = document.getElementById("historial");
  if (!contenedor) {
    contenedor = document.createElement("div");
    contenedor.id = "historial";
    contenedor.style.marginTop = "10px";
    contenedor.style.color = "white";
    document.body.insertBefore(
      contenedor,
      document.getElementById("tablero").parentElement.nextSibling
    );
  }
  contenedor.innerHTML = `
    <strong>Historial:</strong> Jugadas: ${historial.jugadas}, Ganadas: ${historial.ganadas}, Perdidas: ${historial.perdidas}
  `;
}

async function ajustes() {
  const { value: ajustes } = await Swal.fire({
    title: "Ajustes",
    html: `
      Dificultad &nbsp; (minas/área)
      <br/><br/>
      <input onchange="cambiarValor()" oninput="this.onchange()" id="dificultad" type="range" min="10" max="40" step="1" value="${Math.floor(
        (100 * minas) / (filas * columnas)
      )}" />
      <span id="valor-dificultad">${Math.floor(
        (100 * minas) / (filas * columnas)
      )}%</span>
      <br/><br/>
      Filas
      <br/>
      <input class="swal2-input" type="number" value=${filas} placeholder="filas" id="filas" min="10" max="1000" step="1" />
      <br/>
      Columnas
      <br/>
      <input class="swal2-input" type="number" value=${columnas} placeholder="columnas" id="columnas" min="10" max="1000" step="1" />
      <br/>
    `,
    confirmButtonText: "Establecer",
    cancelButtonText: "Cancelar",
    showCancelButton: true,
    preConfirm: () => {
      return {
        columnas: document.getElementById("columnas").value,
        filas: document.getElementById("filas").value,
        dificultad: document.getElementById("dificultad").value,
      };
    },
  });
  if (!ajustes) {
    return;
  }
  filas = Math.floor(ajustes.filas);
  columnas = Math.floor(ajustes.columnas);
  minas = Math.floor((columnas * filas * ajustes.dificultad) / 100);
  nuevoJuego();
}

function cambiarValor() {
  let slider = document.getElementById("dificultad");
  let valor = document.getElementById("valor-dificultad");
  if (slider && valor) {
    valor.textContent = slider.value + "%";
  }
}
