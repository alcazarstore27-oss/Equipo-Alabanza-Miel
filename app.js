const songList = document.getElementById("songList");
const newSongBtn = document.getElementById("newSongBtn");
const altarBtn = document.getElementById("altarBtn");
const searchInput = document.getElementById("searchInput");

const editor = document.getElementById("editor");
const editorTitle = document.getElementById("editorTitle");
const editorText = document.getElementById("editorText");
const saveBtn = document.getElementById("saveBtn");
const backBtn = document.getElementById("backBtn");

let songs = JSON.parse(localStorage.getItem("songs")) || [];
let currentSongId = null;
let altarMode = false;

/* ---------- GUARDAR ---------- */
function saveSongs() {
  localStorage.setItem("songs", JSON.stringify(songs));
}

/* ---------- RENDER ---------- */
function renderSongs(filter = "") {
  songList.innerHTML = "";

  songs
    .filter(s => s.title.toLowerCase().includes(filter.toLowerCase()))
    .forEach(song => {
      const div = document.createElement("div");
      div.className = "song";
      div.innerHTML = `
        <h3>${song.title}</h3>
        <p>${song.content.slice(0, 40)}...</p>
      `;
      div.onclick = () => openEditor(song.id);
      songList.appendChild(div);
    });
}

/* ---------- NUEVA CANCIÓN ---------- */
newSongBtn.onclick = () => {
  const title = prompt("Nombre de la canción:");
  if (!title) return;

  songs.push({
    id: Date.now().toString(),
    title,
    content: ""
  });

  saveSongs();
  renderSongs();
};

/* ---------- EDITOR ---------- */
function openEditor(id) {
  const song = songs.find(s => s.id === id);
  if (!song) return;

  currentSongId = id;
  editorTitle.textContent = song.title;
  editorText.value = song.content;

  editor.classList.remove("hidden");
  songList.classList.add("hidden");
}

saveBtn.onclick = () => {
  const song = songs.find(s => s.id === currentSongId);
  if (!song) return;

  song.content = editorText.value;
  saveSongs();
  closeEditor();
  renderSongs();
};

backBtn.onclick = closeEditor;

function closeEditor() {
  editor.classList.add("hidden");
  songList.classList.remove("hidden");
  currentSongId = null;
}

/* ---------- BUSCAR ---------- */
searchInput.oninput = e => {
  renderSongs(e.target.value);
};

/* ---------- MODO EN VIVO ---------- */
altarBtn.onclick = () => {
  altarMode = !altarMode;
  document.body.classList.toggle("altar", altarMode);
  altarBtn.textContent = altarMode ? "❌ Salir En Vivo" : "🎹 En Vivo";
};

/* ---------- INIT ---------- */
renderSongs();
