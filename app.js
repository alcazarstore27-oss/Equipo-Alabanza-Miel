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
const songService = document.getElementById("songService");
const saveBtn = document.getElementById("saveBtn");
const backBtn = document.getElementById("backBtn");

const serviceLive = document.getElementById("serviceLive");
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
  songService.innerHTML = `<option value="">— Sin asignar —</option>`;

  services.forEach(s => {
    const opt1 = document.createElement("option");
    opt1.value = s.id;
    opt1.textContent = s.date;
    serviceSelect.appendChild(opt1);

    const opt2 = opt1.cloneNode(true);
    songService.appendChild(opt2);
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
  songService.value = song.serviceId || "";

  editor.classList.remove("hidden");
  songList.classList.add("hidden");
}

saveBtn.onclick = () => {
  const song = songs.find(s => s.id === currentSongId);
  const previousService = song.serviceId;

  song.content = editorText.value;
  song.type = songType.value;
  song.serviceId = songService.value;

  // Quitar del servicio anterior
  if (previousService) {
    const oldSrv = services.find(s => s.id === previousService);
    if (oldSrv) {
      oldSrv.order = oldSrv.order.filter(id => id !== song.id);
    }
  }

  // Agregar al nuevo servicio
  if (song.serviceId) {
    const srv = services.find(s => s.id === song.serviceId);
    if (srv && !srv.order.includes(song.id)) {
      srv.order.push(song.id);
    }
  }

  saveData();
  closeEditor();
};

function closeEditor() {
  editor.classList.add("hidden");
  songList.classList.remove("hidden");
  renderSongs();
}

backBtn.onclick = closeEditor;

// ===== NUEVA CANCIÓN =====
newSongBtn.onclick = () => {
  const title = prompt("Nombre de la canción");
  if (!title) return;
  songs.push({
    id: Date.now().toString(),
    title,
    content: "",
    type: "",
    serviceId: ""
  });
  saveData();
  renderSongs();
};

// ===== NUEVO SERVICIO =====
newServiceBtn.onclick = () => {
  const date = prompt("Fecha del servicio");
  if (!date) return;
  services.push({
    id: Date.now().toString(),
    date,
    order: []
  });
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

// ===== SALIR =====
exitServiceBtn.onclick = () => {
  serviceLive.classList.add("hidden");
  songList.classList.remove("hidden");
};

// ===== INIT =====
renderServices();
renderSongs();
