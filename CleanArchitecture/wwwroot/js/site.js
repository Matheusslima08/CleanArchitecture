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

setupHeader(); setupMenu(); setupHero(); setupScrollAnimations(); setupImageFallbacks();
