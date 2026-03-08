const TOAST_DURATION = 3800; // ms antes de auto-cerrar

const TOAST_CONFIG = {
  success: { icon: "🎉", title: "¡Listo!" },
  error: { icon: "❌", title: "Error" },
  warning: { icon: "⚠️", title: "Atención" },
  info: { icon: "ℹ️", title: "Info" },
};

function toast(mensaje, tipo = "info", tituloCustom = null) {
  // crear contenedor si no existe
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const cfg = TOAST_CONFIG[tipo] || TOAST_CONFIG.info;
  const titulo = tituloCustom || cfg.title;

  const item = document.createElement("div");
  item.className = `toast-item toast-${tipo}`;
  item.innerHTML = `
    <span class="toast-icon">${cfg.icon}</span>
    <div class="toast-body">
      <div class="toast-title">${titulo}</div>
      <div>${mensaje}</div>
    </div>
    <button class="toast-close" aria-label="Cerrar">✕</button>
    <div class="toast-progress" style="animation-duration:${TOAST_DURATION}ms"></div>
  `;

  // cerrar al click en la X
  item
    .querySelector(".toast-close")
    .addEventListener("click", () => cerrarToast(item));

  container.appendChild(item);

  // auto-cerrar
  const timer = setTimeout(() => cerrarToast(item), TOAST_DURATION);
  item._timer = timer;
}

function cerrarToast(item) {
  clearTimeout(item._timer);
  item.classList.add("hiding");
  item.addEventListener("animationend", () => item.remove(), { once: true });
}

/* Atajos semánticos */
const toastOk = (msg, titulo) => toast(msg, "success", titulo);
const toastError = (msg, titulo) => toast(msg, "error", titulo);
const toastWarn = (msg, titulo) => toast(msg, "warning", titulo);
const toastInfo = (msg, titulo) => toast(msg, "info", titulo);
