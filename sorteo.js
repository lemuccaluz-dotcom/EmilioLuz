/* ════════════════════════════════════════
   SORTEO — respeta exclusiones desde LocalStorage
════════════════════════════════════════ */

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Genera el sorteo respetando:
 *  - Nadie se auto-regala
 *  - Se respetan todas las exclusiones { "Lalo": ["Emilio"] }
 *
 * Usa fuerza bruta con límite de intentos (suficiente para grupos pequeños).
 */
function generarSorteo(participantes, exclusiones, maxIntentos = 5000) {
  if (participantes.length < 2) return null;

  for (let intento = 0; intento < maxIntentos; intento++) {
    const receptores = shuffle([...participantes]);
    let valido = true;

    for (let i = 0; i < participantes.length; i++) {
      const quienDa = participantes[i];
      const quienRecibe = receptores[i];

      // regla 1: no auto-regalo
      if (quienDa === quienRecibe) {
        valido = false;
        break;
      }

      // regla 2: respetar exclusiones
      const excluidos = exclusiones[quienDa] || [];
      if (excluidos.includes(quienRecibe)) {
        valido = false;
        break;
      }
    }

    if (valido) {
      return participantes.map((quienDa, i) => ({
        quienDa,
        quienRecibe: receptores[i],
      }));
    }
  }

  return null; // no encontró solución válida
}

/* ── UI ── */
function pintarResumenEvento(evento, exclusiones) {
  const box = document.getElementById("resumenEvento");
  if (!box) return;

  const hayExcl = Object.values(exclusiones).some((arr) => arr.length > 0);
  let exclHTML = "";

  if (hayExcl) {
    exclHTML = `
      <div class="mt-2"><b>Exclusiones:</b></div>
      <ul class="list-group mt-1">
        ${Object.entries(exclusiones)
          .filter(([, arr]) => arr.length > 0)
          .map(
            ([p, arr]) =>
              `<li class="list-group-item py-1 px-2" style="font-size:.9rem">
              <b>${p}</b> no le regala a: ${arr.join(", ")}
            </li>`,
          )
          .join("")}
      </ul>`;
  }

  box.innerHTML = `
    <div class="mb-1"><span class="badge-soft">Organizador</span> ${evento.organizador || "-"}</div>
    <div class="mb-1"><span class="badge-soft">Celebración</span> ${evento.celebracion || "-"}</div>
    <div class="mb-1"><span class="badge-soft">Fecha</span>       ${evento.fecha || "-"}</div>
    <div class="mb-1"><span class="badge-soft">Presupuesto</span> $${evento.presupuesto || "-"}</div>
    <div class="mb-1"><span class="badge-soft">Participantes</span>
      ${(evento.participantes || []).join(", ")}
    </div>
    ${exclHTML}
  `;
}

function sortear() {
  const evento = ensureEventoOrRedirect();
  if (!evento) return;
  const exclusiones = getExclusiones();
  const participantes = evento.participantes || [];

  const resultado = document.getElementById("resultado");
  resultado.innerHTML = "";

  const pares = generarSorteo(participantes, exclusiones);

  if (!pares) {
    toastError(
      "No se pudo generar el sorteo con las exclusiones actuales. Intenta reducirlas.",
      "Sorteo fallido",
    );
    return;
  }

  pares.forEach((p) => {
    const li = document.createElement("li");
    li.className =
      "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <span><b>${p.quienDa}</b></span>
      <span class="badge-soft mx-2">regala a</span>
      <span><b>${p.quienRecibe}</b></span>
    `;
    resultado.appendChild(li);
  });

  lsSet("resultadoSorteo", pares);
  toastOk("¡Sorteo realizado y guardado correctamente!", "¡Sorteo listo!");
}

document.addEventListener("DOMContentLoaded", () => {
  const evento = ensureEventoOrRedirect();
  const exclusiones = getExclusiones();
  pintarResumenEvento(evento, exclusiones);
});
