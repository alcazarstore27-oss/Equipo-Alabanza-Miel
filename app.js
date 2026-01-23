const songList = document.getElementById("songList");
const serviceSongList = document.getElementById("serviceSongList");

const newSongBtn = document.getElementById("newSongBtn");
const newServiceBtn = document.getElementById("newServiceBtn");
const serviceSelect = document.getElementById("serviceSelect");
const serviceLiveBtn = document.getElementById("serviceLiveBtn");

const editor = document.getElementById("editor");
const editorTitle = document.getElementById("editorTitle");
const editorText = document.getElementById("editorText");
const songType = document.getElementById("songType");
const saveBtn = document.getElementById("saveBtn");
const backBtn = document.getElementById("backBtn");

const serviceLive = document.getElementById("serviceLive");
const goLiveBtn = document.getElementById("goLiveBtn");
const exitServiceBtn = document.getElementById("exitServiceBtn");

const liveView = document.getElementById("liveView");
const liveContent = document.getElementById("liveContent");

let songs = JSON.parse(localStorage.getItem("songs")) || [];
let services = JSON.parse(localStorage.getItem("services")) || [];

let currentSongId = null;
let currentServiceId = null;
let dragId = null;

// ===== GUARDAR =====
function saveData() {
  localStorage.setItem("songs", JSON.stringify(songs));
  localStorage.setItem("services", JSON.stringify(services));
}

// ===== SERVICIOS =====
function renderServices() {
  serviceSelect.innerHTML = `<option value="">— Seleccionar servicio —</option>`;
  services.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.date;
    serviceSelect.appendChild(opt);
  });
}

// ===== LISTA PRINCIPAL =====
function renderSongs() {
  songList.innerHTML = "";
  songs.forEach(song => {
    const div = document.createElement("div");
    div.className = "song";
    div.textContent = song.title;
    div.onclick = () => openEditor(song.id);
    songList.appendChild(div);
  });
}

// ===== EDITOR =====
function openEditor(id) {
  const song = songs.find(s => s.id === id);
  currentSongId = id;
  editorTitle.textContent = song.title;
  editorText.value = song.content || "";
  songType.value = song.type || "";
  editor.classList.remove("hidden");
  songList.classList.add("hidden");
}

saveBtn.onclick = () => {
  const song = songs.find(s => s.id === currentSongId);
  song.content = editorText.value;
  song.type = songType.value;
  saveData();
  editor.classList.add("hidden");
  songList.classList.remove("hidden");
  renderSongs();
};

backBtn.onclick = () => {
  editor.classList.add("hidden");
  songList.classList.remove("hidden");
};

// ===== NUEVA CANCIÓN =====
newSongBtn.onclick = () => {
  const title = prompt("Nombre de la canción");
  if (!title) return;
  songs.push({ id: Date.now().toString(), title, content: "", type: "" });
  saveData();
  renderSongs();
};

// ===== NUEVO SERVICIO =====
newServiceBtn.onclick = () => {
  const date = prompt("Fecha del servicio");
  if (!date) return;
  services.push({ id: Date.now().toString(), date, order: [] });
  saveData();
  renderServices();
};

// ===== SERVICIO EN VIVO =====
serviceLiveBtn.onclick = () => {
  currentServiceId = serviceSelect.value;
  if (!currentServiceId) {
    alert("Selecciona un servicio");
    return;
  }
  serviceLive.classList.remove("hidden");
  songList.classList.add("hidden");
  renderServiceSongs();
};

function renderServiceSongs() {
  serviceSongList.innerHTML = "";
  const srv = services.find(s => s.id === currentServiceId);

  srv.order.forEach(id => {
    const song = songs.find(s => s.id === id);
    if (!song) return;

    const div = document.createElement("div");
    div.className = "song";
    div.textContent = song.title;
    div.draggable = true;

    div.ondragstart = () => dragId = id;
    div.ondragover = e => e.preventDefault();
    div.ondrop = () => {
      const from = srv.order.indexOf(dragId);
      const to = srv.order.indexOf(id);
      srv.order.splice(to, 0, srv.order.splice(from, 1)[0]);
      saveData();
      renderServiceSongs();
    };

    div.onclick = () => {
      liveContent.textContent = song.content || "";
      liveView.classList.remove("hidden");
    };

    serviceSongList.appendChild(div);
  });
}

// ===== MODO EN VIVO =====
liveView.onclick = () => {
  liveView.classList.add("hidden");
};

// ===== BOTONES =====
goLiveBtn.onclick = () => alert("Toca una canción para verla en vivo");

exitServiceBtn.onclick = () => {
  serviceLive.classList.add("hidden");
  songList.classList.remove("hidden");
};

// ===== INIT =====
renderServices();
renderSongs();
