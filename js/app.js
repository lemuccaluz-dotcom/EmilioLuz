let participantes = [];

/* ════════════════════════════════════════
   2. TIPO DE EVENTO
════════════════════════════════════════ */
function initTipoEvento() {
  const btns = document.querySelectorAll(".tipo-btn");
  const inputCelebracion = document.getElementById("celebracion");

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // desmarcar todos
      btns.forEach((b) => b.classList.remove("activo"));
      btn.classList.add("activo");

      const tipo = btn.dataset.tipo;
      if (tipo === "otro") {
        // limpiar para que el usuario escriba libremente
        inputCelebracion.value = "";
        inputCelebracion.placeholder = "Escribe el nombre de tu celebración…";
        inputCelebracion.focus();
      } else {
        inputCelebracion.value = tipo;
        inputCelebracion.placeholder =
          "Nombre de la celebración (puedes editarlo)";
      }
    });
  });
}

/* ════════════════════════════════════════
   3. FECHA CON SUGERENCIAS
════════════════════════════════════════ */
function initFechaChips() {
  const container = document.getElementById("fechaChips");
  const inputFecha = document.getElementById("fecha");
  if (!container || !inputFecha) return;

  // generar 3 fechas cercanas (próximos sábados)
  const sugerencias = proximosSabados(3);

  sugerencias.forEach(({ etiqueta, valor }) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "fecha-chip";
    chip.textContent = etiqueta;
    chip.dataset.valor = valor;

    chip.addEventListener("click", () => {
      // desmarcar todos
      container
        .querySelectorAll(".fecha-chip")
        .forEach((c) => c.classList.remove("activo"));
      chip.classList.add("activo");
      inputFecha.value = valor;
    });

    container.appendChild(chip);
  });

  // si el usuario escoge fecha manual, desmarcar chips
  inputFecha.addEventListener("change", () => {
    container.querySelectorAll(".fecha-chip").forEach((c) => {
      c.classList.toggle("activo", c.dataset.valor === inputFecha.value);
    });
  });
}

/** Devuelve los próximos N sábados desde hoy */
function proximosSabados(n) {
  const resultados = [];
  const hoy = new Date();
  // empezar buscando desde mañana
  const d = new Date(hoy);
  d.setDate(d.getDate() + 1);

  const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const meses = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];

  while (resultados.length < n) {
    if (d.getDay() === 6) {
      // sábado
      const valor = d.toISOString().split("T")[0]; // YYYY-MM-DD
      const etiqueta = `${dias[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}`;
      resultados.push({ etiqueta, valor });
    }
    d.setDate(d.getDate() + 1);
  }
  return resultados;
}

/* ════════════════════════════════════════
   4. PRESUPUESTO CON OPCIONES
════════════════════════════════════════ */
function initPresupuesto() {
  const btns = document.querySelectorAll(".presup-btn");
  const btnOtro = document.getElementById("btnPresupOtro");
  const inputMonto = document.getElementById("presupuesto");
  if (!btnOtro || !inputMonto) return;

  btns.forEach((btn) => {
    if (btn.id === "btnPresupOtro") return; // se maneja aparte

    btn.addEventListener("click", () => {
      btns.forEach((b) => b.classList.remove("activo"));
      btn.classList.add("activo");

      inputMonto.value = btn.dataset.monto;
      inputMonto.classList.add("d-none");
    });
  });

  btnOtro.addEventListener("click", () => {
    btns.forEach((b) => b.classList.remove("activo"));
    btnOtro.classList.add("activo");

    inputMonto.value = "";
    inputMonto.classList.remove("d-none");
    inputMonto.focus();
  });

  // si el usuario escribe en el input, asegurarse de que "Otro" esté activo
  inputMonto.addEventListener("input", () => {
    if (!inputMonto.classList.contains("d-none")) {
      btns.forEach((b) => b.classList.remove("activo"));
      btnOtro.classList.add("activo");
    }
  });
}

/* ════════════════════════════════════════
   PARTICIPANTES
════════════════════════════════════════ */
function agregarParticipante() {
  const input = document.getElementById("participante");
  const nombre = (input.value || "").trim();

  if (!nombre) {
    toastWarn("Escribe un nombre antes de agregar.");
    return;
  }
  if (participantes.includes(nombre)) {
    toastWarn(`"${nombre}" ya está en la lista.`);
    return;
  }

  participantes.push(nombre);
  input.value = "";

  renderParticipantes();
  renderExclusiones();
  toastInfo(`${nombre} agregado.`, "Participante");
}

