document.addEventListener("DOMContentLoaded", () => {
  console.log("GAME.JS OK");

  /* =========================
     RESET SÉCURITÉ (TEMPORAIRE)
     👉 enlève-le plus tard
  ========================= */
  localStorage.removeItem("riddles");

  /* =========================
     VARIABLES
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
     GPS
  ========================= */

  const playerMarker = L.circleMarker([0, 0], {
    radius: 7,
    color: "#00e5ff",
    fillOpacity: 1,
  }).addTo(map);

  if ("geolocation" in navigator) {
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
  }

  /* =========================
     10 ÉNIGMES DE BASE
  ========================= */

  const riddles = [
    { title:"Louvre", question:"Une pyramide de verre protège l’entrée.", answer:"pyramide", hints:["Verre","Égypte"], lat:48.8606, lng:2.3376, baseScore:100 },
    { title:"Notre-Dame", question:"Une fleur de vitrail.", answer:"rose", hints:["Vitrail","Rosace"], lat:48.8530, lng:2.3499, baseScore:110 },
    { title:"Tour Eiffel", question:"Métal emblématique.", answer:"fer", hints:["Métal","Rouille"], lat:48.8584, lng:2.2945, baseScore:120 },
    { title:"Arc de Triomphe", question:"Empereur bâtisseur.", answer:"napoléon", hints:["Empereur","Bonaparte"], lat:48.8738, lng:2.2950, baseScore:130 },
    { title:"Concorde", question:"Monument égyptien.", answer:"obélisque", hints:["Égypte","Colonne"], lat:48.8656, lng:2.3211, baseScore:110 },
    { title:"Panthéon", question:"Mot gravé.", answer:"patrie", hints:["Nation","Hommage"], lat:48.8462, lng:2.3459, baseScore:120 },
    { title:"Montmartre", question:"Basilique blanche.", answer:"sacré", hints:["Cœur","Butte"], lat:48.8867, lng:2.3431, baseScore:120 },
    { title:"Orsay", question:"Ancienne fonction.", answer:"gare", hints:["Train","Voyage"], lat:48.8600, lng:2.3266, baseScore:130 },
    { title:"Luxembourg", question:"Palais voisin.", answer:"palais", hints:["Sénat","Jardin"], lat:48.8462, lng:2.3372, baseScore:100 },
    { title:"Pompidou", question:"Tuyaux visibles.", answer:"tuyaux", hints:["Extérieur","Couleurs"], lat:48.8606, lng:2.3522, baseScore:140 },
  ];

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
      alert("Mauvaise réponse");
      return;
    }

    score += currentRiddle.baseScore;
    scoreEl.textContent = score;
    modal.classList.add("hidden");
    currentRiddle = null;
  };

  hintBtn.onclick = () => {
    if (currentRiddle && hintIndex < currentRiddle.hints.length) {
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

  if (addBtn) {
    addBtn.onclick = () => {
      placing = true;
      alert("Clique sur la carte pour placer l’énigme");
    };
  }

  map.on("click", e => {
    if (!placing) return;
    pendingLatLng = e.latlng;
    placing = false;
    createModal.classList.remove("hidden");
  });

  saveBtn.onclick = () => {
    alert("Création OK (logique prête)");
    createModal.classList.add("hidden");
  };

  cancelBtn.onclick = () => {
    createModal.classList.add("hidden");
  };
});
