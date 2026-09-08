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

function buildSeats(sectionId) {
  const container = document.querySelector("[data-seat-rows]");
  const template = [...document.querySelectorAll("[data-sector-seats]")]
    .find((item) => item.dataset.sectorSeats === sectionId);
  if (!container || !template) return;

  container.replaceChildren(template.content.cloneNode(true));
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
    buildSeats(section.dataset.sectorId);
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

async function selectSeat(seat) {
  const message = document.querySelector("[data-seat-message]");
  seat.disabled = true;
  if (message) message.textContent = "Reservando...";

  try {
    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Number(seat.dataset.seatId))
    });
    const result = await response.json();

    if (!result.success) {
      seat.classList.remove("seat-available", "seat-selected");
      seat.classList.add("seat-reserved");
      seat.setAttribute("aria-label", `Fileira ${seat.dataset.row}, cadeira ${seat.dataset.number}, indisponível`);
      if (message) message.textContent = result.message;
      return;
    }

    document.querySelector(".seat-selected")?.classList.remove("seat-selected");
    updateSeat({ seatId: Number(seat.dataset.seatId), status: "Reserved" });
    seat.classList.remove("seat-available");
    seat.classList.add("seat-reserved", "seat-selected");
    seat.setAttribute("aria-label", `Fileira ${seat.dataset.row}, cadeira ${seat.dataset.number}, reservada`);
    document.querySelector("[data-seat-row]").textContent = `Fileira ${seat.dataset.row}`;
    document.querySelector("[data-seat-number]").textContent = `Cadeira ${seat.dataset.number}`;
    if (message) message.textContent = result.message;
    showPayment(seat);
  } catch {
    seat.disabled = !seat.classList.contains("seat-available");
    if (message) message.textContent = "Não foi possível reservar a cadeira.";
  }
}

let reservationTimer;

function startReservationTimer(seconds = 600) {
  const timer = document.querySelector("[data-reservation-timer]");
  if (!timer) return;

  window.clearInterval(reservationTimer);
  timer.classList.remove("is-expired");
  let remaining = seconds;

  const update = () => {
    if (remaining <= 0) {
      window.clearInterval(reservationTimer);
      timer.textContent = "Reserva expirada";
      timer.classList.add("is-expired");
      return;
    }

    const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
    const secondsLeft = String(remaining % 60).padStart(2, "0");
    timer.innerHTML = `Reserva expira em <strong>${minutes}:${secondsLeft}</strong>`;
    remaining -= 1;
  };

  update();
  reservationTimer = window.setInterval(update, 1000);
}

function showPayment(seat) {
  const seatMap = document.querySelector("[data-seat-map]");
  const payment = document.querySelector("[data-payment]");
  const section = document.querySelector("[data-venue-map] .is-active");
  if (!seatMap || !payment || !section) return;

  payment.querySelector("[data-summary-event]").textContent = payment.dataset.eventName;
  payment.querySelector("[data-summary-section]").textContent = `Setor ${section.dataset.section}`;
  payment.querySelector("[data-summary-row]").textContent = `Fileira ${seat.dataset.row}`;
  payment.querySelector("[data-summary-seat]").textContent = `Cadeira ${seat.dataset.number}`;
  payment.querySelector("[data-summary-price]").textContent = section.dataset.sectorPrice;

  const reveal = () => {
    seatMap.hidden = true;
    payment.hidden = false;
    startReservationTimer();

    if (!window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      payment.querySelector("[data-payment-method='card']")?.focus({ preventScroll: true });
      return;
    }

    gsap.fromTo(payment,
      { y: 26, opacity: 0 },
      { y: 0, opacity: 1, duration: .52, ease: "power3.out", clearProps: "transform,opacity" }
    );
    gsap.fromTo("[data-payment-card]",
      { rotationX: 8, rotationY: -9, scale: .94, opacity: 0 },
      { rotationX: 0, rotationY: 0, scale: 1, opacity: 1, duration: .7, delay: .08, ease: "power3.out", clearProps: "transform,opacity" }
    );
  };

  if (!window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    reveal();
    return;
  }

  gsap.to(seatMap, {
    scale: .97,
    opacity: .35,
    duration: .38,
    delay: .35,
    ease: "power2.in",
    onComplete: reveal
  });
}

function showPix(show) {
  const cardPanel = document.querySelector("[data-card-panel]");
  const cardForm = document.querySelector("[data-card-form]");
  const pixPanel = document.querySelector("[data-pix-panel]");
  const next = show ? pixPanel : cardPanel;
  const current = show ? cardPanel : pixPanel;
  if (!cardPanel || !cardForm || !pixPanel || (show && !pixPanel.hidden) || (!show && !cardPanel.hidden)) return;

  const swap = () => {
    current.hidden = true;
    next.hidden = false;
    cardForm.hidden = show;

    if (window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(next, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .3, ease: "power2.out", clearProps: "transform,opacity" });
      if (!show) gsap.fromTo(cardForm, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: .3, ease: "power2.out", clearProps: "transform,opacity" });
    }
  };

  if (window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.to(current, { y: -8, opacity: 0, duration: .18, ease: "power2.in", onComplete: swap });
  } else {
    swap();
  }
}

