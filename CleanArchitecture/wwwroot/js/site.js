document.documentElement.classList.add("js-ready");

function setupHeader() {
  const header = document.querySelector("[data-header]");
  if (!header) return;
  const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

function setupMenu() {
  const button = document.querySelector("[data-menu-button]");
  const menu = document.querySelector("[data-menu]");
  if (!button || !menu) return;
  const closeMenu = () => {
    button.setAttribute("aria-expanded", "false"); button.setAttribute("aria-label", "Abrir menu");
    menu.classList.remove("is-open"); document.body.classList.remove("menu-open");
  };
  button.addEventListener("click", () => {
    const isOpen = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!isOpen)); button.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
    menu.classList.toggle("is-open", !isOpen); document.body.classList.toggle("menu-open", !isOpen);
  });
  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  window.addEventListener("resize", () => { if (window.innerWidth > 720) closeMenu(); });
}

function setupHero() {
  if (!window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  gsap.from([".hero-label", ".hero-title span", ".hero-details", ".hero-actions", ".hero-index", ".scroll-note"], {
    y: 28, opacity: 0, duration: .9, stagger: .09, ease: "power3.out", delay: .2
  });
  gsap.to(".hero-image", { scale: 1, duration: 1.8, ease: "power2.out" });
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking || window.scrollY > window.innerHeight) return;
    ticking = true;
    requestAnimationFrame(() => { gsap.set(".hero-image", { yPercent: window.scrollY * .012 }); ticking = false; });
  }, { passive: true });
}

function setupScrollAnimations() {
  const items = document.querySelectorAll(".reveal");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion || !window.gsap || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.style.visibility = "visible"); return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      gsap.fromTo(entry.target, { y: 42, opacity: 0 }, { y: 0, opacity: 1, duration: .85, ease: "power3.out", clearProps: "transform,opacity" });
      observer.unobserve(entry.target);
    });
  }, { threshold: .14, rootMargin: "0px 0px -5%" });
  items.forEach((item) => observer.observe(item));
}

function setupImageFallbacks() {
  document.querySelectorAll("img").forEach((image) => image.addEventListener("error", () => {
    image.classList.add("image-error"); image.alt = "Imagem temporariamente indisponível";
  }));
}

function setupTypewriter() {
  const target = document.querySelector("[data-typewriter]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!target || reducedMotion) return;

  const names = ["Bruno Mars", "Macklemore", "Skillet"];
  const wait = (time) => new Promise((resolve) => window.setTimeout(resolve, time));

  async function typeNames() {
    let index = 0;

    while (target.isConnected) {
      const name = names[index];

      for (let length = 1; length <= name.length; length += 1) {
        target.textContent = name.slice(0, length);
        await wait(85);
      }

      await wait(1450);

      for (let length = name.length - 1; length >= 0; length -= 1) {
        target.textContent = name.slice(0, length);
        await wait(48);
      }

      await wait(260);
      index = (index + 1) % names.length;
    }
  }

  target.textContent = "";
  typeNames();
}

function setupTicketButton() {
  const button = document.querySelector("[data-ticket-button]");
  if (!button) return;

  const particles = button.querySelector(".ticket-particles");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  button.addEventListener("click", (event) => {
    event.preventDefault();

    const target = document.querySelector(button.getAttribute("href"));
    if (!target || button.classList.contains("is-loading") || button.classList.contains("is-done")) return;

    if (reducedMotion) {
      target.scrollIntoView();
      return;
    }

    particles.replaceChildren(...Array.from({ length: 12 }, () => document.createElement("i")));
    button.classList.add("is-loading");
    button.setAttribute("aria-label", "Preparando seleção de ingressos");

    window.setTimeout(() => {
      button.classList.remove("is-loading");
      button.classList.add("is-done");
      button.setAttribute("aria-label", "Seleção de ingressos pronta");
    }, 850);

    window.setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 1300);

    window.setTimeout(() => {
      button.classList.remove("is-done");
      button.setAttribute("aria-label", "Compre seu ingresso");
      particles.replaceChildren();
    }, 2200);
  });
}

setupHeader(); setupMenu(); setupHero(); setupScrollAnimations(); setupImageFallbacks(); setupTypewriter(); setupTicketButton();
