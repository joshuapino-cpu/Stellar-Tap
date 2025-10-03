// game.js - versión corregida
// - Reinicio ahora borra TODO (mejoras, satélites, timers, boost, guardado).
// - Meteorito aparece cada 60s exactos.
// - Boost guarda/restaura exactamente el valor previo (evita decimales).
// - Primera mejora de clic => starsPerClick = 5; luego +5 (siempre enteros).
// - Satélites generan x3 / s.

let stars = 0;
let starsPerClick = 1; // base inicial
let autoStars = 0;

// Costos base
let clickCost = 10;
let autoCost = 50;

// Meteorito control
let meteoriteActive = false;
let meteoriteHP = 0;
let meteoriteTimer = null;
let meteoriteDuration = 18000; // ms que dura el meteorito antes de "escapar"
let meteoriteIntervalId = null;

// Producción interval
let productionIntervalId = null;

// Boost control
let boostOriginalPower = null;
let boostActive = false;
let boostCooldownFlag = false;
const SKILL_LABEL = "Doble Poder (CD 30s)";

// --- DOM elementos ---
const startScreen = document.getElementById("start-screen");
const loreScreen = document.getElementById("lore-screen");
const playBtn = document.getElementById("play-btn");
const startGameBtn = document.getElementById("start-game");
const gameMain = document.getElementById("game");

const planetBtn = document.getElementById("planet-btn");
const planetContainer = planetBtn ? planetBtn.parentElement : null;
const coinsDisplay = document.getElementById("coins-display");
const clickPowerDisplay = document.getElementById("click-power");
const effects = document.getElementById("effects");
const satellitesContainer = document.getElementById("satellites");

const clickBtn = document.getElementById("upgrade-click");
const autoBtn = document.getElementById("upgrade-auto");
const clickCostDisplay = document.getElementById("click-cost");
const autoCostDisplay = document.getElementById("auto-cost");
const autoCountDisplay = document.getElementById("auto-count");
const resetBtn = document.getElementById("reset-btn");

const skillBtn = document.getElementById("skill-boost");

// ---------- INICIO / PANTALLAS ----------
playBtn && playBtn.addEventListener("click", () => {
  startScreen.classList.add("hidden");
  loreScreen.classList.remove("hidden");
});

startGameBtn && startGameBtn.addEventListener("click", () => {
  loreScreen.classList.add("hidden");
  gameMain.classList.remove("hidden");
  loadGame();
  renderSatellites();
  startProductionInterval();
  startMeteoriteInterval();
});

// ---------- CLICK PRINCIPAL ----------
planetBtn && planetBtn.addEventListener("click", () => {
  stars = Math.floor(stars + starsPerClick);
  updateStars();
  spawnFloating(`+${starsPerClick} ⭐`);
  saveGame();
});

// ---------- COMPRAS ----------
// Click upgrade: primera compra deja 5, luego +5
clickBtn && clickBtn.addEventListener("click", () => {
  if (stars >= clickCost) {
    stars -= clickCost;

    // Manejo especial si el boost está activo:
    if (boostActive && boostOriginalPower !== null) {
      // Si el jugador está con boost activo, trabajamos sobre boostOriginalPower (el valor base)
      if (boostOriginalPower === 1) {
        boostOriginalPower = 5;
      } else {
        boostOriginalPower = boostOriginalPower + 5;
      }
      // Aplicar efecto de boost (base * 2)
      starsPerClick = Math.floor(boostOriginalPower * 2);
    } else {
      // Caso normal (sin boost)
      if (starsPerClick === 1) {
        starsPerClick = 5;
      } else {
        starsPerClick += 5;
      }
    }

    clickCost = Math.floor(clickCost * 1.5);
    updateStars();
    updateShop();
    saveGame();
  }
});

// Comprar satélite: genera +3 estrellas/seg cada uno
autoBtn && autoBtn.addEventListener("click", () => {
  if (stars >= autoCost) {
    stars -= autoCost;
    autoStars++;
    autoCost = Math.floor(autoCost * 1.5);
    updateStars();
    updateShop();
    renderSatellites();
    saveGame();
  }
});

// ---------- REINICIO (AHORA LIMPIO TODO) ----------
resetBtn && resetBtn.addEventListener("click", () => {
  if (!confirm("¿Seguro que quieres reiniciar tu progreso?")) return;

  // Detener timers e intervalos
  clearMeteorite();
  stopMeteoriteInterval();
  stopProductionInterval();

  // Borrar guardado
  localStorage.removeItem("stellarSave");

  // Reset variables a valores por defecto
  stars = 0;
  starsPerClick = 1;
  autoStars = 0;
  clickCost = 10;
  autoCost = 50;

  // Reset boost
  boostOriginalPower = null;
  boostActive = false;
  boostCooldownFlag = false;
  if (skillBtn) skillBtn.innerText = SKILL_LABEL;

  // UI
  if (satellitesContainer) satellitesContainer.innerHTML = "";
  updateStars();
  updateShop();
  renderSatellites();

  // Guardar estado limpio (opcional: útil para consistencia)
  saveGame();

  // Reiniciar intervalos
  startProductionInterval();
  startMeteoriteInterval();

  alert("Progreso reiniciado.");
});

