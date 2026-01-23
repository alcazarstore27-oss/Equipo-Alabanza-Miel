const songList = document.getElementById("songList");
const newSongBtn = document.getElementById("newSongBtn");
const searchInput = document.getElementById("searchInput");
const altarBtn = document.getElementById("altarBtn");

const newServiceBtn = document.getElementById("newServiceBtn");
const deleteServiceBtn = document.getElementById("deleteServiceBtn");
const serviceSelect = document.getElementById("serviceSelect");

const editor = document.getElementById("editor");
const editorTitle = document.getElementById("editorTitle");
const editorText = document.getElementById("editorText");
const serviceCheckboxes = document.getElementById("serviceCheckboxes");
const saveBtn = document.getElementById("saveBtn");
const backBtn = document.getElementById("backBtn");

let songs = JSON.parse(localStorage.getItem("songs")) || [];
let services = JSON.parse(localStorage.getItem("services")) || [];

let currentSongId = null;
let currentService = "";
let altarMode = false;

/* ---------- GUARDAR ---------- */
function saveAll() {
  localStorage.setItem("songs", JSON.stringify(songs));
  localStorage.setItem("services", JSON.stringify(services));
}

/* ---------- SERVICIOS ---------- */
function renderServices() {
  serviceSelect.innerHTML =
    `<option value="">— Ver todas las canciones —</option>`;

  services.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.date;
    serviceSelect.appendChild(opt);
  });

  deleteServiceBtn.classList.toggle("hidden", !currentService);
}

/* ---------- CANCIONES ---------- */
function renderSongs(filter = "") {
  songList.innerHTML = "";

  let visibleSongs = songs;

  if (currentService) {
    visibleSongs = songs.filter(s =>
      s.services.includes(currentService)
    );
  }

  visibleSongs
    .filter(s =>
      s.title.toLowerCase().includes(filter.toLowerCase())
    )
    .forEach(song => {
      const div = document.createElement("div");
      div.className = "song";
      div.innerHTML = `<h3>${song.title}</h3>`;
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
    content: "",
    services: []
  });

  saveAll();
  renderSongs();
};

/* ---------- NUEVO SERVICIO ---------- */
newServiceBtn.onclick = () => {
  const date = prompt("Fecha del servicio (ej: 2026-02-02):");
  if (!date) return;

  services.push({
    id: Date.now().toString(),
    date
  });

  saveAll();
  renderServices();
};

/* ---------- BORRAR SERVICIO ---------- */
deleteServiceBtn.onclick = () => {
  if (!currentService) return;

  const service = services.find(s => s.id === currentService);
  if (!service) return;

  const ok = confirm(
    `¿Borrar el servicio del ${service.date}?\nLas canciones NO se eliminarán.`
  );

  if (!ok) return;

  services = services.filter(s => s.id !== currentService);

  songs.forEach(song => {
    song.services = song.services.filter(
      id => id !== currentService
    );
  });

  currentService = "";
  saveAll();
  renderServices();
  renderSongs();
};

/* ---------- EDITOR ---------- */
function openEditor(id) {
  const song = songs.find(s => s.id === id);
  if (!song) return;

  currentSongId = id;
  editorTitle.textContent = song.title;
  editorText.value = song.content;

  serviceCheckboxes.innerHTML =
    "<strong>Asignar a servicios:</strong><br>";

  services.forEach(s => {
    const checked = song.services.includes(s.id)
      ? "checked"
      : "";
    serviceCheckboxes.innerHTML += `
      <label>
        <input type="checkbox" value="${s.id}" ${checked}>
        ${s.date}
      </label>
    `;
  });

  editor.classList.remove("hidden");
  songList.classList.add("hidden");
}

saveBtn.onclick = () => {
  const song = songs.find(s => s.id === currentSongId);
  if (!song) return;

  song.content = editorText.value;
  song.services = Array.from(
    serviceCheckboxes.querySelectorAll("input:checked")
  ).map(cb => cb.value);

  saveAll();
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
searchInput.oninput = e => renderSongs(e.target.value);

/* ---------- FILTRO SERVICIO ---------- */
serviceSelect.onchange = e => {
  currentService = e.target.value;
  renderServices();
  renderSongs();
};

/* ---------- MODO EN VIVO ---------- */
altarBtn.onclick = () => {
  altarMode = !altarMode;
  document.body.classList.toggle("altar", altarMode);
  altarBtn.textContent = altarMode
    ? "❌ Salir En Vivo"
    : "🎹 En Vivo";
};

/* ---------- INIT ---------- */
renderServices();
renderSongs();
