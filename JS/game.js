/* =========================
   VARIABLES GLOBALES
========================= */

let score = 0;
let currentRiddle = null;
let hintIndex = 0;
let startTime = 0;
let timerInterval = null;
let playerPos = null;

let placing = false;
let pendingLatLng = null;

/* =========================
   UI
========================= */

const scoreEl = document.getElementById("score");
const modal = document.getElementById("riddleModal");
const createModal = document.getElementById("createModal");

const titleEl = document.getElementById("riddleTitle");
const questionEl = document.getElementById("riddleQuestion");
const inputEl = document.getElementById("answerInput");
const timerEl = document.getElementById("timer");

const validateBtn = document.getElementById("validateBtn");
const hintBtn = document.getElementById("hintBtn");
const quitBtn = document.getElementById("quitBtn");

const addBtn = document.getElementById("addRiddleBtn");
const saveBtn = document.getElementById("saveRiddleBtn");
const cancelBtn = document.getElementById("cancelRiddleBtn");

const qInput = document.getElementById("newQuestion");
const aInput = document.getElementById("newAnswer");
const h1Input = document.getElementById("newHint1");
const h2Input = document.getElementById("newHint2");

/* =========================
   MAP
========================= */

const map = L.map("map").setView([48.8566, 2.3522], 13);

L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  { attribution: "© OpenStreetMap © CartoDB" }
).addTo(map);

/* =========================
   PLAYER (GPS)
========================= */

const playerMarker = L.circleMarker([0, 0], {
  radius: 7,
  color: "#00e5ff",
  fillOpacity: 1,
}).addTo(map);

navigator.geolocation.watchPosition(
  pos => {
    playerPos = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
    };
    playerMarker.setLatLng([playerPos.lat, playerPos.lng]);
  },
  err => console.error(err),
  { enableHighAccuracy: true }
);

/* =========================
   ÉNIGMES DE BASE (10)
========================= */

const BASE_RIDDLES = [
  {
    title: "Le Secret du Louvre",
    question:
      "Sous la cour silencieuse, une forme géométrique capte la lumière du ciel.\nElle garde l’entrée d’un ancien palais royal.\nQuel est son nom ?",
    answer: "pyramide",
    hints: ["Elle est en verre.", "Sa forme vient d’Égypte."],
    lat: 48.8606,
    lng: 2.3376,
    baseScore: 100,
  },
  {
    title: "Les Pierres de Notre-Dame",
    question:
      "Quand le soleil traverse les vitraux,\nune fleur de lumière apparaît.\nComment la nomme-t-on ?",
    answer: "rose",
    hints: ["C’est un vitrail.", "On parle aussi de rosace."],
    lat: 48.8530,
    lng: 2.3499,
    baseScore: 110,
  },
  {
    title: "La Dame de Fer",
    question:
      "Elle domine Paris sans pierre ni bois.\nDe quel matériau est-elle faite ?",
    answer: "fer",
    hints: ["C’est un métal.", "Il peut rouiller."],
    lat: 48.8584,
    lng: 2.2945,
    baseScore: 120,
  },
  {
    title: "L’Arc de Triomphe",
    question:
      "Érigé pour célébrer des victoires,\nil fut commandé par un empereur.\nQui est-il ?",
    answer: "napoléon",
    hints: ["Empereur français.", "Napoléon Bonaparte."],
    lat: 48.8738,
    lng: 2.2950,
    baseScore: 130,
  },
  {
    title: "Place de la Concorde",
    question:
      "Au centre de la place se dresse\nun monument venu d’un autre continent.\nQuel est-il ?",
    answer: "obélisque",
    hints: ["Il vient d’Égypte.", "C’est une colonne."],
    lat: 48.8656,
    lng: 2.3211,
    baseScore: 110,
  },
  {
    title: "Le Panthéon",
    question:
      "Sur son fronton est inscrit\nun hommage à ceux qu’il abrite.\nQuel mot y lit-on ?",
    answer: "patrie",
    hints: ["Hommage national.", "Aux grands hommes."],
    lat: 48.8462,
    lng: 2.3459,
    baseScore: 120,
  },
  {
    title: "Montmartre",
    question:
      "Cette colline veille sur Paris.\nQuelle basilique s’y dresse ?",
    answer: "sacré",
    hints: ["Elle est blanche.", "Son nom est Sacré-Cœur."],
    lat: 48.8867,
    lng: 2.3431,
    baseScore: 120,
  },
  {
    title: "Musée d’Orsay",
    question:
      "Avant d’abriter des œuvres,\nce bâtiment avait une autre fonction.\nLaquelle ?",
    answer: "gare",
    hints: ["Transports.", "Trains."],
    lat: 48.8600,
    lng: 2.3266,
    baseScore: 130,
  },
  {
    title: "Jardin du Luxembourg",
    question:
      "Quel palais borde ce jardin\nau cœur de la rive gauche ?",
    answer: "palais",
    hints: ["Même nom que le jardin.", "Luxembourg."],
    lat: 48.8462,
    lng: 2.3372,
    baseScore: 100,
  },
  {
    title: "Centre Pompidou",
    question:
      "Ce bâtiment montre ce que d’autres cachent.\nQuel élément architectural est visible ?",
    answer: "tuyaux",
    hints: ["À l’extérieur.", "Colorés."],
    lat: 48.8606,
    lng: 2.3522,
    baseScore: 140,
  },
];

