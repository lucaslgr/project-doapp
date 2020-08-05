/**
 * !OBS: Um service worker sempre é reinstalado quando o código presente nele é alterado, porém no outros arquivos que foram armazenados no cache pela primeira vez através do SW não serão armazenados novamente pelo service worker. Para resolver essa questão, basta alterar o número das versões dos SW STATIC e DYNAMIC abaixo. 
 */
//* Importando o arquivo de configuração de constantes como BASE_URL e API_BASE_URL
importScripts('./config.js');
//* Importando a lib idb.js no [SW] para podermos usar o IndexedDB com Promises também no ServiceWorker
importScripts('./src/js/idb.js');
//* Importando o ajudador que foi criado para inicializar o IndexedDB e também escrever e ler informações nos ObjectStores(tabelas) contidos no DB
importScripts('./src/js/indexedDB.js');

// const BASE_URL = `http://localhost/project-barganhapp/frontend/public`;//TODO
const CACHE_STATIC_NAME = 'static-v1';
const CACHE_DYNAMIC_NAME = 'dynamic-v1';
const STATIC_FILES = [
  BASE_URL+'/',
  BASE_URL+'/index.html',
  BASE_URL+'/offline.html',
  BASE_URL+'/config.js',
  BASE_URL+'/src/js/app.js',
  BASE_URL+'/src/js/feed.js',
  BASE_URL+'/src/js/promise.js',
  BASE_URL+'/src/js/fetch.js',
  BASE_URL+'/src/js/idb.js',
  BASE_URL+'/src/js/indexedDB.js',
  BASE_URL+'/src/js/helperFunctions.js',
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
 * Verifica se o número de caches passou de um limite estabelecido em maxItems, se tiver passado remove os mais antigos recursivamente
 * @param {string} cacheName 
 * @param {int} maxItems 
 */
function trimCache(cacheName, maxItems){
  caches.open(cacheName)
    .then( (cache) => {
      return cache.keys()
      .then( (keys) =>{
        if(keys.length > maxItems){
          cache.delete(keys[0])
            .then(trimCache(cacheName, maxItems));
        }
      })
    })
}

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
});

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
});

/**
 * Evento fetch do Service Worker, é disparado interceptando sempre que o navegador atender algum fetch logo manipulamos a
 * requisicao executada e verificamos se a mesma já foi cacheada por exemplo, caso tenha sido, entregamos a versao do cache
 * para a requisicao, caso não tenha sido cacheada ainda, executamos a requisicao, cacheamos no DYNAMIC cache e posteriormente
 * entregamos o resultado da requisicao para o disparador original da requisicao 
 */
self.addEventListener('fetch', (event) => {
  console.log('[Service Worker] Fetching something', event.request.url);

  //! 1ª ESTRATÉGIA: [INDEXED-DB THEN NETWORK]
  //! 1.1ª - Verifica se a URL requisitada é uma das que as respostas trazem conteúdos que mutáveis constantemente
  //! 1.2ª - Faz a requisição na rede
  //! 1.3ª - Clona o resultado e coloca no IndexedDB no respectivo ObjectStore(Tabela) sobrescrevendo os dados antigos se houver
  //! 1.4ª - Retorna para a requisição o resultado original vindo da rede
  // const url = 'http://localhost/project-barganhapp/backend-api/public/posts';
  const url = API_BASE_URL+'/posts';
  
  //* Verificando se a URL requisitada é uma das que contém conteúdos que mudam constantemente
  if(event.request.url.indexOf(url) > -1){
    
    event.respondWith(
      fetch(event.request)
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
    );
  }
  //! 2ª ESTRATÉGIA: [TRY CACHE ONLY]
  //! 2.1ª - Verifica se a URL requisitada é uma das que pertence ao cache de arquivos ESTÁTICOS através do método isInArray(), realizado na instalação do SW
  //! 2.2ª - Se sim, retorna o seu respectivo cache diretamente
  //! 2.3ª - Se não, não faz nada e deixa passar para a condição ELSE
  else if(isInArray(event.request.url, STATIC_FILES)) {
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
                    if(event.request.headers.get('accept').includes('text/html'))
                      return cache.match('./offline.html');
                  });
              })
          }
        })
    );
  }

});

/**
 * Evento sync do SW é ativado sempre que temos uma conexão reestabelecida ou sempre que já temos uma conexão e é registrado uma
 * nova tarefa 
 */
