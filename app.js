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

let songs = JSON.parse(localStorage.getItem("songs")) || [];
let services = JSON.parse(localStorage.getItem("services")) || [];

let currentSongId = null;
let currentService = "";
let altarMode = false;

function saveData() {
  localStorage.setItem("songs", JSON.stringify(songs));
  localStorage.setItem("services", JSON.stringify(services));
}

function renderServices() {
  serviceSelect.innerHTML = `<option value="">— Ver todas —</option>`;
  services.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.date;
    serviceSelect.appendChild(opt);
  });
}

function renderSongs() {
  songList.innerHTML = "";

  let list = songs;
  if (currentService) {
    const srv = services.find(s => s.id === currentService);
    if (!srv) return;
    list = srv.order.map(id => songs.find(s => s.id === id)).filter(Boolean);
  }

  const alab = list.filter(s => s.type === "alabanza");
  const ador = list.filter(s => s.type === "adoracion");
  const sinTipo = list.filter(s => !s.type);

  renderBlock("🎶 Alabanza", alab);
  renderBlock("🙏 Adoración", ador);
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

function openEditor(id) {
  const song = songs.find(s => s.id === id);
  if (!song) return;

  currentSongId = id;

  editorTitle.textContent = song.title;
  editorText.value = song.content || "";
  songType.value = song.type || "";

  editor.classList.remove("hidden");
  songList.classList.add("hidden");
}

function closeEditor() {
  editor.classList.add("hidden");
  songList.classList.remove("hidden");
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

// ✅ AQUÍ ESTABA EL PROBLEMA
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

  // 👉 ABRIR EDITOR AUTOMÁTICAMENTE
  openEditor(newSong.id);
};

newServiceBtn.onclick = () => {
  const date = prompt("Fecha del servicio");
  if (!date) return;

  services.push({
    id: Date.now().toString(),
    date,
    order: songs.map(s => s.id)
  });

  saveData();
  renderServices();
};

serviceSelect.onchange = e => {
  currentService = e.target.value;
  renderSongs();
};

altarBtn.onclick = () => {
  altarMode = !altarMode;
  altarBtn.textContent = altarMode ? "❌ Salir En Vivo" : "🎹 En Vivo";
};

exitLive.onclick = () => {
  liveView.classList.add("hidden");
};

renderServices();
renderSongs();
