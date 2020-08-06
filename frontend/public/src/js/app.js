// const BASE_URL = `http://localhost/project-doapp/frontend/public`;
// const API_BASE_URL = `http://127.0.0.1/project-doapp/backend-api/public`;

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

//!Public Key para Autenticação VAPID para acessar os serviços de Web Push Notification dos servidores dos navegadores
const PUBLIC_KEY_VAPID = 'BBiT7Jc-HMy4svIPv2n4-TgJ8AxdQO0kczafH0gcCt3VaH3Cr3Aee4s3mwbcguzrwz_6AJFJY40DG88ivDGqsp4';


/**
 * Função que mostra o menu mobile ou esconde
 */
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

/**
 * Dispara uma notifcação de sucesso para o usuário
 */
function displayConfirmNotification(){
  //! Mostrando a notificação lado do Service Worker
  if('serviceWorker' in navigator){
    //Retorna uma promise cujo resolve é o registro do SW
    navigator.serviceWorker.ready
      .then( sw => {
        let options = {
          body: 'Você se increveu com sucesso para o nosso Serviço de Notificação!',
          icon: `${BASE_URL}/src/images/icons/app-icon-96x96.png`,
          image: `${BASE_URL}/src/images/products/product-default.png`, //Imagem a ser enviada no conteúdo
          dir : 'ltr', //Direção da leitura, ltr=> left to right, ou, rtl => right to left
          lang: 'pt-BR', //O padrão BCP 47 especifica quais são as tags para as linguagens
          vibrate: [100, 50, 200], //Se o dispositivo suportar vibrações, os valores do array são [ (duração em milsgs. da primeira vibração), (duração de espera para a segunda vibração), (duração em milsgs. da segunda vibração) ]
          badge: `${BASE_URL}/src/images/icons/app-icon-96x96.png`,//Badge é o ícone que aparece na barra do topo em dispositvos android quando você recebe uma notificação
          tag: 'confirm-notification', //tag é como um ID para a notification, se você enviar várias notifications com a mesma tag, suas informações serão empilhadas para o usuário em uma única Notification 
          renotify: true, //Habilitando essa propriedade o usuário será notificado (som, vibração, etc) sempre que chegar uma nova notificação mesmo que tenha a mesma tag, por default, essa propriedade é true

          //!ACTIONS
          /**
           * * As actions definidas na Notification serão botões que levam 3 propriedades
           * 1º : action => é o ID da action
           * 2º : title => é o texto que vai aparecer dentro do botão
           * 3º : icon => é o ícone que vai aparecer dentro do botão
           * 
           * !OBS: A função que a action vai executar quando disparado o evento de click é configurada no [SW] pois Notifications são um recurso do SISTEMA, ou seja, devem funcionar mesmo com a aplicação fechada
           */
          actions: [
            {
              action: 'confirm',
              title: 'Ok',
              icon: `${BASE_URL}/src/images/icons/app-icon-96x96.png`
            },
            {
              action: 'confirm',
              title: 'Cancelar',
              icon: `${BASE_URL}/src/images/icons/app-icon-96x96.png`
            }
          ],
        };

        sw.showNotification('Permissão concedida com sucesso! [from SW]', options);
      });
  }

  //! Mostrando a notificação lado normal do cliente com Javascript
  // let options = {
      // body: 'Você se increveu com sucesso para o nosso Serviço de Notificação!',
      // icon: `${BASE_URL}/src/images/icons/app-icon-96x96.png`,
      // image: `${BASE_URL}/src/images/products/product-default.png`, //Imagem a ser enviada no conteúdo
      // dir : 'ltr', //Direção da leitura, ltr=> left to right, ou, rtl => right to left
      // lang: 'pt-BR', //O padrão BCP 47 especifica quais são as tags para as linguagens
      // vibrate: [100, 50, 200], //Se o dispositivo suportar vibrações, os valores do array são [ (duração em milsgs. da primeira vibração), (duração de espera para a segunda vibração), (duração em milsgs. da segunda vibração) ]
      // badge: `${BASE_URL}/src/images/icons/app-icon-96x96.png`,//Badge é o ícone que aparece na barra do topo em dispositvos android quando você recebe uma notificação
      //tag: 'confirm-notification', //tag é como um ID para a notification, se você enviar várias notifications com a mesma tag, suas informações serão empilhadas para o usuário em uma única Notification 
      //renotify: true, //Habilitando essa propriedade o usuário será notificado (som, vibração, etc) sempre que chegar uma nova notificação mesmo que tenha a mesma tag, por default, essa propriedade é true
  // };

  // new Notification('Successfully subscribed!', options);
}

