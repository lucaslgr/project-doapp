/**
 * !OBS: Um service worker sempre é reinstalado quando o código presente nele é alterado, porém no outros arquivos que foram armazenados no cache pela primeira vez através do SW não serão armazenados novamente pelo service worker. Para resolver essa questão, basta alterar o número das versões dos SW STATIC e DYNAMIC abaixo. 
 */
const BASE_URL = `http://localhost/project-barganhapp/frontend/public`;
const CACHE_STATIC_NAME = 'static-v1';
const CACHE_DYNAMIC_NAME = 'dynamic-v1';
const STATIC_FILES = [
  BASE_URL+'/',
  BASE_URL+'/index.html',
  BASE_URL+'/offline.html',
  BASE_URL+'/src/js/app.js',
  BASE_URL+'/src/js/feed.js',
  BASE_URL+'/src/js/promise.js',
  BASE_URL+'/src/js/fetch.js',
  BASE_URL+'/src/css/normalize.css',
  BASE_URL+'/src/css/style.css',
  BASE_URL+'/src/css/fontello.css',
  BASE_URL+'/src/font/fontello.eot',
  BASE_URL+'/src/font/fontello.svg',
  BASE_URL+'/src/font/fontello.ttf',
  BASE_URL+'/src/font/fontello.woff',
  BASE_URL+'/src/font/fontello.woff2',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap',
  BASE_URL+'/src/images/logos/logo.png'
];


/**
 * Verifica se a string procurada existe no array de strings
 * @param {string procurada} string 
 * @param {array de strings} array 
 */
function isInArray(string, array) {
  let cachePath;
  if (string.indexOf(BASE_URL) === 0) { // Requisições no próprio domínio, ou seja, quando não não requisições a um CDN ou outro domínio
    console.log('matched ', BASE_URL, string);
    // cachePath = string.substring(BASE_URL.length); // Tirando a parte do domínio na url e deixando apenas o que vem depois do domínio (e.g. after localhost:8080)
    cachePath = string; // Mantendo a url com o domínio
    console.log('isInArray IF: ,string, cachePath,  array.indexOf(cachePath) > -1',string, cachePath,  array.indexOf(cachePath) > -1);
  } else {
    cachePath = string; // store the full request (for CDNs)
    console.log('isInArray ELSE: ,string, cachePath,  array.indexOf(cachePath) > -1',string, cachePath,  array.indexOf(cachePath) > -1);
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
    //!Verificando se algum dos caches pertence a alguma versão que não está dentre as atuais definida pelo nome da key do cache em CACHE_STATIC_NAME e CACHE_DYNAMIC_NAME
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

  //! 1ª ESTRATÉGIA: [CACHE THEN NETWORK]
  //! 1.1ª - Verifica se a URL requisitada é uma das que as respostas trazem conteúdos que mutáveis constantemente
  //! 1.2ª - Faz a requisição na rede
  //! 1.3ª - Clona o resultado e coloca no cache dinâmico sobrescrevendo um cache antigo se houver
  //! 1.4ª - Retorna para a requisição o resultado original vindo da rede
  const url = 'http://localhost/project-barganhapp/backend-api/public/posts';
  //* Verificando se a URL requisitada é uma das que contém conteúdos que mudam constantemente
  if(event.request.url.indexOf(url) > -1){
    
    event.respondWith(
      caches.open(CACHE_DYNAMIC_NAME)
        .then( cache => {
          return fetch(event.request)
            .then( response => {
              //!OBS: Diferente do caches.add o put não faz a request e salva a resposta, ele já acessa o cache específico pela key informada no primeiro parâmetro e no segundo passa a informação que deve ser inserida no cache
              cache.put(event.request.url, response.clone())
              return response; //Retornando a reposta original
            })
        })
    );
  }
  //! 2ª ESTRATÉGIA: [TRY CACHE ONLY]
  //! 2.1ª - Verifica se a URL requisitada é uma das que pertence ao cache de arquivos ESTÁTICOS através do método isInArray(), realizado na instalação do SW
  //! 2.2ª - Se sim, retorna o seu respectivo cache diretamente
  //! 2.3ª - Se não, não faz nada e deixa passar para a condição ELSE
  else if(isInArray(event.request.url, STATIC_FILES)) {
    console.log('Veio do cache estático ELSE IF', event.request.url);
    event.respondWith(
      caches.match(event.request)
    );
  }
  //! 3ª ESTRATÉGIA: [TRY CACHE, TRY NETWORK, TRY FALLBACK]
  //! 3.1ª - Verifica se já tem um cache para essa requisição, se houver e se não tiver vazio, restorna a reposta vinda do cache
  //! 3.2ª - Se a resposta do cache para essa requisição estiver vazia, tenta fazer a requisição na rede
  //! 3.3ª - Se a requisição na rede for bem sucedida, salva um clone da resposta no cache dinâmico e retorna  resposta original
  //! 3.4ª - Se a requisição na rede não conseguiu conexão e falhou, cai no catch() e lá verificamos se era uma requisição a uma página HTML, se sim, retornamos a página de fallback que representa o 404 e está cacheada no cache estático
  else {
    event.respondWith(
      caches.match(event.request)
        .then( response => {
          //Checando se o cache para essa requisicao não está vazia
          if(response) {
            console.log('Veio do cache estático ou dinâmico ELSE', event.request.url);
            return response;
          } else {
            //Tentando fazer a requisição na rede
            return fetch(event.request)
              .then( res => {
                return caches.open(CACHE_DYNAMIC_NAME)
                  .then( cache => {
                    cache.put(event.request.url, res.clone());
                    return res;
                  });
              })
              //Se não conseguiu fazer a requisição na rede por falta de conexão cai aqui e retorna a página de [fallback 404] caso seja uma requisição a uma página .html
              .catch( error => {
                return caches.open(CACHE_STATIC_NAME)
                  .then( cache => {
                    //Verificando se a requisição é a uma página .html
                    if(event.request.url.indexOf('.html') > -1)
                      return cache.match('./offline.html');
                  });
              })
          }
        })
    );
  }

})