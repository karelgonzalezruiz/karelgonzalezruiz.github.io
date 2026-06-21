const body = document.body;
const themeToggle = document.querySelector(".theme-toggle");
const themeToggleText = document.querySelector(".theme-toggle__text");
const logoButton = document.querySelector(".site-logo");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Theme (light / dark) ---------- */
const savedTheme = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

function applyTheme(theme) {
  const isDark = theme === "dark";
  body.classList.toggle("dark-mode", isDark);
  themeToggleText.textContent = isDark ? "Modo claro" : "Modo oscuro";
  themeToggle.setAttribute("aria-pressed", String(isDark));
}

applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

themeToggle.addEventListener("click", () => {
  const next = body.classList.contains("dark-mode") ? "light" : "dark";
  localStorage.setItem("theme", next);
  applyTheme(next);
});

/* ---------- Logo → scroll to top (solo cuando es botón, no enlace) ---------- */
if (logoButton && logoButton.tagName === "BUTTON") {
  logoButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
}

/* ---------- Descargas (CV, certificado): forzar descarga, no abrir pestaña ---------- */
document.querySelectorAll("[data-download]").forEach((trigger) => {
  trigger.addEventListener("click", async (event) => {
    // En file:// el navegador ignora la descarga: abrimos en otra pestaña para no
    // reemplazar el portafolio. En http(s) (sitio en vivo) sí se fuerza la descarga.
    if (location.protocol === "file:") {
      event.preventDefault();
      window.open(trigger.href, "_blank", "noopener");
      return;
    }
    event.preventDefault();
    const filename = trigger.getAttribute("download") || "";
    try {
      const response = await fetch(trigger.href);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      window.location.href = trigger.href;
    }
  });
});

/* ---------- Cursor glow (fondo que sigue el mouse) ---------- */
const glow = document.querySelector(".cursor-glow");
const finePointer = window.matchMedia("(pointer: fine)").matches;

if (glow && finePointer && !reduceMotion) {
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  let running = false;

  function animateGlow() {
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;
    glow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateGlow);
  }

  window.addEventListener("mousemove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    if (!running) {
      running = true;
      glow.style.opacity = "1";
      animateGlow();
    }
  });
}

/* ---------- Reveal sections on scroll ---------- */
const revealItems = document.querySelectorAll(".reveal");

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((el) => el.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealItems.forEach((el) => observer.observe(el));
}
