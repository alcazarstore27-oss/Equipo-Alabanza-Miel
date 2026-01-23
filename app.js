// ===== ELEMENTOS =====
const songList = document.getElementById("songList");
const newSongBtn = document.getElementById("newSongBtn");
const newServiceBtn = document.getElementById("newServiceBtn");
const serviceSelect = document.getElementById("serviceSelect");
const altarBtn = document.getElementById("altarBtn");

const editor = document.getElementById("editor");
const editorTitle = document.getElementById("editorTitle");
const editorText = document.getElementById("editorText");
const songType = document.getElementById("songType");
const saveBtn = document.getElementById("saveBtn");
const backBtn = document.getElementById("backBtn");

const liveView = document.getElementById("liveView");
const liveContent = document.getElementById("liveContent");
const exitLive = document.getElementById("exitLive");

// ===== DATOS =====
let songs = JSON.parse(localStorage.getItem("songs")) || [];
let services = JSON.parse(localStorage.getItem("services")) || [];

let currentSongId = null;
let currentService = "";
let altarMode = false;

// ===== GUARDAR =====
function saveData() {
  localStorage.setItem("songs", JSON.stringify(songs));
  localStorage.setItem("services", JSON.stringify(services));
}

// ===== SERVICIOS =====
function renderServices() {
  serviceSelect.innerHTML = `<option value="">— Ver todas —</option>`;
  services.forEach(service => {
    const opt = document.createElement("option");
    opt.value = service.id;
    opt.textContent = service.date;
    serviceSelect.appendChild(opt);
  });
}

// ===== CANCIONES =====
function renderSongs() {
  songList.innerHTML = "";

  let list = [...songs];

  if (currentService) {
    const srv = services.find(s => s.id === currentService);
    if (srv) {
      list = srv.order
        .map(id => songs.find(song => song.id === id))
        .filter(Boolean);
    }
  }

  const alabanza = list.filter(s => s.type === "alabanza");
  const adoracion = list.filter(s => s.type === "adoracion");
  const sinTipo = list.filter(s => !s.type);

  renderBlock("🎶 Alabanza", alabanza);
  renderBlock("🙏 Adoración", adoracion);
  renderBlock("📌 Sin clasificar", sinTipo);
}

function renderBlock(title, list) {
  if (!list.length) return;

  const h = document.createElement("h3");
  h.className = "block-title";
  h.textContent = title;
  songList.appendChild(h);

  list.forEach(song => {
    const div = document.createElement("div");
    div.className = "song";
    div.textContent = song.title;

    div.onclick = () => {
      if (altarMode) {
        liveContent.textContent = song.content || "";
        liveView.classList.remove("hidden");
      } else {
        openEditor(song.id);
      }
    };

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

  renderEditorServices();

  songList.classList.add("hidden");
  editor.classList.remove("hidden");
}

function renderEditorServices() {
  // elimina selector previo si existe
  const old = document.getElementById("editorServiceBlock");
  if (old) old.remove();

  if (!services.length) return;

  const container = document.createElement("div");
  container.id = "editorServiceBlock";

  const label = document.createElement("label");
  label.innerHTML = "<strong>Servicio</strong>";

  const select = document.createElement("select");
  select.id = "editorServiceSelect";

  services.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.date;
    select.appendChild(opt);
  });

  const btn = document.createElement("button");
  btn.textContent = "➕ / ➖ Agregar o quitar del servicio";

  btn.onclick = () => {
    const serviceId = select.value;
    const srv = services.find(s => s.id === serviceId);
    if (!srv) return;

    const index = srv.order.indexOf(currentSongId);

    if (index === -1) {
      srv.order.push(currentSongId);
      alert("Canción agregada al servicio");
    } else {
      srv.order.splice(index, 1);
      alert("Canción quitada del servicio");
    }

    saveData();
    renderSongs();
  };

  container.appendChild(label);
  container.appendChild(select);
  container.appendChild(btn);

  editor.insertBefore(container, editorText);
}

function closeEditor() {
  editor.classList.add("hidden");
  songList.classList.remove("hidden");
  currentSongId = null;
}

saveBtn.onclick = () => {
  const song = songs.find(s => s.id === currentSongId);
  if (!song) return;

  song.content = editorText.value;
  song.type = songType.value;

  saveData();
  closeEditor();
  renderSongs();
};

backBtn.onclick = closeEditor;

// ===== NUEVA CANCIÓN =====
newSongBtn.onclick = () => {
  const title = prompt("Nombre de la canción");
  if (!title) return;

  const newSong = {
    id: Date.now().toString(),
    title,
    type: "",
    content: ""
  };

  songs.push(newSong);
  saveData();
  renderSongs();
  openEditor(newSong.id);
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

// ===== FILTRO =====
serviceSelect.onchange = e => {
  currentService = e.target.value;
  renderSongs();
};

// ===== MODO EN VIVO =====
altarBtn.onclick = () => {
  altarMode = !altarMode;
  altarBtn.textContent = altarMode ? "❌ Salir En Vivo" : "🎹 En Vivo";
};

exitLive.onclick = () => {
  liveView.classList.add("hidden");
};

// ===== INICIO =====
renderServices();
renderSongs();

