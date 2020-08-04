// import {precacheAndRoute} from 'workbox-precaching'; //!!OBS: Só importa dessa forma quando estiver usando NodeJS
importScripts('sw-base.js');
//* Importando a lib idb.js no [SW] para podermos usar o IndexedDB com Promises também no ServiceWorker
importScripts('./src/js/idb.js');
//* Importando o ajudador que foi criado para inicializar o IndexedDB e também escrever e ler informações nos ObjectStores(tabelas) contidos no DB
importScripts('./src/js/indexedDB.js');


const { routing } = workbox;
const { strategies } = workbox;

//* Importando as Estratégias de Caching
const { StaleWhileRevalidate } = workbox.strategies;
//?======================================<PUT ALL CODE OF SW HERE>======================================?//

//*======================<Setando os files para Dynamic Caching>======================*//
routing.registerRoute(
  /.*(?:googleapis|gstatic)\.com.*$/,
  new StaleWhileRevalidate({
    cacheName: 'google-fonts',
    cacheExpiration: {
      maxEntries: 3,
      maxAgeSeconds: 60 * 60 * 24 * 30,
    }
  })
);

//*======================<Setando Dynamic Content para Cache no IndexedDB>======================*//
routing.registerRoute(
  ({ url }) => url.pathname.startsWith('/project-barganhapp/backend-api/public/posts'),
  (args) => {
    fetch(args.event.request)
      .then(response => {

        //Fazendo um clone da resposta da requisição
        let clonedResponse = response.clone();

        //Limpando todas informações no respectivo ObjectStore(Tabela) 'posts' dentro IndexedDB antes de inserir as novas informações vindas da requisição na rede
        clearAllData('posts')
          .then(() => {
            //Transformando o clone da resposta em um objeto JSON
            return clonedResponse.json();
          })
          .then(clonedResponseJSON => {
            let postsData = clonedResponseJSON.data;

            //Percorrendo cada JSON de CADA anúncio/post no retorno da requisição
            for (let key in postsData) {
              //Escrevendo as informações no ObjectStore posts do IndexedDB instanciado no arquivo indexedDB.js                
              writeData('posts', postsData[key]);
            }
          });
        return response; //Retornando a reposta original
      })
  }
);

//*=======================<Setando a Estratégia Cache then FallBack Page>=======================*//
routing.registerRoute(
  (routeData) => {
    return (routeData.event.request.headers.get('accept').includes('text/html'));
  },
  (args) => {
    return caches.match(args.event.request)
      .then(response => {
        //Checando se o cache para essa requisicao não está vazia
        if (response) {
          return response;
        } else {
          //Tentando fazer a requisição na rede
          return fetch(args.event.request)
            .then(res => {
              return caches.open('dynamic')
                .then(cache => {
                  cache.put(args.event.request.url, res.clone());
                  return res;
                });
            })
            //Se não conseguiu fazer a requisição na rede por falta de conexão cai aqui e retorna a página de [fallback 404] caso seja uma requisição a uma página .html
            .catch(error => {
              return caches.match('./offline.html')
                .then( res => {
                  return res;
                })
            })
        }
      })
  }
);

//?=====================================================================================================?//
// workbox.precaching.precacheAndRoute(self.__WB_MANIFEST); //!OBS: Só importa dessa forma quando estiver usando NodeJS