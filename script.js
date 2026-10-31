const IMAGE_BASE = "https://dev.findrealestate.com/_next/image";
const DEPLOYMENT = "dpl_EoF2RCR5qcECGanN62X4qHcoFPW6";

function photoUrl(file, width = 1920, quality = 75) {
  const url = new URL(IMAGE_BASE);
  url.searchParams.set("dpl", DEPLOYMENT);
  url.searchParams.set("q", String(quality));
  url.searchParams.set("url", "/_next/static/media/" + file);
  url.searchParams.set("w", String(width));
  return url.toString();
}

document.querySelectorAll("[data-photo]").forEach((image) => {
  image.src = photoUrl(image.dataset.photo, image.classList.contains("sky-image") ? 1920 : 1600);
  image.loading = image.classList.contains("sky-image") || image.classList.contains("hero-home") ? "eager" : "lazy";
  image.decoding = "async"; image.addEventListener("error", () => image.remove(), { once: true });
});

const header = document.querySelector("#site-header");
const nav = document.querySelector("#main-nav");
const menuToggle = document.querySelector(".menu-toggle");

function updateHeader() {
  header.classList.toggle("is-stuck", window.scrollY > 24);
}
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

menuToggle.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!open));
  menuToggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
  nav.classList.toggle("is-open", !open);
});
nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = Math.min((index % 4) * 70, 210) + "ms";
  observer.observe(element);
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches && document.querySelector(".hero")) {
  document.querySelectorAll("[data-tilt]").forEach((scene) => {
    scene.addEventListener("pointermove", (event) => {
      const box = scene.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      const rotation = "perspective(1200px) rotateY(" + (x * 4) + "deg) rotateX(" + (-y * 3) + "deg)";
      scene.style.transform = scene.classList.contains("hero-scene") ? "translateX(-50%) " + rotation : rotation;
    });
    scene.addEventListener("pointerleave", () => {
      scene.style.transform = "";
    });
  });

  const hero = document.querySelector(".hero");
  const landscapeLayers = [...hero.querySelectorAll(".parallax-layer")];

  function moveLandscape(event) {
    const box = hero.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    landscapeLayers.forEach((layer) => {
      const depth = Number(layer.dataset.depth) || 0;
      layer.style.setProperty("--shift-x", (x * depth) + "px");
      layer.style.setProperty("--shift-y", (y * depth * 0.55) + "px");
    });
    document.querySelector(".hero-scene").style.marginLeft = (x * 13) + "px";
  }

  function moveLandscapeOnScroll() {
    const progress = Math.min(window.scrollY / hero.offsetHeight, 1);
    landscapeLayers.forEach((layer) => {
      const depth = Number(layer.dataset.depth) || 0;
      layer.style.setProperty("--scroll-y", (-progress * depth * 0.55) + "px");
    });
  }

  hero.addEventListener("pointermove", moveLandscape);
  hero.addEventListener("pointerleave", () => {
    landscapeLayers.forEach((layer) => {
      layer.style.setProperty("--shift-x", "0px");
      layer.style.setProperty("--shift-y", "0px");
    });
    document.querySelector(".hero-scene").style.marginLeft = "";
  });
  window.addEventListener("scroll", moveLandscapeOnScroll, { passive: true });
  moveLandscapeOnScroll();
}

document.querySelectorAll("[data-service-row]").forEach((row) => {
  row.addEventListener("pointermove", (event) => {
    const box = row.getBoundingClientRect();
    row.style.setProperty("--mouse-x", (event.clientX - box.left) + "px");
    row.style.setProperty("--mouse-y", (event.clientY - box.top) + "px");
  });
});

const newsletter = document.querySelector("#newsletter-form");
newsletter.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.querySelector("#email");
  const message = newsletter.querySelector(".form-message");
  if (!email.reportValidity()) return;
  const subject = "Request a Quotation — Mega Safe Security Services";
  const body = "Hello Mega Safe Security Services,%0D%0A%0D%0AI would like to request a quotation.%0D%0A%0D%0AYou can reply to me at: " + encodeURIComponent(email.value);
  window.location.href = "mailto:mymegasafe.security@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + body;
  message.textContent = "Opening your email app…";
  email.value = "";
});