function setupCardTilt() {
  const card = document.querySelector("[data-payment-card]");
  if (!card || window.matchMedia("(hover: none), (pointer: coarse), (max-width: 720px), (prefers-reduced-motion: reduce)").matches) return;

  card.addEventListener("mousemove", (event) => {
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    card.style.setProperty("--spot-x", `${x * 100}%`);
    card.style.setProperty("--spot-y", `${y * 100}%`);
    card.style.transform = `perspective(1100px) rotateX(${(0.5 - y) * 12}deg) rotateY(${(x - 0.5) * 14}deg) scale(1.035)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.setProperty("--spot-x", "50%");
    card.style.setProperty("--spot-y", "50%");
    card.style.transform = "perspective(1100px) rotateX(0) rotateY(0) scale(1)";
  });
}

function setupPayment() {
  const payment = document.querySelector("[data-payment]");
  if (!payment) return;

  const nameInput = payment.querySelector("[data-card-name-input]");
  const numberInput = payment.querySelector("[data-card-number-input]");
  const expiryInput = payment.querySelector("[data-card-expiry-input]");
  const setText = (target, value, fallback) => {
    payment.querySelector(target).textContent = value.trim() || fallback;
  };

  nameInput.addEventListener("input", () => setText("[data-card-name]", nameInput.value, "NOME DO TITULAR"));
  numberInput.addEventListener("input", () => {
    const digits = numberInput.value.replace(/\D/g, "").slice(0, 16);
    numberInput.value = digits.replace(/(.{4})/g, "$1 ").trim();
    setText("[data-card-number]", numberInput.value, "0000 0000 0000 0000");
  });
  expiryInput.addEventListener("input", () => {
    const digits = expiryInput.value.replace(/\D/g, "").slice(0, 4);
    expiryInput.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    setText("[data-card-expiry]", expiryInput.value, "MM/AA");
  });

  payment.querySelectorAll("[data-payment-method]").forEach((button) => button.addEventListener("click", () => {
    const usePix = button.dataset.paymentMethod === "pix";
    payment.querySelectorAll("[data-payment-method]").forEach((item) => item.setAttribute("aria-selected", String(item === button)));
    showPix(usePix);
  }));

  payment.querySelector("[data-copy-pix]").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    const code = payment.querySelector("[data-pix-code]").textContent;
    try {
      await navigator.clipboard.writeText(code);
      button.textContent = "Código copiado";
    } catch {
      button.textContent = "Selecione e copie o código";
    }
    window.setTimeout(() => { button.textContent = "Copiar código"; }, 1800);
  });

  setupCardTilt();
}

function updateSeat({ seatId, status }) {
  if (!Number.isInteger(seatId) || !["Available", "Reserved", "Sold"].includes(status)) return;
  const roots = [document, ...[...document.querySelectorAll("[data-sector-seats]")].map(t => t.content)];
  const label = { Available: "disponível", Reserved: "reservada", Sold: "vendida" }[status];
  roots.forEach(root => root.querySelectorAll(`[data-seat-id="${seatId}"]`).forEach(seat => {
    seat.classList.remove("seat-available", "seat-reserved", "seat-sold", "seat-selected");
    seat.classList.add(`seat-${status.toLowerCase()}`);
    seat.disabled = status !== "Available";
    seat.setAttribute("aria-label", `Fileira ${seat.dataset.row}, cadeira ${seat.dataset.number}, ${label}`);
  }));
}

function setupSeatUpdates() {
  if (!document.querySelector("[data-seat-rows]")) return;
  const message = document.querySelector("[data-seat-message]");
  if (!window.signalR) {
    if (message) message.textContent = "Não foi possível conectar às atualizações de cadeiras. Atualize a página.";
    return;
  }
  const connection = new signalR.HubConnectionBuilder()
    .withUrl("/hubs/seats")
    .withAutomaticReconnect()
    .build();
  connection.on("SeatUpdated", updateSeat);
  async function start() {
    try { await connection.start(); }
    catch {
      if (message) message.textContent = "Reconectando às atualizações de cadeiras...";
      window.setTimeout(start, 5000);
    }
  }
  connection.onclose(start);
  start();
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

  venueMap.querySelectorAll("[data-section]").forEach((section) => {
    section.addEventListener("click", () => openSection(section));
  });
  seatRows.addEventListener("click", (event) => {
    const seat = event.target.closest(".seat-available");
    if (seat && !seat.disabled) selectSeat(seat);
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
setupSeatUpdates();
setupPayment();
