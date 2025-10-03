let stars = 0;
let starsPerClick = 1; // Base inicial
let autoStars = 0;

// Costos base
let clickCost = 10;
let autoCost = 50;

// Elementos
const startScreen = document.getElementById("start-screen");
const loreScreen = document.getElementById("lore-screen");
const playBtn = document.getElementById("play-btn");
const startGameBtn = document.getElementById("start-game");
const gameMain = document.getElementById("game");

const planetBtn = document.getElementById("planet-btn");
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

// Pantalla inicial -> lore
playBtn.addEventListener("click", () => {
  startScreen.classList.add("hidden");
  loreScreen.classList.remove("hidden");
});

// Lore -> juego
startGameBtn.addEventListener("click", () => {
  loreScreen.classList.add("hidden");
  gameMain.classList.remove("hidden");
  loadGame();
  renderSatellites();
});

// Click en planeta
planetBtn.addEventListener("click", () => {
  stars += starsPerClick;
  updateStars();
  spawnFloating(`+${starsPerClick} ⭐`);
  saveGame();
});

// Comprar mejora de clic (+5, pero la primera sube directo a 5)
clickBtn.addEventListener("click", () => {
  if (stars >= clickCost) {
    stars -= clickCost;

    if (starsPerClick === 1) {
      starsPerClick = 5; // primera compra
    } else {
      starsPerClick += 5;
    }

    clickCost = Math.floor(clickCost * 1.5);
    updateStars();
    updateShop();
    saveGame();
  }
});

// Comprar satélite (genera 2/s)
autoBtn.addEventListener("click", () => {
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

// Reiniciar progreso
resetBtn.addEventListener("click", () => {
  if (confirm("¿Seguro que quieres reiniciar tu progreso?")) {
    localStorage.removeItem("stellarSave");
    stars = 0;
    starsPerClick = 1;
    autoStars = 0;
    clickCost = 10;
    autoCost = 50;
    satellitesContainer.innerHTML = "";
    updateStars();
    updateShop();
    alert("Progreso reiniciado.");
  }
});

// Generar estrellas automáticas (2 por satélite)
setInterval(() => {
  if (autoStars > 0) {
    stars += autoStars * 2;
    updateStars();
    spawnFloating(`+${autoStars * 2} ⭐`);
    saveGame();
  }
}, 1000);

// Guardar juego
function saveGame() {
  const saveData = { stars, starsPerClick, autoStars, clickCost, autoCost };
  localStorage.setItem("stellarSave", JSON.stringify(saveData));
}

// Cargar juego
function loadGame() {
  const data = localStorage.getItem("stellarSave");
  if (data) {
    const save = JSON.parse(data);
    stars = save.stars || 0;
    starsPerClick = save.starsPerClick || 1;
    autoStars = save.autoStars || 0;
    clickCost = save.clickCost || 10;
    autoCost = save.autoCost || 50;
    updateStars();
    updateShop();
  }
}

// --- Funciones auxiliares ---
function updateStars() {
  coinsDisplay.innerText = stars;
  clickPowerDisplay.innerText = starsPerClick;
}

function updateShop() {
  clickCostDisplay.innerText = clickCost;
  autoCostDisplay.innerText = autoCost;
  autoCountDisplay.innerText = autoStars;
}

function spawnFloating(text) {
  const el = document.createElement("div");
  el.className = "floating";
  el.innerText = text;
  el.style.left = (Math.random() * 200 + 100) + "px";
  el.style.color = ["#facc15","#a78bfa","#38bdf8","#f472b6"][Math.floor(Math.random()*4)];
  effects.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

function renderSatellites() {
  satellitesContainer.innerHTML = "";
  for (let i = 0; i < autoStars; i++) {
    const sat = document.createElement("div");
    sat.className = "satellite";
    const shade = 180 + Math.floor(Math.random() * 60);
    sat.style.background = `rgb(${shade},${shade},${shade})`;
    sat.style.animationDuration = (5 + Math.random() * 3) + "s";
    sat.style.transform = `rotate(${(360/autoStars)*i}deg) translateX(120px)`;
    satellitesContainer.appendChild(sat);
  }
}

// --- Fondo estrellas fugaces ---
const canvas = document.getElementById("background");
const ctx = canvas.getContext("2d");
let w, h;
function resizeCanvas() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let starsArray = [];
function createStars() {
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

// --- Skill: boost temporal ---
let boostActive = false;
let boostCooldown = false;

const skillBtn = document.getElementById("skill-boost");
skillBtn.addEventListener("click", () => {
  if (!boostCooldown) {
    boostActive = true;
    boostCooldown = true;
    starsPerClick *= 2;
    skillBtn.innerText = "¡Poder Doble Activo!";
    setTimeout(() => {
      starsPerClick /= 2;
      boostActive = false;
      skillBtn.innerText = "Doble Poder en CD...";
      setTimeout(() => {
        boostCooldown = false;
        skillBtn.innerText = "Doble Poder (CD 30s)";
      }, 30000); // cooldown más largo
    }, 10000); // 10s activo
  }
});

// --- Meteorito evento ---
const meteoriteEl = document.getElementById("meteorite");
const meteoriteBody = document.querySelector(".meteorite-body");
const meteoriteHpEl = document.getElementById("meteorite-hp");

let meteoriteHP = 0;
function spawnMeteorite() {
  // Escala con clics + satélites
  meteoriteHP = (starsPerClick * 30) + (autoStars * 40) + 200;
  meteoriteHpEl.innerText = "HP: " + meteoriteHP;
  meteoriteEl.classList.remove("hidden");
}

meteoriteBody.addEventListener("click", () => {
  if (meteoriteHP > 0) {
    meteoriteHP -= starsPerClick;
    meteoriteHpEl.innerText = "HP: " + meteoriteHP;
    if (meteoriteHP <= 0) {
      meteoriteEl.classList.add("hidden");
      // recompensa: al menos una mejora
      const reward = Math.max(clickCost, autoCost);
      stars += reward;
      updateStars();
      spawnFloating("¡+ " + reward + " ⭐ del meteorito!");
    }
  }
});

// Spawnea meteoritos cada 60–90s
setInterval(() => {
  if (Math.random() < 0.5) {
    spawnMeteorite();
  }
}, 60000);
