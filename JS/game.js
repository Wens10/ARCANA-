document.addEventListener("DOMContentLoaded", () => {

  let score = 0;
  let currentRiddle = null;
  let hintIndex = 0;
  let startTime = 0;
  let timerInterval = null;
  let playerPos = null;
  let placing = false;
  let pendingLatLng = null;

  const scoreEl = document.getElementById("score");
  const modal = document.getElementById("riddleModal");
  const createModal = document.getElementById("createModal");
  const deleteBtn = document.getElementById("deleteBtn");

  const titleEl = document.getElementById("riddleTitle");
  const questionEl = document.getElementById("riddleQuestion");
  const inputEl = document.getElementById("answerInput");
  const timerEl = document.getElementById("timer");
  const proximityEl = document.getElementById("proximityInfo");

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

  const map = L.map("map").setView([48.8566, 2.3522], 13);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png").addTo(map);

  const playerMarker = L.circleMarker([0,0], { radius:7, color:"#00e5ff" }).addTo(map);

  navigator.geolocation.watchPosition(pos => {
    playerPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    playerMarker.setLatLng([playerPos.lat, playerPos.lng]);
  });

  const BASE_RIDDLES = [
    { title:"Louvre", question:"Pyramide de verre.", answer:"pyramide", hints:["Verre","Égypte"], lat:48.8606,lng:2.3376,baseScore:100,createdByUser:false },
    { title:"Tour Eiffel", question:"Métal célèbre.", answer:"fer", hints:["Métal","Rouille"], lat:48.8584,lng:2.2945,baseScore:120,createdByUser:false }
  ];

  let riddles = JSON.parse(localStorage.getItem("riddles")) || BASE_RIDDLES;
  localStorage.setItem("riddles", JSON.stringify(riddles));

  riddles.forEach(addMarker);

  function addMarker(r) {
    const m = L.circleMarker([r.lat,r.lng], {
      radius:8,
      color: r.createdByUser ? "#00e5ff" : "#e0c36a",
      fillOpacity:.9
    }).addTo(map);
    m.on("click",()=>openRiddle(r));
  }

  function getDistance(p,r){
    const R=6371000;
    const dLat=(r.lat-p.lat)*Math.PI/180;
    const dLon=(r.lng-p.lng)*Math.PI/180;
    const a=Math.sin(dLat/2)**2+
      Math.cos(p.lat*Math.PI/180)*Math.cos(r.lat*Math.PI/180)*
      Math.sin(dLon/2)**2;
    return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  }

  function getProximity(p,r){
    if(!p) return {distance:Infinity,label:"❓"};
    const d=getDistance(p,r);
    if(d<10) return {distance:d,label:"📍 Sur place",mult:1.3};
    if(d<30) return {distance:d,label:"🚶 Proche",mult:1.15};
    if(d<100) return {distance:d,label:"🗺️ Éloigné",mult:1};
    return {distance:d,label:"🌍 Très loin",mult:.8};
  }

  function openRiddle(r){
    currentRiddle=r;
    hintIndex=0;
    titleEl.textContent=r.title;
    questionEl.textContent=r.question;
    inputEl.value="";
    modal.classList.remove("hidden");

    const p=getProximity(playerPos,r);
    proximityEl.textContent=`${p.label} • ${Math.round(p.distance)} m`;

    deleteBtn.style.display=r.createdByUser?"block":"none";

    startTime=Date.now();
    timerInterval=setInterval(()=>{
      timerEl.textContent=Math.floor((Date.now()-startTime)/1000);
    },1000);
  }

  validateBtn.onclick=()=>{
    clearInterval(timerInterval);
    if(!inputEl.value.toLowerCase().includes(currentRiddle.answer)) return alert("Mauvaise réponse");

    const p=getProximity(playerPos,currentRiddle);
    const time=(Date.now()-startTime)/1000;
    const scoreGain=Math.floor(currentRiddle.baseScore*p.mult*(1.5-time/30));
    score+=scoreGain;
    scoreEl.textContent=score;
    modal.classList.add("hidden");
  };

  hintBtn.onclick=()=>alert(currentRiddle.hints[hintIndex++]||"Plus d’indices");

  quitBtn.onclick=()=>modal.classList.add("hidden");

  deleteBtn.onclick=()=>{
    if(!confirm("Supprimer ?")) return;
    riddles=riddles.filter(r=>r!==currentRiddle);
    localStorage.setItem("riddles",JSON.stringify(riddles));
    location.reload();
  };

  addBtn.onclick=()=>{ placing=true; alert("Clique sur la carte"); };

  map.on("click",e=>{
    if(!placing) return;
    pendingLatLng=e.latlng;
    placing=false;
    createModal.classList.remove("hidden");
  });

  saveBtn.onclick=()=>{
    const r={
      title:"Énigme perso",
      question:qInput.value,
      answer:aInput.value.toLowerCase(),
      hints:[h1Input.value,h2Input.value].filter(Boolean),
      lat:pendingLatLng.lat,
      lng:pendingLatLng.lng,
      baseScore:120,
      createdByUser:true
    };
    riddles.push(r);
    localStorage.setItem("riddles",JSON.stringify(riddles));
    addMarker(r);
    createModal.classList.add("hidden");
  };

  cancelBtn.onclick=()=>createModal.classList.add("hidden");
});
