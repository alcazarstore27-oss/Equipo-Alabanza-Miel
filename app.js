const notesList = document.getElementById("notesList");
const newNoteBtn = document.getElementById("newNoteBtn");
const newServiceBtn = document.getElementById("newServiceBtn");
const serviceSelect = document.getElementById("serviceSelect");
const altarModeBtn = document.getElementById("altarModeBtn");

let notes = JSON.parse(localStorage.getItem("alabanzaNotes")) || [];
let services = JSON.parse(localStorage.getItem("alabanzaServices")) || [];
let selectedService = "";
let altarMode = false;

/* ---------- GUARDAR ---------- */
function saveAll() {
  localStorage.setItem("alabanzaNotes", JSON.stringify(notes));
  localStorage.setItem("alabanzaServices", JSON.stringify(services));
}

/* ---------- RENDER SERVICIOS ---------- */
function renderServices() {
  serviceSelect.innerHTML = `<option value="">— Ver todas las canciones —</option>`;
  services.forEach(service => {
    const option = document.createElement("option");
    option.value = service.id;
    option.textContent = service.name;
    serviceSelect.appendChild(option);
  });
}

/* ---------- RENDER CANCIONES ---------- */
function renderNotes() {
  notesList.innerHTML = "";

  let visibleNotes = notes;

  if (selectedService) {
    const service = services.find(s => s.id === selectedService);
    if (service) {
      visibleNotes = notes.filter(n => service.songs.includes(n.id));
    }
  }

  visibleNotes.forEach(note => {
    const div = document.createElement("div");
    div.className = "note";
    div.innerHTML = `
      <h3>${note.title}</h3>
      <pre>${note.content}</pre>
    `;
    notesList.appendChild(div);
  });
}

/* ---------- NUEVA CANCIÓN ---------- */
newNoteBtn.addEventListener("click", () => {
  const title = prompt("🎵 Título de la canción:");
  const content = prompt("🎼 Estructura, acordes y notas:");

  if (title && content) {
    notes.push({
      id: Date.now().toString(),
      title,
      content
    });
    saveAll();
    renderNotes();
  }
});

/* ---------- NUEVO SERVICIO ---------- */
newServiceBtn.addEventListener("click", () => {
  const name = prompt("📅 Nombre del servicio:");

  if (name) {
    services.push({
      id: Date.now().toString(),
      name,
      songs: []
    });
    saveAll();
    renderServices();
  }
});

/* ---------- SELECCIONAR SERVICIO ---------- */
serviceSelect.addEventListener("change", e => {
  selectedService = e.target.value;
  renderNotes();
});

/* ---------- MODO ALTAR ---------- */
altarModeBtn.addEventListener("click", () => {
  altarMode = !altarMode;
  document.body.classList.toggle("altar-mode", altarMode);
  altarModeBtn.textContent = altarMode
    ? "❌ Salir Modo Altar"
    : "🎹 Activar Modo Altar";
});

/* ---------- INIT ---------- */
renderServices();
renderNotes();
