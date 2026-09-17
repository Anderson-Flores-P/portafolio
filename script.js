/* ============================================================
   Anderson.dev — interactividad
   ------------------------------------------------------------
   PLACEHOLDERS: edita este objeto cuando tengas los links.
   Luego se aplican solos a todos los botones con data-placeholder.
   ============================================================ */
const PORTFOLIO_LINKS = {
  "github-profile": "#",   // TODO: ej. "https://github.com/tu-usuario"
  "github-studysync": "#", // TODO: ej. "https://github.com/tu-usuario/studysync-os"
  "github-hackathon": "#", // TODO: ej. "https://github.com/tu-usuario/gestion-escolar"
  "cv-pdf": "#",           // TODO: ej. "https://drive.google.com/file/d/TU_ID/view?usp=sharing"
};

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* 1. Aplicar placeholders */
function applyPlaceholders() {
  $$("[data-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-placeholder");
    const url = PORTFOLIO_LINKS[key];
    if (url && url !== "#") {
      el.setAttribute("href", url);
      el.removeAttribute("title");
      if (el.tagName === "A" && /^https?:/.test(url)) {
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener");
      }
    } else {
      if (el.tagName === "A" && !el.getAttribute("href")) el.setAttribute("href", "#");
      el.setAttribute("title", "Placeholder — reemplázalo en PORTFOLIO_LINKS / index.html");
      el.addEventListener("click", (e) => {
        if ((el.getAttribute("href") || "#") === "#") {
          e.preventDefault();
          toast("Enlace pendiente");
        }
      });
    }
  });
}

/* 2. Tema dark/light */
function initTheme() {
  const root = document.documentElement;
  const saved = localStorage.getItem("anderson-theme");
  if (saved) root.setAttribute("data-theme", saved);
  $("#themeToggle").addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("anderson-theme", next);
  });
}

/* 3. Menú móvil */
function initMenu() {
  const btn = $("#hamburger"), links = $("#navLinks");
  btn.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
  });
  $$(".nav-link, .nav-cta-mobile a", links).forEach((a) =>
    a.addEventListener("click", () => links.classList.remove("open"))
  );
}

/* 4. Typing effect hero */
function initTyping() {
  const roles = [
    "Estudiante Universitario de Software",
    "Ingeniería & Data Science",
    "IoT · Full Stack · EdTech",
    "Disponible para proyectos remotos",
  ];
  const el = $("#typedRole");
  let ri = 0, ci = 0, deleting = false;
  (function tick() {
    const word = roles[ri];
    el.textContent = word.slice(0, ci);
    if (!deleting && ci < word.length) { ci++; return setTimeout(tick, 55); }
    if (!deleting) { deleting = true; return setTimeout(tick, 1600); }
    if (ci > 0) { ci--; return setTimeout(tick, 28); }
    deleting = false; ri = (ri + 1) % roles.length;
    setTimeout(tick, 300);
  })();
}

/* 5. Scroll: progreso, header activo, to-top, reveal */
function initScroll() {
  const bar = $("#scrollProgress"), toTop = $("#toTop");
  const sections = ["inicio", "habilidades", "proyectos", "formacion", "participaciones", "contacto"]
    .map((id) => document.getElementById(id));
  const navMap = Object.fromEntries($$(".nav-link").map((a) => [a.getAttribute("href"), a]));

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    toTop.classList.toggle("show", y > 600);
    let current = "#inicio";
    sections.forEach((s) => { if (s && y >= s.offsetTop - 140) current = "#" + s.id; });
    $$(".nav-link").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === current));
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  $$(".reveal").forEach((el) => io.observe(el));
}

/* 6. Brillo que sigue el mouse en tarjetas */
function initCardGlow() {
  $$(".card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });
}

/* 7. Copiar email */
function initCopyEmail() {
  const btn = $("#copyEmailBtn");
  btn?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("af2007andersonflores@gmail.com");
      toast("Correo copiado al portapapeles");
    } catch { toast("af2007andersonflores@gmail.com"); }
  });
}

/* 8. Formulario con validación + mailto */
function initForm() {
  const form = $("#contactForm");
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    const check = (id, valid, msg) => {
      const input = $(id), field = input.closest(".field"), err = field.querySelector(".err");
      const bad = !valid;
      field.classList.toggle("invalid", bad);
      err.textContent = bad ? msg : "";
      if (bad) ok = false;
    };
    check("#fName", form.name.value.trim().length >= 2, "Escribe tu nombre (mín. 2 letras).");
    check("#fEmail", emailRe.test(form.email.value.trim()), "Escribe un email válido.");
    check("#fSubject", form.subject.value.trim().length >= 4, "Agrega un asunto.");
    check("#fMsg", form.message.value.trim().length >= 10, "El mensaje debe tener al menos 10 caracteres.");
    if (!ok) { toast("Revisa los campos marcados en rojo"); return; }

    const btn = $("#sendBtn");
    btn.disabled = true;
    btn.querySelector(".btn-label").textContent = "Abriendo tu correo…";
    const subject = encodeURIComponent(`[Portafolio] ${form.subject.value.trim()} — ${form.name.value.trim()}`);
    const body = encodeURIComponent(`${form.message.value.trim()}\n\n— ${form.name.value.trim()} (${form.email.value.trim()})`);
    setTimeout(() => {
      window.location.href = `mailto:af2007andersonflores@gmail.com?subject=${subject}&body=${body}`;
      toast("Borrador listo en tu cliente de correo");
      form.reset();
      btn.disabled = false;
      btn.querySelector(".btn-label").textContent = "Enviar mensaje";
    }, 700);
  });
}

/* 9. Lightbox diplomas / participaciones */
function initCertModal() {
  const modal = $("#certModal");
  if (!modal) return;
  const img = $("#certModalImg");
  const title = $("#certModalTitle");
  const fallback = $("#certModalFallback");
  const pathEl = $("#certModalPath");
  const open = $("#certModalOpen");

  const isPdf = (src) => /\.pdf(\?.*)?$/i.test(src || "");

  function openCert(src, label) {
    title.textContent = label || "Diploma";
    fallback.hidden = true;
    img.style.display = "";
    if (isPdf(src)) {
      // PDFs no se previsualizan como imagen: mostramos fallback + botones para abrir/descargar
      img.style.display = "none";
      fallback.hidden = false;
      pathEl.textContent = src;
    } else {
      img.src = src;
      img.alt = label || "Diploma ampliado";
      img.onerror = () => {
        img.style.display = "none";
        fallback.hidden = false;
        pathEl.textContent = src;
      };
    }
    open.setAttribute("href", src);
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeCert() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    img.removeAttribute("src");
  }

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-cert-src], .cert-view, .cert-preview");
    if (trigger) {
      const src = trigger.getAttribute("data-cert-src");
      const label = trigger.getAttribute("data-cert-title") || "Diploma";
      if (src) openCert(src, label);
      return;
    }
    if (e.target.closest("[data-close-cert]") || e.target.closest("#certModalClose")) closeCert();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCert();
    if (e.key === "Enter" && e.target.classList?.contains("cert-preview")) {
      openCert(e.target.getAttribute("data-cert-src"), e.target.getAttribute("data-cert-title"));
    }
  });
}

/* Toast */
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}

document.addEventListener("DOMContentLoaded", () => {
  $("#year").textContent = new Date().getFullYear();
  applyPlaceholders();
  initTheme();
  initMenu();
  initTyping();
  initScroll();
  initCardGlow();
  initCopyEmail();
  initForm();
  initCertModal();
});
