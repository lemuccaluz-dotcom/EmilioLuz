const LS_KEYS = {
  EVENTO: "evento",
  EXCLUSIONES: "exclusiones",
};

function lsSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function lsGet(key, defaultValue = null) {
  const raw = localStorage.getItem(key);
  if (!raw) return defaultValue;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return defaultValue;
  }
}

function lsRemove(key) {
  localStorage.removeItem(key);
}

/* ── Evento ── */
function getEvento() {
  return lsGet(LS_KEYS.EVENTO, null);
}

function saveEvento(evento) {
  lsSet(LS_KEYS.EVENTO, evento);
}

function ensureEventoOrRedirect() {
  const evento = getEvento();
  if (!evento) {
    // toast puede no estar disponible en todos los contextos, usar fallback
    if (typeof toastError === "function") {
      toastError("Primero crea un evento.", "Sin evento");
      setTimeout(() => {
        window.location = "evento.html";
      }, 1800);
    } else {
      alert("No hay evento guardado. Primero crea uno.");
      window.location = "evento.html";
    }
    return null;
  }
  return evento;
}

/* ── Exclusiones ──
   Estructura: { "Lalo": ["Emilio"], "Alan": [], ... }
   Significa: Lalo NO puede regalarle a Emilio.
*/
function getExclusiones() {
  return lsGet(LS_KEYS.EXCLUSIONES, {});
}

function saveExclusiones(obj) {
  lsSet(LS_KEYS.EXCLUSIONES, obj);
}
