const notesList = document.getElementById("notesList");
const newNoteBtn = document.getElementById("newNoteBtn");
const newServiceBtn = document.getElementById("newServiceBtn");
const serviceSelect = document.getElementById("serviceSelect");
const altarModeBtn = document.getElementById("altarModeBtn");

const editor = document.getElementById("editor");
const editorTitle = document.getElementById("editorTitle");
const editorContent = document.getElementById("editorContent");
const saveNoteBtn = document.getElementById("saveNoteBtn");
const closeEditorBtn = document.getElementById("closeEditorBtn");

let notes = JSON.parse(localStorage.getItem("alabanzaNotes")) || [];
let services = JSON.parse(localStorage.getItem("alabanzaServices")) || [];
let selectedService = "";
let altarMode = false;
let editingNoteId = null;

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
      <pre>${note.content || ""}</pre>
    `;

    div.addEventListener("click", () => openEditor(note.id));
    notesList.appendChild(div);
  });
}

/* ---------- NUEVA CANCIÓN ---------- */
newNoteBtn.addEventListener("click", () => {
  const title = prompt("🎵 Título de la canción:");

  if (title) {
    notes.push({
      id: Date.now().toString(),
      title,
      content: ""
    });
    saveAll();
    renderNotes();
  }
});

/* ---------- EDITOR ---------- */
function openEditor(noteId) {
  const note = notes.find(n => n.id === noteId);
  if (!note) return;

  editingNoteId = noteId;
  editorTitle.textContent = note.title;
  editorContent.value = note.content || "";

  editor.classList.remove("hidden");
  notesList.classList.add("hidden");
}

saveNoteBtn.addEventListener("click", () => {
  const note = notes.find(n => n.id === editingNoteId);
  if (!note) return;

  note.content = editorContent.value;
  saveAll();
  closeEditor();
  renderNotes();
});

closeEditorBtn.addEventListener("click", closeEditor);

function closeEditor() {
  editor.classList.add("hidden");
  notesList.classList.remove("hidden");
  editingNoteId = null;
}

/* ---------- SERVICIOS ---------- */
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
