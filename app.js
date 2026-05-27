// ===== ELEMENTOS =====
const songList = document.getElementById("songList");
const serviceSongList = document.getElementById("serviceSongList");
const serviceLiveTitle = document.getElementById("serviceLiveTitle");

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
const deleteSongBtn = document.getElementById("deleteSongBtn");

const serviceLive = document.getElementById("serviceLive");
const exitServiceBtn = document.getElementById("exitServiceBtn");

const liveView = document.getElementById("liveView");
const liveContent = document.getElementById("liveContent");

// ===== DATOS =====
let songs = JSON.parse(localStorage.getItem("songs")) || [];
let services = JSON.parse(localStorage.getItem("services")) || [];

let currentSongId = null;
let currentServiceId = "";

// ===== GUARDAR =====
function saveData() {
  localStorage.setItem("songs", JSON.stringify(songs));
  localStorage.setItem("services", JSON.stringify(services));
}

// ===== SERVICIOS =====
function renderServices() {
  serviceSelect.innerHTML = `<option value="">— Ver todas —</option>`;
  songService.innerHTML = `<option value="">— Sin asignar —</option>`;

  services.forEach(service => {
    const option1 = document.createElement("option");
    option1.value = service.id;
    option1.textContent = service.date;
    serviceSelect.appendChild(option1);

    const option2 = option1.cloneNode(true);
    songService.appendChild(option2);
  });
}

// ===== LISTA PRINCIPAL =====
function renderSongs() {
  songList.innerHTML = "";

  let list = songs;

  // ===== FILTRAR POR SERVICIO =====
  if (currentServiceId) {
    const srv = services.find(s => s.id === currentServiceId);

    if (srv) {
      list = srv.order
        .map(id => songs.find(song => song.id === id))
        .filter(Boolean);
    }
  }

  // ===== ORDENAR A-Z =====
  list = [...list].sort((a, b) =>
    a.title.localeCompare(b.title, "es", {
      sensitivity: "base"
    })
  );

  // ===== MOSTRAR =====
  list.forEach(song => {
    const div = document.createElement("div");
    div.className = "song";
    div.textContent = song.title;

    div.onclick = () => {
      openEditor(song.id);
    };

    songList.appendChild(div);
  });
}

// ===== ABRIR EDITOR =====
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

// ===== CERRAR EDITOR =====
function closeEditor() {
  editor.classList.add("hidden");
  songList.classList.remove("hidden");

  renderSongs();
}

// ===== GUARDAR CANCIÓN =====
saveBtn.onclick = () => {
  const song = songs.find(s => s.id === currentSongId);

  if (!song) return;

  const previousService = song.serviceId;

  song.content = editorText.value;
  song.type = songType.value;
  song.serviceId = songService.value;

  // ===== QUITAR DEL SERVICIO ANTERIOR =====
  if (previousService) {
    const oldService = services.find(s => s.id === previousService);

    if (oldService) {
      oldService.order = oldService.order.filter(
        id => id !== song.id
      );
    }
  }

  // ===== AGREGAR AL NUEVO SERVICIO =====
  if (song.serviceId) {
    const service = services.find(
      s => s.id === song.serviceId
    );

    if (service && !service.order.includes(song.id)) {
      service.order.push(song.id);
    }
  }

  saveData();
  closeEditor();
};

// ===== VOLVER =====
backBtn.onclick = closeEditor;

// ===== ELIMINAR CANCIÓN =====
deleteSongBtn.onclick = () => {
  if (!currentSongId) return;

  const confirmDelete = confirm(
    "¿Eliminar esta canción?"
  );

  if (!confirmDelete) return;

  // ===== QUITAR DE SERVICIOS =====
  services.forEach(service => {
    service.order = service.order.filter(
      id => id !== currentSongId
    );
  });

  // ===== ELIMINAR =====
  songs = songs.filter(
    song => song.id !== currentSongId
  );

  currentSongId = null;

  saveData();
  closeEditor();
};

