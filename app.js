// ===== ELEMENTOS =====
const songList = document.getElementById("songList");
const serviceSongList = document.getElementById("serviceSongList");

const newSongBtn = document.getElementById("newSongBtn");
const newServiceBtn = document.getElementById("newServiceBtn");
const deleteServiceBtn = document.getElementById("deleteServiceBtn");
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

// ===== DATOS =====
let songs = JSON.parse(localStorage.getItem("songs")) || [];
let services = JSON.parse(localStorage.getItem("services")) || [];

let currentSongId = null;
let currentServiceId = "";
let draggedSongId = null;

// ===== GUARDAR =====
function saveData() {
  localStorage.setItem("songs", JSON.stringify(songs));
  localStorage.setItem("services", JSON.stringify(services));
}

// ===== SERVICIOS =====
function renderServices() {
  serviceSelect.innerHTML = `<option value="">— Ver todas —</option>`;
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

  let list = songs;
  if (currentServiceId) {
    const srv = services.find(s => s.id === currentServiceId);
    if (srv) {
      list = srv.order
        .map(id => songs.find(song => song.id === id))
        .filter(Boolean);
    }
  }

  list.forEach(song => {
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
  if (!song) return;

  currentSongId = id;
  editorTitle.textContent = song.title;
  editorText.value = song.content || "";
  songType.value = song.type || "";
  songService.value = song.serviceId || "";

  editor.classList.remove("hidden");
  songList.classList.add("hidden");
}

function closeEditor() {
  editor.classList.add("hidden");
  songList.classList.remove("hidden");
  renderSongs();
}

saveBtn.onclick = () => {
  const song = songs.find(s => s.id === currentSongId);
  if (!song) return;

  const prevService = song.serviceId;

  song.content = editorText.value;
  song.type = songType.value;
  song.serviceId = songService.value;

  if (prevService) {
    const oldSrv = services.find(s => s.id === prevService);
    if (oldSrv) {
      oldSrv.order = oldSrv.order.filter(id => id !== song.id);
    }
  }

  if (song.serviceId) {
    const srv = services.find(s => s.id === song.serviceId);
    if (srv && !srv.order.includes(song.id)) {
      srv.order.push(song.id);
    }
  }

  saveData();
  closeEditor();
};

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

// ===== ELIMINAR SERVICIO =====
deleteServiceBtn.onclick = () => {
  if (!currentServiceId) {
    alert("Selecciona un servicio");
    return;
  }

  if (!confirm("¿Eliminar este servicio?")) return;

  songs.forEach(song => {
    if (song.serviceId === currentServiceId) {
      song.serviceId = "";
    }
  });

  services = services.filter(s => s.id !== currentServiceId);
  currentServiceId = "";

  saveData();
  renderServices();
  renderSongs();
};

// ===== SELECCIÓN DE SERVICIO =====
serviceSelect.onchange = e => {
  currentServiceId = e.target.value;
  renderSongs();
};

// ===== SERVICIO EN VIVO (ORDENABLE) =====
serviceLiveBtn.onclick = () => {
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
  if (!srv) return;

  srv.order.forEach(id => {
    const song = songs.find(s => s.id === id);
    if (!song) return;

    const div = document.createElement("div");
    div.className = "song";
    div.textContent = song.title;
    div.draggable = true;

    div.addEventListener("dragstart", () => {
      draggedSongId = id;
      div.classList.add("dragging");
    });

    div.addEventListener("dragend", () => {
      div.classList.remove("dragging");
    });

    div.addEventListener("dragover", e => {
      e.preventDefault();
    });

    div.addEventListener("drop", () => {
      const from = srv.order.indexOf(draggedSongId);
      const to = srv.order.indexOf(id);

      if (from !== to) {
        srv.order.splice(to, 0, srv.order.splice(from, 1)[0]);
        saveData();
        renderServiceSongs();
      }
    });

    // tocar canción → mostrar en vivo
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

// ===== SALIR DEL SERVICIO =====
exitServiceBtn.onclick = () => {
  serviceLive.classList.add("hidden");
  songList.classList.remove("hidden");
};

// ===== INIT =====
renderServices();
renderSongs();


