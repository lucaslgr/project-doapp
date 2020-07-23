// const BASE_URL = `/project-barganhapp/frontend/public`;
const CACHE_STATIC_NAME = 'static-v3';
const CACHE_DYNAMIC_NAME = 'dynamic-v3';
const STATIC_FILES = [
  './',
  './index.html',
  './offline.html',
  './src/js/app.js',
  './src/js/feed.js',
  './src/js/promise.js',
  './src/js/fetch.js',
  './src/css/normalize.css',
  './src/css/style.css',
  './src/css/fontello.css',
  './src/font/fontello.eot',
  './src/font/fontello.svg',
  './src/font/fontello.ttf',
  './src/font/fontello.woff',
  './src/font/fontello.woff2',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap',
  './src/images/logos/logo.png'
];


/**
 * Verifica se a string procurada existe no array de strings
 * @param {string procurada} string 
 * @param {array de strings} array 
 */
function isInArray(string, array) {
  var cachePath;
  if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
    console.log('matched ', self.origin, string);
    cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
    console.log('cachePath', cachePath);
  } else {
    cachePath = string; // store the full request (for CDNs)
  }
  return array.indexOf(cachePath) > -1;
}

/**
 * Evento de instalação do Service Worker, é disparado assim que o app.js executa o registro do SW no navegador
 * 
 * * Na instalação acontece o cacheamento de todos arquivos ESTÁTICOS no CACHE_STATIC_NAME
 */
self.addEventListener('install', (event) => {

  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching App Shell');
        //Fazendo requisição e armazenando todas as url marcadas no STATIC_FILES no cache
        cache.addAll(STATIC_FILES);
      })
  )
})

/**
 * Evento de ativação do Service Worker, é disparado assim que o SW é instalado no navegador
 * 
 * * Na ativação acontece a limpeza de caches antigos, já que os novos já foram instalados pelo evento anterior a este
 * * EXEMPLO: Limpeza de chaches antigos pelo nome da versão
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker ....', event);

  event.waitUntil(
    //Verificando se algum dos caches pertence a alguma versão que não está dentre as atuais definida pelo nome da key do cache
    caches.keys()
      .then((keyList) => {
        return Promise.all(keyList.map((key) => {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('[Service Worker] Removing old cache.', key);
            return caches.delete(key);
          }
        }));
      })
  )

  //Aplica as atividades executadas pelo SW no primeiro carregamento da página
  return self.clients.claim();
})

/**
 * Evento fetch do Service Worker, é disparado interceptando sempre que o navegador atender algum fetch logo manipulamos a
 * requisicao executada e verificamos se a mesma já foi cacheada por exemplo, caso tenha sido, entregamos a versao do cache
 * para a requisicao, caso não tenha sido cacheada ainda, executamos a requisicao, cacheamos no DYNAMIC cache e posteriormente
 * entregamos o resultado da requisicao para o disparador original da requisicao 
 */
self.addEventListener('fetch', (event) => {
  console.log('[Service Worker] Fetching something', event.request.url);

  // const url = [
  //   'http://localhost/project-barganhapp/backend-api/public/posts'
  // ];

  /**
   * Para requisição que os dados sempre são atualizado, elas passam por esse filtro, logo, sempre é realizado 
   * uma nova requisição, salva no cache dinâmico, e retorna a resposta
  */
  // if(url.includes(event.request.url)){
  //   event.respondWith(
  //     caches.open(CACHE_DYNAMIC_NAME)
  //       .then( (cache) => {
  //         return fetch(event.request)
  //           .then( (response) => {
  //             //Inserindo no cache um clone da resposta
  //             cache.put(event.request.url, response.clone());
  //             return response;
  //           })
  //       })
  //   )
  // }

  /**
   * Requisições a arquivos do CACHE_STATIC_NAME, cacheados na hora da instalação do SW, são requisitados
   * diretamente no cache, pois praticamente nunca se alteram, logo não há necessidade de ficar consultando-os
   * na rede e atualizado seus caches.
   */
  // else if(isInArray(event.request.url, STATIC_FILES)){
  //   event.respondWith(
  //     caches.match(event.request)
  //   );
  // }

  // console.log(`Encontrou o ${event.request.url} no cache estático? ${isInArray(event.request.url, STATIC_FILES)}`);

  // ! AQUI
  event.respondWith(
    caches.match(event.request)
      .then( (response) => {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then( (res) => {
              return caches.open(CACHE_DYNAMIC_NAME)
                .then( (cache) => {
                  //Armazenando a resposta da requisição no cache
                  //!OBS: Diferente do caches.add o put não faz a request e salva a resposta, ele já acessa o cache específico pela key informada no primeiro parâmetro e no segundo passa a informação que deve ser inserida no cache
                  cache.put(event.request.url, res.clone());
                  return res;
                })
            })
        }
      })
  )



  // else {
  //   event.respondWith(
  //     caches.match(event.request)
  //       .then( (response) => {
  //         //Checando se o cache para essa requisicao não está vazia
  //         if(response) {
  //           return response;
  //         } else {
  //           return fetch(event.request)
  //             .then( (res) => {
  //               return caches.open(CACHE_DYNAMIC_NAME)
  //                 .then( (cache) => {
  //                   //Inserindo no cache um clone da resposta
  //                   cache.put(event.request.url, res.clone());
  //                   return res;
  //                 })
  //             })
  //             .catch( (error) => {
  //               return caches.open(CACHE_STATIC_NAME)
  //                 .then( (cache) => {
  //                   /**
  //                    * Retorna a página de fallback somente nos casos que algum arquivo não conseguir ser requisitado nem no 
  //                    * cache e nem na rede, pois assim evita que caso um arquivo .css não seja requisitado com sucesso no cache
  //                    * e nem na rede, a nossa estratégia retorna a página de fallback do nosso cache para a requisição do 
  //                    * arquivo 
  //                    */
  //                   if(event.request.headers.get('accept').includes('text/html')){
  //                     return cache.match('/offline.html');
  //                   }
  //                 })
  //             })
  //         }
  //       })
  //   )
  // }
})