function eliminarParticipante(index) {
  const nombre = participantes[index];
  participantes.splice(index, 1);

  const excl = obtenerExclusionesUI();
  delete excl[nombre];
  for (const key in excl) {
    excl[key] = excl[key].filter((n) => n !== nombre);
  }

  renderParticipantes();
  renderExclusiones();
}

function renderParticipantes() {
  const lista = document.getElementById("lista");
  if (!lista) return;
  lista.innerHTML = "";

  participantes.forEach((nombre, index) => {
    const li = document.createElement("li");
    li.className = "list-group-item dnd-item";
    li.setAttribute("draggable", "true");
    li.dataset.index = index;

    const span = document.createElement("span");
    span.innerText = nombre;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-sm btn-outline-danger";
    btn.innerText = "✕";
    btn.onclick = () => eliminarParticipante(index);

    li.appendChild(span);
    li.appendChild(btn);

    li.addEventListener("dragstart", onDragStart);
    li.addEventListener("dragover", onDragOver);
    li.addEventListener("drop", onDrop);
    li.addEventListener("dragleave", onDragLeave);

    lista.appendChild(li);
  });
}

/* ── Drag & Drop ── */
let dragFromIndex = null;

function onDragStart(e) {
  dragFromIndex = Number(e.currentTarget.dataset.index);
  e.dataTransfer.effectAllowed = "move";
}
function onDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add("dnd-over");
}
function onDragLeave(e) {
  e.currentTarget.classList.remove("dnd-over");
}
function onDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove("dnd-over");

  const dragToIndex = Number(e.currentTarget.dataset.index);
  if (dragFromIndex === null || dragFromIndex === dragToIndex) return;

  const item = participantes.splice(dragFromIndex, 1)[0];
  participantes.splice(dragToIndex, 0, item);
  dragFromIndex = null;

  renderParticipantes();
  renderExclusiones();
}

/* ════════════════════════════════════════
   EXCLUSIONES
════════════════════════════════════════ */
function toggleExclusiones(activar) {
  const panel = document.getElementById("panelExclusiones");
  const btnNo = document.getElementById("btnExclNo");
  const btnSi = document.getElementById("btnExclSi");
  if (!panel) return;

  if (activar) {
    panel.classList.remove("d-none");
    btnSi.classList.add("active");
    btnNo.classList.remove("active");
    renderExclusiones();
  } else {
    panel.classList.add("d-none");
    btnNo.classList.add("active");
    btnSi.classList.remove("active");
  }
}

/**
 * Devuelve la lista completa de personas para exclusiones:
 * participantes normales + organizador si "Inclúyeme" está activo.
 * El organizador aparece primero con etiqueta especial.
 */
function getListaParaExclusiones() {
  const chk = document.getElementById("incluirOrganizador");
  const org = (document.getElementById("organizador")?.value || "").trim();
  const incluir = chk?.checked && org;

  // { nombre, esOrganizador }
  const lista = participantes.map((p) => ({ nombre: p, esOrganizador: false }));

  if (incluir && !participantes.includes(org)) {
    lista.unshift({ nombre: org, esOrganizador: true });
  }

  return lista;
}

function renderExclusiones() {
  const contenedor = document.getElementById("listaExclusiones");
  if (!contenedor) return;
  if (contenedor.closest(".d-none")) return;

  const exclActual = obtenerExclusionesUI();
  contenedor.innerHTML = "";

  const lista = getListaParaExclusiones();

  if (lista.length < 2) {
    contenedor.innerHTML = `<p class="helper">Agrega al menos 2 participantes para definir exclusiones.</p>`;
    return;
  }

  lista.forEach(({ nombre: persona, esOrganizador }) => {
    const otros = lista
      .filter((p) => p.nombre !== persona)
      .map((p) => p.nombre);

    const bloque = document.createElement("div");
    bloque.className = "exclusion-bloque mb-3 p-3 border rounded-3";

    // etiqueta: badge azul normal o badge verde "organizador"
    const badgeHTML = esOrganizador
      ? `<span class="badge-soft badge-org">👑 ${persona} (organizador)</span>`
      : `<span class="badge-soft">${persona}</span>`;

    const titulo = document.createElement("div");
    titulo.className = "fw-semibold mb-2";
    titulo.innerHTML = `${badgeHTML} no le puede regalar a:`;
    bloque.appendChild(titulo);

    const wrap = document.createElement("div");
    wrap.className = "d-flex flex-wrap gap-2";

    otros.forEach((otro) => {
      const marcado = (exclActual[persona] || []).includes(otro);

      const label = document.createElement("label");
      label.className = "exclusion-check";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.dataset.persona = persona;
      cb.dataset.otro = otro;
      cb.checked = marcado;
      cb.className = "form-check-input me-1";

      label.appendChild(cb);
      label.appendChild(document.createTextNode(otro));
      wrap.appendChild(label);
    });

    bloque.appendChild(wrap);
    contenedor.appendChild(bloque);
  });
}

