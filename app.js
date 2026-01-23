const songList = document.getElementById("songList");
const newSongBtn = document.getElementById("newSongBtn");
const newServiceBtn = document.getElementById("newServiceBtn");
const serviceSelect = document.getElementById("serviceSelect");
const deleteServiceBtn = document.getElementById("deleteServiceBtn");
const altarBtn = document.getElementById("altarBtn");

const editor = document.getElementById("editor");
const editorTitle = document.getElementById("editorTitle");
const editorText = document.getElementById("editorText");
const saveBtn = document.getElementById("saveBtn");
const backBtn = document.getElementById("backBtn");

let songs = JSON.parse(localStorage.getItem("songs")) || [];
let services = JSON.parse(localStorage.getItem("services")) || [];

let currentSongId = null;
let currentService = "";
let altarMode = false;

/* ================= GUARDAR ================= */
function saveAll() {
  localStorage.setItem("songs", JSON.stringify(songs));
  localStorage.setItem("services", JSON.stringify(services));
}

/* ================= SERVICIOS ================= */
function renderServices() {
  serviceSelect.innerHTML =
    `<option value="">— Selecciona servicio —</option>`;

  services.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.date;
    serviceSelect.appendChild(opt);
  });

  deleteServiceBtn.classList.toggle("hidden", !currentService);
}

/* ================= RENDER CANCIONES ================= */
function renderSongs() {
  songList.innerHTML = "";
  if (!currentService) return;

  const service = services.find(s => s.id === currentService);
  if (!service.order) service.order = [];

  const alabanza = [];
  const adoracion = [];

  service.order.forEach(id => {
    const song = songs.find(s => s.id === id);
    if (!song) return;
    if (song.type === "alabanza") alabanza.push(song);
    if (song.type === "adoracion") adoracion.push(song);
  });

  renderBlock("🎶 Alabanza", alabanza);
  renderBlock("🙏 Adoración", adoracion);
}

/* ================= BLOQUES ================= */
function renderBlock(title, list) {
  if (list.length === 0) return;

  const h = document.createElement("div");
  h.className = "block-title";
  h.textContent = title;
  songList.appendChild(h);

  list.forEach(song => {
    const div = document.createElement("div");
    div.className = "song";
    div.draggable = true;
    div.dataset.id = song.id;
    div.textContent = song.title;

    div.onclick = () => openEditor(song.id);

    div.addEventListener("dragstart", () => {
      div.classList.add("dragging");
    });

    div.addEventListener("dragend", () => {
      div.classList.remove("dragging");
      saveAll();
    });

    songList.appendChild(div);
  });
}

/* ================= DRAG & DROP ================= */
songList.addEventListener("dragover", e => {
  e.preventDefault();

  const dragging = document.querySelector(".dragging");
  if (!dragging) return;

  const after = [...songList.querySelectorAll(".song:not(.dragging)")]
    .find(el => e.clientY < el.offsetTop + el.offsetHeight / 2);

  if (after) {
    songList.insertBefore(dragging, after);
  } else {
    songList.appendChild(dragging);
  }

  updateOrder();
});

function updateOrder() {
  const ids = [...songList.querySelectorAll(".song")]
    .map(el => el.dataset.id);

  const service = services.find(s => s.id === currentService);
  service.order = ids;
}

/* ================= NUEVA CANCIÓN ================= */
newSongBtn.onclick = () => {
  const title = prompt("Nombre de la canción:");
  if (!title) return;

  const typeOption = prompt(
    "Tipo de canción:\n1 = Alabanza\n2 = Adoración"
  );

  let type = "";
  if (typeOption === "1") type = "alabanza";
  if (typeOption === "2") type = "adoracion";

  if (!type) {
    alert("Opción inválida. Canción no creada.");
    return;
  }

  const song = {
    id: Date.now().toString(),
    title,
    type,
    content: ""
  };

  songs.push(song);

  if (currentService) {
    const service = services.find(s => s.id === currentService);
    service.order.push(song.id);
  }

  saveAll();
  renderSongs();
};

/* ================= NUEVO SERVICIO ================= */
newServiceBtn.onclick = () => {
  const date = prompt("Fecha del servicio (ej: 2026-02-10):");
  if (!date) return;

  services.push({
    id: Date.now().toString(),
    date,
    order: []
  });

  saveAll();
  renderServices();
};

/* ================= BORRAR SERVICIO ================= */
deleteServiceBtn.onclick = () => {
  if (!currentService) return;
  if (!confirm("¿Borrar este servicio?")) return;

  services = services.filter(s => s.id !== currentService);
  currentService = "";

  saveAll();
  renderServices();
  songList.innerHTML = "";
};

/* ================= EDITOR ================= */
function openEditor(id) {
  const song = songs.find(s => s.id === id);
  currentSongId = id;
  editorTitle.textContent = song.title;
  editorText.value = song.content;
  editor.classList.remove("hidden");
  songList.classList.add("hidden");
}

saveBtn.onclick = () => {
  const song = songs.find(s => s.id === currentSongId);
  song.content = editorText.value;
  saveAll();
  closeEditor();
};

backBtn.onclick = closeEditor;

function closeEditor() {
  editor.classList.add("hidden");
  songList.classList.remove("hidden");
}

/* ================= SELECT SERVICIO ================= */
serviceSelect.onchange = e => {
  currentService = e.target.value;
  renderServices();
  renderSongs();
};

/* ================= MODO ALTAR ================= */
altarBtn.onclick = () => {
  altarMode = !altarMode;
  document.body.classList.toggle("altar", altarMode);
  altarBtn.textContent = altarMode
    ? "❌ Salir En Vivo"
    : "🎹 En Vivo";
};

/* ================= INIT ================= */
renderServices();
