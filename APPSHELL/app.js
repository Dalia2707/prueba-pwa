/* api https://jsonplaceholder.typicode.com/users */

window.addEventListener('load',()=>{
    registersw();
});

const lista = document.querySelector('#lista');

fetch('https://jsonplaceholder.typicode.com/users')
.then(response => response.json())
.then(data => {
    console.log(data);
    let html = '';
    data.forEach(user => {
        html+=`<div class="card">
        <h2>${user.name}</h2>
        <div>${user.email}</div>
        </div>
        `
        
    });
    lista.innerHTML=html;
});

async function registersw(){
    if('serviceWorker' in navigator){
        try{
            await navigator.serviceWorker.register('./sw.js');
            console.log('Service worker registrado');
        }
        catch(e){
            console.log('Fallo el registro del Service Worker');
        }
    }
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(() => console.log('Service Worker registrado'))
    .catch(err => console.log('Error al registrar SW:', err));
}

window.addEventListener('load', () => {
  const statusMessage = document.getElementById('status-message');

  function updateOnlineStatus() {
    if (navigator.onLine) {
      statusMessage.classList.remove('offline');
    } else {
      statusMessage.classList.add('offline');
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  updateOnlineStatus();
});