/**
 * Faz o registro da subscription entre a aplicação e o navegador do dispositivo para que a aplicação possa realizar Push Notifications 
 */
function configureWebPushSubscription(){
  
  //Se SW não for um recurso disponível no navegador, cancelamos a funcao
  if(!('serviceWorker' in navigator)){
    return;
  }

  //Variavel para armazenar o registro do SW para ser usado posteriormente
  let swReg;

  //Retorna uma promise cujo resolve é o registro do SW
  navigator.serviceWorker.ready
    .then( sw => {
      swReg = sw;

      //Pegando todas subscriptions existentes dessa aplicação com o navegador/dispositivo do usuário
      return sw.pushManager.getSubscription();
    })
    .then( subscription => {
      //Checando se a subcription ainda não existe, criamos ela
      if(subscription === null){
        console.log('New Subscription was created!');

        //Criando uma subscribe
        //!OBS: Uma subscribe está vinculada à ESSA aplicação no dispositivo do usuário, ao SW e ao navegador com os serviços do Google para notificações
        return swReg.pushManager.subscribe({
          userVisibleOnly: true, //Esse parametro indica basicamente, uma admissão de que você vai mostrar uma notificação cada vez que um push for enviado
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY_VAPID), //TODO - É necessário gerar as keys(PRIVADA e PUBLICA) para autenticação asincrona
        });
      } else {
        //Se entrar aqui, é porquê já foi criada a subscription
      }
    })
    .then( newSubscription => {
      //Gravando a subscribe gerada no BD para podermos enviar WebPushNotifications direto do backend para o usuário através da subscription
      return fetch(`${API_BASE_URL}/home/savesubscription`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept':'application/json',
        },
        body: JSON.stringify(newSubscription)
      })
    })
    .then( response => {
      if(response.OK)
        console.log('The subscriptions was sent to DATABASE through the API', response.json());
        displayConfirmNotification();
    })
    .catch( error => {
      console.log('The subscription not sent to DATABASE', error);
    });
}

/**
 *  Função que configura a aplicação para disponibilizar ao usuário as Notifications e as Push Notifications
 * 1º : Verifica se tem o recurso de Notifications no navegador do usuário
 * 2º : Se 1º for true, associa o evento que dispara um pedido para o usuário que pede permissão para usar o recurso de notifications no seu navegador
 * 3º : Se o pedido foi aceito pelo usuário, esconde o botão de de ativar notificações e já mostra uma notificação de sucesso
 */
function settingsEventButton2EnableNotifications(){
  
  //Checando se a API de notificações e de SW existem no navegador do usuário
  if('Notification' in window && 'serviceWorker' in navigator){
    //Pegando os dois botões que habilitam notificações, um para mobile e um para desktop/telas maiores
    let btnsEnableNotification = $$('.enable-notifications');
    
    btnsEnableNotification.forEach( eachBtn => {

      //Monstrando os botoões que permitem o usário ativar notificações
      eachBtn.style.display = 'block';

      //Associando funcao que pede ao usuário permissão para mostrar notificações quando o evento do click dos botões for disparado
      eachBtn.addEventListener( 'click' , event => {
        //Desativando o botão para não permitir dois cliques seguidos
        event.target.style.disabled = true;

        // Mostra uma mensagem padrão pedindo o usuário para dar permissões de notificação para a aplicação
        //!OBS: A permissão de notificação requisitada ao usuário também da permissão ao recurso de Push Notifications, que são as notificações que vem do servidor para o navegador e do navegador para a aplicação
        Notification.requestPermission( result => {
          console.log('User Choice', result);

          //Checando a escolha do usuário
          if(result !== 'granted'){ //Se o usuario não aceitou (result==='denied')
            console.log('No notification permission granted!');
          } else {//Se o usuário aceitou (result==='granted')
            console.log('The permission to notifications was accept!');

            //Escondendo o botão após o usuário dar as permissões para notifications
            // event.target.style.display = 'none';

            //Disparando a notificação de sucesso DIRETO DA APLICAÇÃO
            // displayConfirmNotification();

            //Disparando o registro de uma subscription no dispositivo com o navegador para realizar Push Notifications
            configureWebPushSubscription();
          }
        });
      }); 
    });
  }
}

//! Iniciando o [SW]
if (!window.Promise)
    window.Promise = Promise;

registerServiceWorker();

settingsEventButton2EnableNotifications();