/* =========================
   CHARGEMENT DES ÉNIGMES
========================= */

let riddles = JSON.parse(localStorage.getItem("riddles"));

if (!riddles || riddles.length === 0) {
  riddles = BASE_RIDDLES;
  localStorage.setItem("riddles", JSON.stringify(riddles));
}

/* =========================
   MARKERS
========================= */

riddles.forEach(r => {
  const m = L.circleMarker([r.lat, r.lng], {
    radius: 8,
    color: "#e0c36a",
    fillOpacity: 0.9,
  }).addTo(map);

  m.on("click", () => openRiddle(r));
});

/* =========================
   GAMEPLAY
========================= */

function openRiddle(r) {
  currentRiddle = r;
  hintIndex = 0;

  titleEl.textContent = r.title;
  questionEl.textContent = r.question;
  inputEl.value = "";
  modal.classList.remove("hidden");

  startTime = Date.now();
  timerEl.textContent = "0";

  timerInterval = setInterval(() => {
    timerEl.textContent = Math.floor((Date.now() - startTime) / 1000);
  }, 1000);
}

validateBtn.onclick = () => {
  clearInterval(timerInterval);
  if (!currentRiddle) return;

  if (!inputEl.value.toLowerCase().includes(currentRiddle.answer)) {
    alert("Ce n’est pas la bonne réponse.");
    return;
  }

  const time = (Date.now() - startTime) / 1000;

  let gpsBonus = 1;
  if (playerPos) {
    const d = getDistance(playerPos, currentRiddle);
    if (d <= 10) gpsBonus = 1.2;
    else if (d <= 30) gpsBonus = 1.1;
  }

  const hintPenalty = Math.max(0.6, 1 - hintIndex * 0.15);
  const timeBonus = Math.max(0.5, 1.5 - time / 30);

  const gained = Math.floor(
    currentRiddle.baseScore * gpsBonus * hintPenalty * timeBonus
  );

  score += gained;
  scoreEl.textContent = score;
  modal.classList.add("hidden");
  currentRiddle = null;
};

hintBtn.onclick = () => {
  if (hintIndex < currentRiddle.hints.length) {
    alert("Indice : " + currentRiddle.hints[hintIndex++]);
  }
};

quitBtn.onclick = () => {
  clearInterval(timerInterval);
  modal.classList.add("hidden");
  currentRiddle = null;
};

/* =========================
   CRÉATION D'ÉNIGME
========================= */

addBtn.onclick = () => {
  placing = true;
  alert("Clique sur la carte pour placer l’énigme");
};

map.on("click", e => {
  if (!placing) return;
  pendingLatLng = e.latlng;
  placing = false;
  createModal.classList.remove("hidden");
});

saveBtn.onclick = () => {
  const newRiddle = {
    title: "Énigme personnalisée",
    question: qInput.value,
    answer: aInput.value.toLowerCase(),
    hints: [h1Input.value, h2Input.value].filter(Boolean),
    lat: pendingLatLng.lat,
    lng: pendingLatLng.lng,
    baseScore: 120,
  };

  riddles.push(newRiddle);
  localStorage.setItem("riddles", JSON.stringify(riddles));
  location.reload();
};

cancelBtn.onclick = () => {
  createModal.classList.add("hidden");
};

/* =========================
   UTILITAIRE DISTANCE
========================= */

function getDistance(p, r) {
  const R = 6371000;
  const dLat = (r.lat - p.lat) * Math.PI / 180;
  const dLon = (r.lng - p.lng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(p.lat * Math.PI / 180) *
    Math.cos(r.lat * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