function obtenerExclusionesUI() {
  // inicializar entradas para todos (incluyendo organizador si aplica)
  const resultado = {};
  getListaParaExclusiones().forEach(({ nombre }) => (resultado[nombre] = []));

  document
    .querySelectorAll("#listaExclusiones input[type='checkbox']")
    .forEach((cb) => {
      if (cb.checked && cb.dataset.persona && cb.dataset.otro) {
        if (!resultado[cb.dataset.persona]) resultado[cb.dataset.persona] = [];
        resultado[cb.dataset.persona].push(cb.dataset.otro);
      }
    });

  return resultado;
}

/* ════════════════════════════════════════
   GUARDAR EVENTO
════════════════════════════════════════ */
function guardarEvento() {
  const organizador = (
    document.getElementById("organizador").value || ""
  ).trim();
  const celebracion = (
    document.getElementById("celebracion").value || ""
  ).trim();
  const fecha = document.getElementById("fecha").value;
  const presupuesto = (
    document.getElementById("presupuesto").value || ""
  ).trim();

  if (!organizador) {
    toastWarn("Escribe el nombre del organizador.");
    return;
  }
  if (!celebracion) {
    toastWarn("Selecciona o escribe el tipo de celebración.");
    return;
  }
  if (!fecha) {
    toastWarn("Selecciona la fecha del evento.");
    return;
  }
  if (!presupuesto || Number(presupuesto) <= 0) {
    toastWarn("Selecciona o escribe el presupuesto por persona.");
    return;
  }

  // ── 1. Manejar checkbox incluir organizador ──
  const incluir = document.getElementById("incluirOrganizador")?.checked;
  let listaFinal = [...participantes];

  if (incluir && !listaFinal.includes(organizador)) {
    listaFinal.unshift(organizador); // agregar al inicio
  }

  if (listaFinal.length < 2) {
    toastWarn(
      "Agrega mínimo 2 participantes (o activa 'Inclúyeme en el sorteo').",
    );
    return;
  }

  // ── 2. Validar exclusiones ──
  const excl = obtenerExclusionesUI();

  // si el organizador se incluyó, agregar su entrada en exclusiones si no existe
  if (incluir && !excl[organizador]) {
    excl[organizador] = [];
  }

  const problema = validarExclusiones(listaFinal, excl);
  if (problema) {
    toastError(`${problema} Reduce las exclusiones.`, "Exclusión imposible");
    return;
  }

  const evento = {
    organizador,
    celebracion,
    fecha,
    presupuesto,
    participantes: listaFinal,
    incluirOrganizador: incluir,
  };
  saveEvento(evento);
  saveExclusiones(excl);

  toastOk("Evento guardado correctamente. Redirigiendo al sorteo…");
  setTimeout(() => {
    window.location = "sorteo.html";
  }, 1600);
}

function validarExclusiones(parts, excl) {
  for (const persona of parts) {
    const excluidos = excl[persona] || [];
    const posibles = parts.filter(
      (p) => p !== persona && !excluidos.includes(p),
    );
    if (posibles.length === 0) {
      return `"${persona}" tiene a todos excluidos y no puede regalarle a nadie.`;
    }
  }
  return null;
}

