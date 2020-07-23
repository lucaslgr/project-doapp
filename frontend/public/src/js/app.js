const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

function showMenuMobile() {
  $('ul.menu-mobile').classList.toggle('show-menu-mobile');
}

/**
 * Função que registra o SW no navegador
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      //Registrando o SW no navegador
      .register('./sw.js')
      .then(() => {
        //Exibe a mensagem depois que o sw.js atende o evento de Instalação e retorna a promise do resister() na linha anterior
        console.log('Service Worker registered!');
      })
      .catch((err) => {
        console.log('Service Worker not registered!', err);
      })
  }
}


//! Iniciando o [SW]
if (!window.Promise)
    window.Promise = Promise;

registerServiceWorker();