let stars = 0;
let starsPerClick = 1;
let autoStars = 0;

// Costos base
let clickCost = 10;
let autoCost = 50;

// Elementos
const startScreen = document.getElementById("start-screen");
const playBtn = document.getElementById("play-btn");
const gameMain = document.getElementById("game");
const planetBtn = document.getElementById("planet-btn");
const coinsDisplay = document.getElementById("coins-display");
const effects = document.getElementById("effects");

const clickBtn = document.getElementById("upgrade-click");
const autoBtn = document.getElementById("upgrade-auto");
const clickCostDisplay = document.getElementById("click-cost");
const autoCostDisplay = document.getElementById("auto-cost");
const autoCountDisplay = document.getElementById("auto-count");

// Iniciar juego
playBtn.addEventListener("click", () => {
  startScreen.classList.add("hidden");
  gameMain.classList.remove("hidden");
});

// Click en planeta
planetBtn.addEventListener("click", () => {
  stars += starsPerClick;
  updateStars();
  spawnFloating(`+${starsPerClick} ⭐`);
});

// Comprar mejora de clic
clickBtn.addEventListener("click", () => {
  if (stars >= clickCost) {
    stars -= clickCost;
    starsPerClick++;
    clickCost = Math.floor(clickCost * 1.5); // Aumento de dificultad
    updateStars();
    updateShop();
  }
});

// Comprar mejora automática
autoBtn.addEventListener("click", () => {
  if (stars >= autoCost) {
    stars -= autoCost;
    autoStars++;
    autoCost = Math.floor(autoCost * 1.5); // Aumento de dificultad
    updateStars();
    updateShop();
  }
});

// Generar estrellas automáticas cada segundo
setInterval(() => {
  if (autoStars > 0) {
    stars += autoStars;
    updateStars();
    spawnFloating(`+${autoStars} ⭐`);
  }
}, 1000);

// --- Funciones auxiliares ---
function updateStars() {
  coinsDisplay.innerText = stars;
}

function updateShop() {
  clickCostDisplay.innerText = clickCost;
  autoCostDisplay.innerText = autoCost;
  autoCountDisplay.innerText = autoStars;
}

// Texto flotante
function spawnFloating(text) {
  const el = document.createElement("div");
  el.className = "floating";
  el.innerText = text;
  el.style.left = (50 + Math.random()*100) + "px";
  el.style.color = "#facc15";
  effects.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}
