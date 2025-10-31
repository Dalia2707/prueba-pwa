
const API_URL = 'https://jsonplaceholder.typicode.com/users';
const lista = document.querySelector('#lista');

window.addEventListener('DOMContentLoaded', () => {
  // Registrar SW (solo una vez)
  registerSw();

  // Mostrar estado de conexión
  setupOnlineOfflineBanner();

  // Intentar cargar datos (fetch con fallback a localStorage)
  loadUsers();
});

async function registerSw() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./sw.js');
      console.log('Service Worker registrado');
    } catch (err) {
      console.error('Fallo el registro del Service Worker', err);
    }
  }
}

/* ===== Fetch con fallback ===== */
async function loadUsers() {
  try {
    // intentar traer de red
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Respuesta no OK');
    const data = await res.json();
    console.log('Datos obtenidos de la API (online)', data);

    // render y guardar copia local
    renderUsers(data);
    localStorage.setItem('users', JSON.stringify(data));
  } catch (err) {
    console.warn('No se pudo obtener datos de la API, cargando desde localStorage', err);
    const cached = JSON.parse(localStorage.getItem('users') || 'null');
    if (cached && Array.isArray(cached)) {
      renderUsers(cached);
      console.log('Datos cargados desde localStorage');
    } else {
      lista.innerHTML = `<div class="card"><p>No hay datos disponibles sin conexión.</p></div>`;
    }
  }
}

function renderUsers(users) {
  let html = '';
  users.forEach(user => {
    html += `
      <div class="card">
        <h2>${escapeHtml(user.name)}</h2>
        <div>${escapeHtml(user.email)}</div>
      </div>
    `;
  });
  lista.innerHTML = html;
}

/* pequeña función para evitar inyección si los datos vienen mal */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .toString()
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/* ===== Banner online/offline ===== */
function setupOnlineOfflineBanner() {
  const statusMessage = document.getElementById('status-message');

  function updateOnlineStatus() {
    if (navigator.onLine) {
      statusMessage.classList.remove('offline');
      // Si volvemos a estar online, reintentar cargar datos (para actualizar)
      loadUsers();
    } else {
      statusMessage.classList.add('offline');
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  // estado inicial
  updateOnlineStatus();
}

window.addEventListener('load', () => {
  registersw();
  handleConnectionStatus();
  loadUsers();
});

function handleConnectionStatus() {
  const statusMessage = document.getElementById('status-message');

  function updateStatus() {
    if (navigator.onLine) {
      statusMessage.style.display = 'none';
    } else {
      statusMessage.style.display = 'block';
    }
  }

  // 🔹 Eventos estándar
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);

  // 🔹 Verificación periódica (por si el navegador no lo detecta)
  setInterval(() => {
    updateStatus();
  }, 4000);

  // Estado inicial
  updateStatus();
}