self.addEventListener('sync', (event) => {
  // const endpoint = 'http://localhost/project-barganhapp/backend-api/public/posts/new';
  const endpoint = API_BASE_URL+'/posts/new';

  console.log('[Service Worker] Background Syncing', event);

  //Verificando se a task registrada é uma 'sync-new-post'
  if( event.tag === 'sync-new-post'){
    console.log('[Service Worker] Syncing new Posts');

    event.waitUntil(
      //Lendo todas informações gravadas no ObjectStore(Tabela) sync-posts no IndexedDB
      readAllData('sync-posts')
        .then( postsToSync  => {
          //Percorrendo todos os posts retornados do ObjectStore a serem sincronizados com a API
          for (let post of postsToSync) {
            //Pegando os dados dos Posts pegos do Indexed para serem sincronizados e transformando no formato FormData para podermos enviar a imagem
            let postFormData = new FormData();
            postFormData.append('id', post.id);
            postFormData.append('title', post.title);
            postFormData.append('location', post.location);
            postFormData.append('price', post.price);
            postFormData.append('whatsapp_contact', post.whatsapp_contact);
            //Enviando a imagem e renomeando-a pois no servidor não podemos ter imagens com nmomes iguais
            postFormData.append('image', post.image, `${post.id}.png`); 

            //Faz a requisição ao endpoint para sincronizar os posts do ObjectStore sync-posts com a API
            fetch(endpoint, {
              "method": "POST",
              "body": postFormData
            })
            .then((response) => {
              return response.json();
            })
            .then( async (responseJSON) => {
              if (responseJSON.errors) {
                throw responseJSON.errors;
              }

              //Deletando o post/anuncio do ObjectStore sync-posts no IndexedDB que acabou de ser sincronizado pela requisição
              deleteItemFromData('sync-posts', responseJSON.data.id_indexedDB);

              console.log('Inserido um novo post, seu id eh: ' + responseJSON.data.id_post);
              
              //? Enviando uma mensagem para a main thread do navegador no lado do client para atualizar os posts/anuncios usando a funcao fillPosts()
              // Pegando todos os clients controlados pelo SW, EX: index.html, help.html, offline.html
              const allClients = await clients.matchAll({ includeUncontrolled: true});
              
              // Sai se não conseguirmos pegar o client da main thread... Eg, if it closed.
              if (!(allClients.length > 0) || !(allClients[0])) return;

              // Envia uma mensagem para o client da main thread informando no JSON, action(funcao) que deverá ser executada na thread principal 
              allClients[0].postMessage({
                action: 'fillPosts'
              });
            })
            .catch((errors) => {
              console.log('ERRO', errors);
            })
          }
        })
    );
  }
});

/**
 * Evento notificationclick fica escutando se alguma action(botão) de alguma notification foi acionado no dispositivo do usuário
 */
self.addEventListener('notificationclick', (event) => {
  let notification = event.notification; //Pegando a notificação que contém a action disparada 
  let action = event.action; //Pegando propriedade action que representa o ID que identifica qual action(botão) foi clicada

  console.log(notification);

  if(action === 'confirm'){ //Se o click foi na button(acion)==confirm
    console.log('Confirm was chosen');
    notification.close();
  } else { //Se o click foi em qualquer lugar da Notification menos na button(action)==confirm
    console.log(action);

    //Abrindo a aplicação ou redirecionando para uma página específica caso a aplicação já esteja aberta
    event.waitUntil(
      //Pegando todos as janelas(os clients) abertas que estão sobre controle deste [SW]
      clients.matchAll()
        .then( allClients => {
          //Buscando por uma janela(client) sob controle do SW que esteja aberta
          let clientOpened = allClients.find( c => {
            return c.visibilityState === 'visible';
          });

          if(clientOpened !== undefined){ //Verificando se encontrou algum client aberto
            clientOpened.navigate(`${BASE_URL}${notification.data.url}`); //Redirecionando o client aberto para uma url da aplicação que foi setada pela API
            clientOpened.focus();
          } else { //Se não encontrou nenhum client aberto
            clients.openWindow(`${BASE_URL}${notification.data.url}`); //Abrindo um client para uma url da aplicação que foi setada pela API
          }

          notification.close();
        })
    );
  }
});

/**
 * Evento notificationclose fica escutando se a notificação foi fechada de qualquer forma no dispositivo, 
 * Ex: Limpada da tela, Ignorada arrastando para o lado, etc
 */
self.addEventListener('notificationclose', (event) => {
  console.log('Notification was closed', event);
});

/**
 * Evento push fica escutando se o servidor de WPN(Web Push Notifications) do browser enviou alguma WPN para a subscription vinculada a este SW na aplicação do usuário
 */
self.addEventListener('push', (event) => {
  console.log('Push Notification received', event);

  //Setando uma configuração padrão para notificações caso não seja recebido o CONTEÚDO da WPN
  let data = {title: 'New!', content: 'Something new Happened', openUrl: '/help.html'};

  //Checando se foi recebido o conteúdo da WPN
  if(event.data){
    //Transformando a string no formato JSON para um objeto
    data = JSON.parse(event.data.text());
  }

  //Setando um JSON com as Options da WPN a ser lançada
  let options = {
    body: data.content,
    icon: `${BASE_URL}/src/images/icons/app-icon-96x96.png`,
    image: `${BASE_URL}/src/images/products/product-default.png`, //Imagem a ser enviada no conteúdo
    badge: `${BASE_URL}/src/images/icons/app-icon-96x96.png`,//Badge é o ícone que aparece na barra do topo em dispositvos android quando você recebe uma notificação
    //A propriedade Data é uma meta data, ou seja, dentro dela podemos passar o que quisermos para a Notification
    data: {
      url: data.openUrl //Passando a url que deve ser chamada quando o usuario clicar na notificacao
    }
  };

  event.waitUntil(
    //Acessando o registro desse SW no navegador para lançar as WPN
    self.registration.showNotification(
      data.title,
      options)
  );
}); 

/**
 * Event periodicsync fica escutando se foi regitrado uma tarefa pela API Periodic Sync
 */
self.addEventListener('periodicsync', (event) => {
  console.log('[Service Worker] Periodic Background Syncing', event);

  if(event.tag === 'periodic-sync-posts'){
    console.log('[Service Worker] Periodic Syncing new Posts');

    const onPeriodicSync = async () => {
        //? Enviando uma mensagem para a main thread do navegador no lado do client para atualizar os posts/anuncios usando afuncao fillPosts()

        // Pegando todos os clients controlados pelo SW, EX: index.html, help.html, offline.html
        clients.matchAll({ includeUncontrolled: true }).then((clients) => {
          clients.forEach((client) => {

            // Envia uma mensagem para cada client da main thread informando no JSON, action(funcao) que deverá ser executada nathread principal 
            client.postMessage({
              action: 'fillPosts'
              });
          });
        }, (error) => {
          console.log(error);
        });
    };

    event.waitUntil(onPeriodicSync());
  }
});