// ---------- PRODUCCIÓN AUTOMÁTICA (satélites x3/s) ----------
function startProductionInterval() {
  if (productionIntervalId) return; // ya corriendo
  productionIntervalId = setInterval(() => {
    if (autoStars > 0) {
      const gain = autoStars * 10; // x10 por satélite
      stars = Math.floor(stars + gain);
      updateStars();
      spawnFloating(`+${gain} ⭐`);
      saveGame();
    }
  }, 1000);
}
function stopProductionInterval() {
  if (productionIntervalId) {
    clearInterval(productionIntervalId);
    productionIntervalId = null;
  }
}

// ---------- GUARDADO / CARGA ----------
function saveGame() {
  const saveData = {
    stars: Math.floor(stars),
    starsPerClick: Math.floor(starsPerClick),
    autoStars: Math.floor(autoStars),
    clickCost: Math.floor(clickCost),
    autoCost: Math.floor(autoCost)
  };
  localStorage.setItem("stellarSave", JSON.stringify(saveData));
}

function loadGame() {
  const data = localStorage.getItem("stellarSave");
  if (data) {
    try {
      const save = JSON.parse(data);
      stars = save.stars || 0;
      starsPerClick = save.starsPerClick || 1;
      autoStars = save.autoStars || 0;
      clickCost = save.clickCost || 10;
      autoCost = save.autoCost || 50;
    } catch (e) {
      stars = 0; starsPerClick = 1; autoStars = 0; clickCost = 10; autoCost = 50;
    }
  } else {
    stars = 0; starsPerClick = 1; autoStars = 0; clickCost = 10; autoCost = 50;
  }
  updateStars();
  updateShop();
}

// ---------- UI AUXILIARES ----------
function updateStars() {
  coinsDisplay && (coinsDisplay.innerText = Math.floor(stars));
  clickPowerDisplay && (clickPowerDisplay.innerText = Math.floor(starsPerClick));
}

function updateShop() {
  clickCostDisplay && (clickCostDisplay.innerText = Math.floor(clickCost));
  autoCostDisplay && (autoCostDisplay.innerText = Math.floor(autoCost));
  autoCountDisplay && (autoCountDisplay.innerText = Math.floor(autoStars));
}

function spawnFloating(text, opts = {}) {
  if (!effects) return;
  const el = document.createElement("div");
  el.className = "floating";
  el.innerText = text;
  const parentRect = effects.getBoundingClientRect();
  const left = (opts.left !== undefined) ? opts.left : (Math.random() * Math.max(1, parentRect.width - 40) + 20);
  const top = (opts.top !== undefined) ? opts.top : (Math.random() * 40 + 10);
  el.style.left = left + "px";
  el.style.top = top + "px";
  el.style.color = opts.color || ["#facc15","#a78bfa","#38bdf8","#f472b6"][Math.floor(Math.random()*4)];
  effects.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}

// ---------- SATELITES (VISUAL) ----------
function renderSatellites() {
  if (!satellitesContainer) return;
  satellitesContainer.innerHTML = "";
  for (let i = 0; i < autoStars; i++) {
    const sat = document.createElement("div");
    sat.className = "satellite";
    const shade = 180 + Math.floor(Math.random() * 60);
    sat.style.background = `rgb(${shade},${shade},${shade})`;
    sat.style.animationDuration = (5 + Math.random() * 3) + "s";
    const angle = (360 / Math.max(1, autoStars)) * i;
    sat.style.transform = `rotate(${angle}deg) translateX(120px)`;
    satellitesContainer.appendChild(sat);
  }
}

// ----------------- METEORITO -----------------
function startMeteoriteInterval() {
  if (meteoriteIntervalId) return;
  // aparece cada 60s exactos
  meteoriteIntervalId = setInterval(() => {
    if (!meteoriteActive) spawnMeteorite();
  }, 60000);
}

function stopMeteoriteInterval() {
  if (meteoriteIntervalId) {
    clearInterval(meteoriteIntervalId);
    meteoriteIntervalId = null;
  }
}

