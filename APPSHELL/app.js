const API_URL = 'https://apicc-l6lj.onrender.com/api/users';
const lista = document.querySelector('#lista');

window.addEventListener('DOMContentLoaded', () => {
  registerSw();
  setupOnlineOfflineBanner();
  loadUsers();
});

/* ===== Registrar Service Worker ===== */
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

/* ===== Cargar datos con fallback offline ===== */
async function loadUsers() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Respuesta no OK');

    const json = await res.json();
    const data = json.data || []; // los usuarios están dentro de "data"
    console.log('📡 Datos obtenidos de la API (online):', data);

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

/* ===== Renderizar usuarios ===== */
function renderUsers(users) {
  let html = '';
  users.forEach(user => {
    html += `
      <div class="card">
        <h2>${escapeHtml(user.name)} ${escapeHtml(user.lastName)}</h2>
        <p><strong>Email:</strong> ${escapeHtml(user.email)}</p>
        <p><strong>Correo confirmado:</strong> ${user.isEmailConfirmed ? 'Sí' : 'No'}</p>
        <p><strong>Administrador:</strong> ${user.isAdmin ? 'Sí' : 'No'}</p>
      </div>
    `;
  });
  lista.innerHTML = html;
}

/* ===== Prevención de inyección ===== */
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
      loadUsers(); // vuelve a cargar los datos al reconectarse
    } else {
      statusMessage.classList.add('offline');
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  updateOnlineStatus(); // estado inicial
}
