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

function buildSeats() {
  const container = document.querySelector("[data-seat-rows]");
  if (!container || container.children.length) return;

  "ABCDEFGHI".split("").forEach((rowName, rowIndex) => {
    const row = document.createElement("div");
    row.className = "seat-row";

    const label = document.createElement("span");
    label.className = "row-name";
    label.textContent = rowName;
    row.append(label);

    for (let number = 1; number <= 12; number += 1) {
      const seat = document.createElement("button");
      const position = rowIndex * 12 + number;
      const state = position % 13 === 0 ? "sold" : position % 7 === 0 ? "reserved" : "available";

      seat.type = "button";
      seat.className = `seat seat-${state}`;
      seat.dataset.row = rowName;
      seat.dataset.number = String(number).padStart(2, "0");
      seat.textContent = number;
      seat.setAttribute("aria-label", `Fileira ${rowName}, cadeira ${number}, ${state === "available" ? "disponível" : state === "reserved" ? "reservada" : "vendida"}`);
      seat.disabled = state !== "available";
      row.append(seat);
    }

    container.append(row);
  });
}

function animateSeats() {
  if (!window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  gsap.from(".seat-row", {
    y: -18,
    opacity: 0,
    duration: .42,
    stagger: .055,
    ease: "power2.out"
  });

  gsap.from(".seat", {
    y: -9,
    scale: .6,
    opacity: 0,
    duration: .35,
    stagger: { each: .008, from: "end" },
    ease: "back.out(1.5)"
  });
}

function openSection(section) {
  const venueMap = document.querySelector("[data-venue-map]");
  const seatMap = document.querySelector("[data-seat-map]");
  if (!venueMap || !seatMap || venueMap.dataset.busy === "true") return;

  const sectionName = section.dataset.section;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const showSeats = () => {
    venueMap.hidden = true;
    seatMap.hidden = false;
    document.querySelector("[data-section-name]").textContent = sectionName;
    document.querySelector("[data-seat-section]").textContent = `Setor ${sectionName}`;
    document.querySelector("[data-seat-row]").textContent = "Fileira —";
    document.querySelector("[data-seat-number]").textContent = "Cadeira —";
    document.querySelector(".seat-selected")?.classList.remove("seat-selected");

    if (!window.gsap || reducedMotion) {
      venueMap.dataset.busy = "false";
      return;
    }

    gsap.fromTo(seatMap,
      { y: 18, scale: .97, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, duration: .38, ease: "power3.out", onComplete: () => {
        venueMap.dataset.busy = "false";
        animateSeats();
        seatMap.querySelector("[data-back-button]").focus({ preventScroll: true });
      }}
    );
  };

  venueMap.dataset.busy = "true";
  venueMap.classList.add("has-selection");
  section.classList.add("is-active");

  if (!window.gsap || reducedMotion) {
    showSeats();
    return;
  }

  const mapBox = venueMap.getBoundingClientRect();
  const sectionBox = section.getBoundingClientRect();
  const originX = ((sectionBox.left + sectionBox.width / 2 - mapBox.left) / mapBox.width) * 100;
  const originY = ((sectionBox.top + sectionBox.height / 2 - mapBox.top) / mapBox.height) * 100;
  const tilt = sectionName === "Leste" ? 7 : sectionName === "Oeste" ? -7 : 0;

  gsap.timeline({ onComplete: showSeats })
    .to(venueMap, {
      scale: 1.1,
      rotationX: 8,
      rotationY: tilt,
      transformOrigin: `${originX}% ${originY}%`,
      duration: .34,
      ease: "power2.out"
    })
    .to(section, { scale: 1.16, filter: "drop-shadow(0 0 14px rgba(239,106,50,.95))", duration: .28 }, "<")
    .to(venueMap, { scale: 1.28, opacity: 0, duration: .24, ease: "power2.in" });
}

function selectSeat(seat) {
  document.querySelector(".seat-selected")?.classList.remove("seat-selected");
  seat.classList.add("seat-selected");
  document.querySelector("[data-seat-row]").textContent = `Fileira ${seat.dataset.row}`;
  document.querySelector("[data-seat-number]").textContent = `Cadeira ${seat.dataset.number}`;
}

function closeSection() {
  const venueMap = document.querySelector("[data-venue-map]");
  const seatMap = document.querySelector("[data-seat-map]");
  const selectedSection = venueMap?.querySelector(".is-active");
  if (!venueMap || !seatMap || seatMap.hidden) return;

  const showMap = () => {
    seatMap.hidden = true;
    venueMap.hidden = false;
    venueMap.classList.remove("has-selection");
    selectedSection?.classList.remove("is-active");

    if (!window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.set(selectedSection, { clearProps: "transform,filter" });
    gsap.set(seatMap, { clearProps: "transform,opacity" });
    gsap.set(".seat-row, .seat", { clearProps: "transform,opacity" });
    gsap.fromTo(venueMap,
      { scale: 1.14, rotationX: 8, rotationY: 5, opacity: 0 },
      { scale: 1, rotationX: 0, rotationY: 0, opacity: 1, duration: .45, ease: "power3.out", clearProps: "transform,opacity,transformOrigin" }
    );
  };

  if (!window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    showMap();
    return;
  }

  gsap.timeline({ onComplete: showMap })
    .to(".seat-row", { y: 12, opacity: 0, duration: .2, stagger: { each: .02, from: "end" } })
    .to(seatMap, { y: 18, scale: .97, opacity: 0, duration: .25, ease: "power2.in" }, "<.08");
}

function setupVenue() {
  const venueMap = document.querySelector("[data-venue-map]");
  const seatRows = document.querySelector("[data-seat-rows]");
  const backButton = document.querySelector("[data-back-button]");
  if (!venueMap || !seatRows || !backButton) return;

  buildSeats();
  venueMap.querySelectorAll("[data-section]").forEach((section) => {
    section.addEventListener("click", () => openSection(section));
  });
  seatRows.addEventListener("click", (event) => {
    const seat = event.target.closest(".seat-available");
    if (seat) selectSeat(seat);
  });
  backButton.addEventListener("click", closeSection);
}

setupHeader();
setupMenu();
setupHero();
setupScrollAnimations();
setupImageFallbacks();
setupTypewriter();
setupTicketButton();
setupVenue();
