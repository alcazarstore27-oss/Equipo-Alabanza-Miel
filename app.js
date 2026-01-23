const notesList = document.getElementById("notesList");
const newNoteBtn = document.getElementById("newNoteBtn");

let notes = JSON.parse(localStorage.getItem("alabanzaNotes")) || [];

function saveNotes() {
  localStorage.setItem("alabanzaNotes", JSON.stringify(notes));
}

function renderNotes() {
  notesList.innerHTML = "";
  notes.forEach((note) => {
    const div = document.createElement("div");
    div.className = "note";
    div.innerHTML = `
      <h3>${note.title}</h3>
      <pre>${note.content}</pre>
    `;
    notesList.appendChild(div);
  });
}

newNoteBtn.addEventListener("click", () => {
  const title = prompt("🎵 Título de la canción:");
  const content = prompt("🎼 Estructura, acordes y notas:");

  if (title && content) {
    notes.push({ title, content });
    saveNotes();
    renderNotes();
  }
});

renderNotes();