// ===== NUEVA CANCIÓN =====
newSongBtn.onclick = () => {
  const title = prompt(
    "Nombre de la canción"
  );

  if (!title) return;

  songs.push({
    id: Date.now().toString(),
    title: title.trim(),
    content: "",
    type: "",
    serviceId: ""
  });

  saveData();
  renderSongs();
};

// ===== NUEVO SERVICIO =====
newServiceBtn.onclick = () => {
  const date = prompt(
    "Fecha del servicio"
  );

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
  if (!currentServiceId) return;

  const confirmDelete = confirm(
    "¿Eliminar este servicio?"
  );

  if (!confirmDelete) return;

  songs.forEach(song => {
    if (song.serviceId === currentServiceId) {
      song.serviceId = "";
    }
  });

  services = services.filter(
    service => service.id !== currentServiceId
  );

  currentServiceId = "";

  saveData();
  renderServices();
  renderSongs();
};

// ===== CAMBIAR SERVICIO =====
serviceSelect.onchange = event => {
  currentServiceId = event.target.value;

  renderSongs();
};

// ===== SERVICIO EN VIVO =====
serviceLiveBtn.onclick = () => {
  if (!currentServiceId) {
    alert("Selecciona un servicio");
    return;
  }

  const service = services.find(
    s => s.id === currentServiceId
  );

  if (!service) return;

  serviceLiveTitle.textContent =
    `🎹 Servicio en Vivo – ${service.date}`;

  serviceLive.classList.remove("hidden");
  songList.classList.add("hidden");

  renderServiceSongs();
};

// ===== RENDER SERVICIO =====
function renderServiceSongs() {
  serviceSongList.innerHTML = "";

  const service = services.find(
    s => s.id === currentServiceId
  );

  if (!service) return;

  const orderedSongs = service.order
    .map(id =>
      songs.find(song => song.id === id)
    )
    .filter(Boolean);

  const alabanza = orderedSongs.filter(
    song => song.type === "alabanza"
  );

  const adoracion = orderedSongs.filter(
    song => song.type === "adoracion"
  );

  renderServiceBlock(
    "🎶 Alabanza",
    alabanza,
    service
  );

  renderServiceBlock(
    "🙏 Adoración",
    adoracion,
    service
  );
}

// ===== BLOQUES =====
function renderServiceBlock(
  titleText,
  list,
  service
) {
  if (!list.length) return;

  const title = document.createElement("h3");
  title.textContent = titleText;

  serviceSongList.appendChild(title);

  list.forEach(song => {
    const index = service.order.indexOf(song.id);

    const row = document.createElement("div");

    row.className = "song";

    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "8px";

    const label = document.createElement("span");

    label.textContent = song.title;
    label.style.flex = "1";

    // ===== SUBIR =====
    const up = document.createElement("button");

    up.textContent = "⬆️";

    up.onclick = event => {
      event.stopPropagation();

      if (index === 0) return;

      [
        service.order[index - 1],
        service.order[index]
      ] = [
        service.order[index],
        service.order[index - 1]
      ];

      saveData();
      renderServiceSongs();
    };

    // ===== BAJAR =====
    const down = document.createElement("button");

    down.textContent = "⬇️";

    down.onclick = event => {
      event.stopPropagation();

      if (
        index === service.order.length - 1
      ) return;

      [
        service.order[index + 1],
        service.order[index]
      ] = [
        service.order[index],
        service.order[index + 1]
      ];

      saveData();
      renderServiceSongs();
    };

    // ===== ABRIR EN VIVO =====
    row.onclick = () => {
      liveContent.textContent =
        song.content || "";

      liveView.classList.remove("hidden");
    };

    row.appendChild(label);
    row.appendChild(up);
    row.appendChild(down);

    serviceSongList.appendChild(row);
  });
}

// ===== CERRAR EN VIVO =====
liveView.onclick = () => {
  liveView.classList.add("hidden");
};

// ===== SALIR =====
exitServiceBtn.onclick = () => {
  serviceLive.classList.add("hidden");

  songList.classList.remove("hidden");
};

// ===== INICIO =====
renderServices();
renderSongs();

