let stars = 0;

// Elementos
const startScreen = document.getElementById("start-screen");
const playBtn = document.getElementById("play-btn");
const gameMain = document.getElementById("game");
const planetBtn = document.getElementById("planet-btn");
const coinsDisplay = document.getElementById("coins-display");
const effects = document.getElementById("effects");

// Iniciar juego
playBtn.addEventListener("click", () => {
  startScreen.classList.add("hidden");
  gameMain.classList.remove("hidden");
});

// Click en planeta
planetBtn.addEventListener("click", () => {
  stars++;
  coinsDisplay.innerText = stars;
  spawnFloating("+1 ⭐");
});

// Texto flotante
function spawnFloating(text) {
  const el = document.createElement("div");
  el.className = "floating";
  el.innerText = text;
  el.style.left = (50 + Math.random()*100) + "px";
  el.style.color = "#a855f7";
  effects.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}