/* ════════════════════════════════════════
   VER DATOS DEL EVENTO (LocalStorage)
════════════════════════════════════════ */
function verEventoDesdeLocalStorage() {
  const evento = getEvento();
  const excl = getExclusiones();
  const panel = document.getElementById("panelEvento");
  if (!panel) return;

  if (!evento) {
    panel.innerHTML = `<div class="helper">No hay evento guardado en LocalStorage.</div>`;
    return;
  }

  const participantesHTML = (evento.participantes || [])
    .map((p) => `<li class="list-group-item">${p}</li>`)
    .join("");

  const hayExcl = Object.values(excl).some((arr) => arr.length > 0);
  const exclHTML = hayExcl
    ? Object.entries(excl)
        .filter(([, arr]) => arr.length > 0)
        .map(
          ([persona, arr]) =>
            `<li class="list-group-item"><b>${persona}</b> no le regala a: ${arr.join(", ")}</li>`,
        )
        .join("")
    : `<li class="list-group-item helper">Sin exclusiones</li>`;

  panel.innerHTML = `
    <div class="mb-2"><span class="badge-soft">Organizador</span> ${evento.organizador || "-"}
      ${evento.incluirOrganizador ? '<span class="ms-1 badge-soft" style="background:rgba(34,197,94,.12);color:#15803d;border-color:rgba(34,197,94,.3)">participa</span>' : ""}
    </div>
    <div class="mb-2"><span class="badge-soft">Celebración</span> ${evento.celebracion || "-"}</div>
    <div class="mb-2"><span class="badge-soft">Fecha</span> ${evento.fecha || "-"}</div>
    <div class="mb-3"><span class="badge-soft">Presupuesto</span> $${evento.presupuesto || "-"}</div>
    <div class="mb-1"><b>Participantes</b></div>
    <ul class="list-group mb-3">${participantesHTML || `<li class="list-group-item">Sin participantes</li>`}</ul>
    <div class="mb-1"><b>Exclusiones</b></div>
    <ul class="list-group">${exclHTML}</ul>
  `;
}

/* ════════════════════════════════════════
   INIT — cargar datos si ya existe evento
════════════════════════════════════════ */
function cargarEventoSiExiste() {
  const evento = getEvento();
  if (!evento) return;

  // campos de texto
  const mapCampos = {
    organizador: "organizador",
    celebracion: "celebracion",
    fecha: "fecha",
  };
  for (const [id, key] of Object.entries(mapCampos)) {
    const el = document.getElementById(id);
    if (el) el.value = evento[key] || "";
  }

  // checkbox incluir organizador
  const chk = document.getElementById("incluirOrganizador");
  if (chk) chk.checked = !!evento.incluirOrganizador;

  // restaurar tipo de evento seleccionado
  if (evento.celebracion) {
    document.querySelectorAll(".tipo-btn").forEach((btn) => {
      if (btn.dataset.tipo === evento.celebracion) {
        btn.classList.add("activo");
      }
    });
  }

  // restaurar fecha chip
  if (evento.fecha) {
    document.querySelectorAll(".fecha-chip").forEach((chip) => {
      chip.classList.toggle("activo", chip.dataset.valor === evento.fecha);
    });
  }

  // restaurar presupuesto
  if (evento.presupuesto) {
    const inputMonto = document.getElementById("presupuesto");
    const btnOtro = document.getElementById("btnPresupOtro");
    let encontrado = false;

    document.querySelectorAll(".presup-btn[data-monto]").forEach((btn) => {
      if (btn.dataset.monto === evento.presupuesto) {
        btn.classList.add("activo");
        inputMonto.value = evento.presupuesto;
        inputMonto.classList.add("d-none");
        encontrado = true;
      }
    });

    if (!encontrado && btnOtro) {
      btnOtro.classList.add("activo");
      inputMonto.value = evento.presupuesto;
      inputMonto.classList.remove("d-none");
    }
  }

  // participantes
  if (Array.isArray(evento.participantes)) {
    // si el organizador se incluyó, no lo ponemos en la lista editable
    const org = evento.organizador || "";
    participantes = evento.incluirOrganizador
      ? evento.participantes.filter((p) => p !== org)
      : [...evento.participantes];
  }

  renderParticipantes();
  verEventoDesdeLocalStorage();

  // exclusiones
  const exclGuardadas = getExclusiones();
  if (Object.values(exclGuardadas).some((arr) => arr.length > 0)) {
    toggleExclusiones(true);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initTipoEvento();
  initFechaChips();
  initPresupuesto();
  cargarEventoSiExiste();
  renderParticipantes();

  // re-renderizar exclusiones cuando cambia el nombre del organizador o el checkbox
  const chkOrg = document.getElementById("incluirOrganizador");
  const inpOrg = document.getElementById("organizador");

  chkOrg?.addEventListener("change", () => {
    const panel = document.getElementById("panelExclusiones");
    if (panel && !panel.classList.contains("d-none")) renderExclusiones();
  });

  inpOrg?.addEventListener("input", () => {
    const panel = document.getElementById("panelExclusiones");
    const chk = document.getElementById("incluirOrganizador");
    if (panel && !panel.classList.contains("d-none") && chk?.checked)
      renderExclusiones();
  });
});