function spawnMeteorite() {
  if (meteoriteActive) return;
  if (!planetContainer) return;

  meteoriteActive = true;

  // HP escala con power de click y satélites
  meteoriteHP = Math.floor((starsPerClick * 50) + (autoStars * 80) + 200);

  // crear wrapper dentro del contenedor del planeta (para que no se mueva con layout)
  const meteorWrap = document.createElement("div");
  meteorWrap.className = "meteorite-local";
  meteorWrap.style.position = "absolute";
  meteorWrap.style.top = "50%";
  meteorWrap.style.left = "50%";
  meteorWrap.style.transform = "translate(-50%, -50%)";
  meteorWrap.style.zIndex = "6";
  meteorWrap.style.textAlign = "center";
  meteorWrap.style.pointerEvents = "auto";

  const meteorBody = document.createElement("div");
  meteorBody.className = "meteorite-body";
  meteorBody.style.width = "180px";
  meteorBody.style.height = "180px";
  meteorBody.style.borderRadius = "50%";
  meteorBody.style.background = "radial-gradient(circle at 30% 30%, #7f1d1d, #450a0a)";
  meteorBody.style.boxShadow = "0 0 30px #ef4444";
  meteorBody.style.cursor = "pointer";

  const meteorHpEl = document.createElement("div");
  meteorHpEl.className = "meteorite-hp";
  meteorHpEl.style.color = "#ef4444";
  meteorHpEl.style.fontWeight = "700";
  meteorHpEl.style.marginTop = "8px";
  meteorHpEl.innerText = "HP: " + meteoriteHP;

  meteorWrap.appendChild(meteorBody);
  meteorWrap.appendChild(meteorHpEl);

  // ocultar planeta (pero mantener layout) y poner meteorito encima
  if (planetBtn) planetBtn.style.visibility = "hidden";
  planetContainer.appendChild(meteorWrap);

  // si se pasa el tiempo, el meteorito "escapa" y aplica penalizacion
  meteoriteTimer = setTimeout(() => {
    if (!meteoriteActive) return;
    const penalty = Math.floor(stars * 0.20); // 20%
    const actualPenalty = Math.min(Math.floor(stars), penalty);
    stars = Math.max(0, Math.floor(stars - actualPenalty));
    updateStars();
    spawnFloating(`- ${actualPenalty} ⭐`, { color: "#ff6b6b", left: (effects.getBoundingClientRect().width/2) });
    // limpiar y restaurar
    meteorWrap.remove();
    if (planetBtn) planetBtn.style.visibility = "visible";
    meteoriteActive = false;
  }, meteoriteDuration);

  // Handler de clicks en meteorito
  const hitHandler = (e) => {
    if (!meteoriteActive) return;
    meteoriteHP = Math.max(0, meteoriteHP - starsPerClick);
    meteorHpEl.innerText = "HP: " + meteoriteHP;
    spawnFloating(`-${starsPerClick}`, { color: "#ffa8a8", left: e.offsetX + 40, top: e.offsetY + 10 });

    if (meteoriteHP <= 0) {
      clearTimeout(meteoriteTimer);
      // recompensa: al menos el costo máximo actual
      const reward = Math.max(Math.floor(clickCost), Math.floor(autoCost));
      stars = Math.floor(stars + reward);
      updateStars();
      spawnFloating(`+ ${reward} ⭐ del meteorito!`, { color: "#ffd166" });

      // limpiar visual y restaurar planeta
      meteorWrap.remove();
      if (planetBtn) planetBtn.style.visibility = "visible";
      meteoriteActive = false;
      saveGame();
    }
  };

  meteorBody.addEventListener("click", hitHandler);
}

// Limpia meteorito y timers relacionados
function clearMeteorite() {
  meteoriteActive = false;
  if (meteoriteTimer) { clearTimeout(meteoriteTimer); meteoriteTimer = null; }
  if (planetContainer) {
    const existing = planetContainer.querySelectorAll(".meteorite-local");
    existing.forEach(n => n.remove());
    if (planetBtn) planetBtn.style.visibility = "visible";
  }
}

// ---------- FONDO (estrellas fugaces) ----------
const canvas = document.getElementById("background");
const ctx = canvas ? canvas.getContext("2d") : null;
let w, h;
function resizeCanvas() {
  if (!canvas) return;
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let starsArray = [];
function createStars() {
  if (!canvas) return;
  starsArray = [];
  for (let i = 0; i < 80; i++) {
    starsArray.push({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 2,
      speed: Math.random() * 1 + 0.2
    });
  }
}
createStars();

function animateBackground() {
  if (!ctx) return;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "white";
  starsArray.forEach(s => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
    s.y += s.speed;
    if (s.y > h) { s.y = 0; s.x = Math.random() * w; }
  });
  requestAnimationFrame(animateBackground);
}
animateBackground();

// ---------- SKILL (BOOST) ----------
if (skillBtn) {
  skillBtn.innerText = SKILL_LABEL;
  skillBtn.addEventListener("click", () => {
    if (boostCooldownFlag || boostActive) return;
    // Guardar valor original y aplicar boost
    boostOriginalPower = Math.floor(starsPerClick);
    boostActive = true;
    boostCooldownFlag = true;
    starsPerClick = Math.floor(boostOriginalPower * 2);
    skillBtn.innerText = "¡Poder Doble Activo!";
    // terminar boost tras 8s
    setTimeout(() => {
      // restaurar exactamente el valor original guardado
      starsPerClick = Math.max(1, Math.floor(boostOriginalPower || 1));
      boostActive = false;
      skillBtn.innerText = "Cooldown...";
      // cooldown 30s
      setTimeout(() => {
        boostCooldownFlag = false;
        skillBtn.innerText = SKILL_LABEL;
      }, 30000);
    }, 8000);
  });
}

// ---------- INICIALIZACIÓN UI ----------
updateStars();
updateShop();
renderSatellites();
