"use strict";

// const BASE_URL = `http://localhost/project-doapp/frontend/public`;
// const API_BASE_URL = `http://127.0.0.1/project-doapp/backend-api/public`;
//!Public Key para Autenticação VAPID para acessar os serviços de Web Push Notification dos servidores dos navegadores
var PUBLIC_KEY_VAPID = 'BBiT7Jc-HMy4svIPv2n4-TgJ8AxdQO0kczafH0gcCt3VaH3Cr3Aee4s3mwbcguzrwz_6AJFJY40DG88ivDGqsp4'; //!Variavel que armazena o evento que mostra o banner PWA

var deferredPrompt; //Pegando a referência para os elementos a serem manipulados

var menuMobile = $('header nav .menu');
var modalLogin = $('.modal.modal-login');
var modalRegister = $('.modal.modal-register');
var bgModalSmoke = $('div.bg-modal');
var formRegister = $('form#form-register');
var formLogin = $('form#form-login');
var btnAddPost = $('i.add-post');
var btnLogin = $('li.menu-item.menu-item--login');
var btnLogout = $('li.menu-item.menu-item--logout');
/**
 * Função atrelada ao click do botão install app
 */

function installPWAApp(btnInstallAPP) {
  //Verificando se o deferredPrompt já foi setado
  if (deferredPrompt) {
    //Acionando o evento
    deferredPrompt.prompt(); //Checando a escolha do usuário, se aceitou ou não a instalação

    deferredPrompt.userChoice.then(function (choiceResult) {
      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User accept the installation');
        btnInstallAPP.setAttribute('disabled', true);
        btnInstallAPP.style.cursor = 'not-allowed';
        btnInstallAPP.style.display = 'none';
      }
    }); //Setando o evento como NULL
    // deferredPrompt = null;
  }
}
/**
 * Função que mostra o menu mobile ou esconde
 */


function toggleMenuMobile() {
  menuMobile.classList.toggle('show-menu-mobile');
  $('header nav i.icon-default').classList.toggle('icon-menu');
  $('header nav i.icon-default').classList.toggle('icon-cancel');
}
/**
 * Função que fecha o modal respectivo a sua referencia recebida por parametro
 */


function closeModalByRef(modalRef) {
  bgModalSmoke.style.display = 'none';
  $(modalRef).classList.remove('show-modal-default');
}
/**
 * Função que fecha o modal passado por parametro
 */


function closeModalByElement(modalElement) {
  bgModalSmoke.style.display = 'none';
  modalElement.classList.remove('show-modal-default');
}
/**
 * Função que checa se o usuário está logado sempre que carrega a página
 */


function checkIsLoggedUser() {
  //Checando se o JWT e o id do usuário logado estão setados
  if (window.localStorage.getItem('jwt') && window.localStorage.getItem('jwt') !== 'null' && window.localStorage.getItem('id_logged_user') && window.localStorage.getItem('id_logged_user') !== 'null') {
    //Mostrando o botão de adicionar novas postagens
    if (btnAddPost) btnAddPost.style.display = 'flex'; //Escondendo o botão de login

    btnLogin.style.display = 'none';
    btnLogout.style.display = 'flex';
  } else {
    //Setando jwt e id do user gravados no localStorage como null
    window.localStorage.setItem('jwt', null);
    window.localStorage.setItem('id_logged_user', null); //Mostrando o botão de adicionar novas postagens

    btnAddPost.style.display = 'none'; //Escondendo o botão de login

    btnLogin.style.display = 'flex';
    btnLogout.style.display = 'none';
  }
}
/**
 * Função que acionada ao clicar no botão de logout
 */


function logoutUser() {
  //Setando jwt e id do user gravados no localStorage como null
  window.localStorage.setItem('jwt', null);
  window.localStorage.setItem('id_logged_user', null); //Mostrando o botão de adicionar novas postagens

  if (btnAddPost) btnAddPost.style.display = 'none'; //Escondendo o botão de login

  btnLogin.style.display = 'flex';
  btnLogout.style.display = 'none';
}
/**
 * Função que mostra o modal de Login
 */


function showModalLogin() {
  toggleMenuMobile();
  bgModalSmoke.style.display = 'block';
  setTimeout(function () {
    modalLogin.classList.add('show-modal-default');
  }, 100);
}
/**
 * Função que envia os dados no form do modal de Login
 */


function sendModalLogin() {
  var endpoint = API_BASE_URL + '/user/login';
  var userEmail = formLogin.querySelector('input[name=email]').value;
  var userPass = formLogin.querySelector('input[name=password]').value; //Verifica se ficou algum campo vazio

  if (userEmail == '' || userEmail == null || userPass == '' || userPass == null) {
    Swal.fire({
      icon: 'error',
      title: 'ERRO:',
      text: 'Todas informações precisam ser preenchidas para finalizar seu anúncio.'
    });
    return; //Cancela a operação de enviar o anuncio
  } //Validando o email


  if (!validateEmail(userEmail)) {
    Swal.fire({
      icon: 'error',
      title: 'ERRO:',
      text: 'E-mail inválido. Por favor, insira um email válido para prosseguir.'
    });
    return;
  } //Focando o input do email


  formRegister.querySelector('input[name=email]').focus(); //Pegando os dados do Post e transformando no formato FormData para podermos enviar a imagem

  var loginFormData = new FormData();
  loginFormData.append('email', userEmail);
  loginFormData.append('password', userPass);
  console.log('Form data', loginFormData);
  fetch(endpoint, {
    "method": "POST",
    "body": loginFormData
  }).then(function (response) {
    return response.json();
  }).then(function (responseJSON) {
    //Checa se houve algum erro, se houver, lança o error para o catch
    if (responseJSON.errors) {
      throw responseJSON.errors;
    } //Alerta de sucesso


    Swal.fire({
      icon: 'success',
      title: 'Autenticado com sucesso!',
      showConfirmButton: false,
      timer: 1500
    }); //Fechando o modal register

    closeModalByElement(modalLogin); //Salvando o jwt e o id do usuario logado

    window.localStorage.setItem('jwt', responseJSON.data.jwt);
    window.localStorage.setItem('id_logged_user', responseJSON.data.id_user); //Mostrando o botão de adicionar novas postagens

    btnAddPost.style.display = 'flex'; //Escondendo o botão de login

    btnLogin.style.display = 'none';
    btnLogout.style.display = 'flex';
  })["catch"](function (errors) {
    Swal.fire({
      icon: 'error',
      title: 'ERRO:',
      text: errors.msg
    });
  });
  return; //Cancela a operação de enviar o anuncio
}
/**
 * Função que mostra o modal de Registro
 */


function showModalRegister() {
  closeModalByElement(modalLogin);
  bgModalSmoke.style.display = 'block';
  setTimeout(function () {
    modalRegister.classList.add('show-modal-default');
  }, 100);
}
/**
 * Função que envia os dados no form do modal de Register
 */


function sendModalRegister() {
  var endpoint = API_BASE_URL + '/user/register';
  var userName = formRegister.querySelector('input[name=name]').value;
  var userEmail = formRegister.querySelector('input[name=email]').value;
  var userPass = formRegister.querySelector('input[name=password]').value; //Verifica se ficou algum campo vazio

  if (userName == '' || userName == null || userEmail == '' || userEmail == null || userPass == '' || userPass == null) {
    Swal.fire({
      icon: 'error',
      title: 'ERRO:',
      text: 'Todas informações precisam ser preenchidas para finalizar seu anúncio.'
    });
    return; //Cancela a operação de enviar o anuncio
  } //Validando o email


  if (!validateEmail(userEmail)) {
    Swal.fire({
      icon: 'error',
      title: 'ERRO:',
      text: 'E-mail inválido. Por favor, insira um email válido para prosseguir.'
    });
    return;
  } //Focando o input do email


  formRegister.querySelector('input[name=email]').focus(); //Pegando os dados do Post e transformando no formato FormData para podermos enviar a imagem

  var registerFormData = new FormData();
  registerFormData.append('name', userName);
  registerFormData.append('email', userEmail);
  registerFormData.append('password', userPass);
  console.log('Form data', registerFormData);
  fetch(endpoint, {
    "method": "POST",
    "body": registerFormData
  }).then(function (response) {
    return response.json();
  }).then(function (responseJSON) {
    //Checa se houve algum erro, se houver, lança o error para o catch
    if (responseJSON.errors) {
      throw responseJSON.errors;
    } //Alerta de sucesso


    Swal.fire({
      icon: 'success',
      title: 'Registrado com sucesso!',
      showConfirmButton: false,
      timer: 1500
    }); //Fechando o modal register

    closeModalByElement(modalRegister); //Salvando o jwt e o id do usuario logado

    window.localStorage.setItem('jwt', responseJSON.data.jwt);
    window.localStorage.setItem('id_logged_user', responseJSON.data.id_user); //Mostrando o botão de adicionar novas postagens

    btnAddPost.classList.add('display-flex');
  })["catch"](function (errors) {
    Swal.fire({
      icon: 'error',
      title: 'ERRO:',
      text: errors.msg
    });
  });
  return; //Cancela a operação de enviar o anuncio
}
/**
 * Função que registra o SW no navegador
 */


function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker //Registrando o SW no navegador
    .register('./sw.js').then(function () {
      //Exibe a mensagem depois que o sw.js atende o evento de Instalação e retorna a promise do resister() na linha anterior
      console.log('Service Worker registered!');
    })["catch"](function (err) {
      console.log('Service Worker not registered!', err);
    });
  }
}
/**
 * Dispara uma notifcação de sucesso para o usuário
 */


function displayConfirmNotification() {
  //! Mostrando a notificação lado do Service Worker
  if ('serviceWorker' in navigator) {
    //Retorna uma promise cujo resolve é o registro do SW
    navigator.serviceWorker.ready.then(function (sw) {
      var options = {
        body: 'Você se increveu com sucesso para o nosso Serviço de Notificação!',
        icon: "".concat(BASE_URL, "/src/images/icons/app-icon-96x96.png"),
        // image: `${BASE_URL}/src/images/products/product-default-notification.png`, //Imagem a ser enviada no conteúdo
        dir: 'ltr',
        //Direção da leitura, ltr=> left to right, ou, rtl => right to left
        lang: 'pt-BR',
        //O padrão BCP 47 especifica quais são as tags para as linguagens
        vibrate: [100, 50, 200],
        //Se o dispositivo suportar vibrações, os valores do array são [ (duração em milsgs. da primeira vibração), (duração de espera para a segunda vibração), (duração em milsgs. da segunda vibração) ]
        badge: "".concat(BASE_URL, "/src/images/icons/app-icon-96x96.png"),
        //Badge é o ícone que aparece na barra do topo em dispositvos android quando você recebe uma notificação
        tag: 'confirm-notification',
        //tag é como um ID para a notification, se você enviar várias notifications com a mesma tag, suas informações serão empilhadas para o usuário em uma única Notification 
        renotify: true,
        //Habilitando essa propriedade o usuário será notificado (som, vibração, etc) sempre que chegar uma nova notificação mesmo que tenha a mesma tag, por default, essa propriedade é true
        //!ACTIONS

        /**
         * * As actions definidas na Notification serão botões que levam 3 propriedades
         * 1º : action => é o ID da action
         * 2º : title => é o texto que vai aparecer dentro do botão
         * 3º : icon => é o ícone que vai aparecer dentro do botão
         * 
         * !OBS: A função que a action vai executar quando disparado o evento de click é configurada no [SW] pois Notifications são um recurso do SISTEMA, ou seja, devem funcionar mesmo com a aplicação fechada
         */
        actions: [{
          action: 'confirm',
          title: 'Ok',
          icon: "".concat(BASE_URL, "/src/images/icons/check-64x64.png")
        }, {
          action: 'confirm',
          title: 'Cancelar',
          icon: "".concat(BASE_URL, "/src/images/icons/close-64x64.png")
        }]
      };
      sw.showNotification('Permissão concedida com sucesso! [from SW]', options);
    });
  } //! Mostrando a notificação lado normal do cliente com Javascript
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


function configureWebPushSubscription() {
  var btnEnableNotification = $('button.enable-notifications'); //Se SW não for um recurso disponível no navegador, cancelamos a funcao

  if (!('serviceWorker' in navigator)) {
    return;
  } //Variavel para armazenar o registro do SW para ser usado posteriormente


  var swReg; //Retorna uma promise cujo resolve é o registro do SW

  navigator.serviceWorker.ready.then(function (sw) {
    swReg = sw; //Pegando todas subscriptions existentes dessa aplicação com o navegador/dispositivo do usuário

    return sw.pushManager.getSubscription();
  }).then(function (subscription) {
    //Checando se a subcription ainda não existe, criamos ela
    if (subscription === null) {
      console.log('New Subscription was created!'); //Criando uma subscribe
      //!OBS: Uma subscribe está vinculada à ESSA aplicação no dispositivo do usuário, ao SW e ao navegador com os serviços do Google para notificações

      return swReg.pushManager.subscribe({
        userVisibleOnly: true,
        //Esse parametro indica basicamente, uma admissão de que você vai mostrar uma notificação cada vez que um push for enviado
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY_VAPID) //TODO - É necessário gerar as keys(PRIVADA e PUBLICA) para autenticação asincrona

      });
    } else {
      //*Se entrar aqui, é porquê já foi criada a subscription
      //Removendo subscription atual
      subscription.unsubscribe().then(function (successful) {
        //Subscription removida do servidor do navegador com sucesso!
        console.log('Subscription have removed'); //Mudando o icone e texto do botão indicando Notificações Desativadas

        btnEnableNotification.style.width = '242px';
        btnEnableNotification.querySelector('i').classList.remove('icon-bell-alt');
        btnEnableNotification.querySelector('i').classList.add('icon-bell-off');
        btnEnableNotification.querySelector('p').innerText = 'Notificações Desativadas';
      })["catch"](function (error) {
        console.log('Error, unsubscribe notifications have failed', error);
      });
    }
  }).then(function (newSubscription) {
    //Mudando o icone e texto do botão indicando Notificações Ativadas
    btnEnableNotification.style.width = '216px';
    btnEnableNotification.querySelector('i').classList.add('icon-bell-alt');
    btnEnableNotification.querySelector('i').classList.remove('icon-bell-off');
    btnEnableNotification.querySelector('p').innerText = 'Notificações Ativadas'; //Gravando a subscribe gerada no BD para podermos enviar WebPushNotifications direto do backend para o usuário através da subscription

    return fetch("".concat(API_BASE_URL, "/home/savesubscription"), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(newSubscription)
    });
  }).then(function (response) {
    if (response.OK) console.log('The subscriptions was sent to DATABASE through the API', response.json());
    displayConfirmNotification();
  })["catch"](function (error) {
    console.log('The subscription not sent to DATABASE', error);
  });
}
/**
 * Este método é chamado ao carregar a página
 * Checa se o usuário já tem uma subscription para WebPushNotifications e atualizar o botão de ativar notificações
 */


function checkUserSubscriptionWPN() {
  //Se SW não for um recurso disponível no navegador, cancelamos a funcao
  if (!('serviceWorker' in navigator)) return;
  var btnEnableNotification = $('button.enable-notifications'); //Retorna uma promise cujo resolve é o registro do SW

  navigator.serviceWorker.ready.then(function (swReg) {
    //Pegando todas subscriptions existentes dessa aplicação com o navegador/dispositivo do usuário
    swReg.pushManager.getSubscription().then(function (subscription) {
      //Checando se esse dispositvo/sw já possui uma subscription no servidor de WPN do navegador
      if (subscription) {
        //Se tiver, atualiza o botão com as respectivas informações
        //Mudando o icone e texto do botão indicando Notificações Desativadas
        btnEnableNotification.querySelector('i').classList.add('icon-bell-alt');
        btnEnableNotification.querySelector('i').classList.remove('icon-bell-off');
        btnEnableNotification.querySelector('p').innerText = 'Notificações Ativadas';
      } else {
        //Mudando o icone e texto do botão indicando Notificações Desativadas
        btnEnableNotification.querySelector('i').classList.remove('icon-bell-alt');
        btnEnableNotification.querySelector('i').classList.add('icon-bell-off');
        btnEnableNotification.querySelector('p').innerText = 'Notificações Desativadas';
      }
    });
  });
}
/**
 *  Função que configura a aplicação para disponibilizar ao usuário as Notifications e as Push Notifications
 * 1º : Verifica se tem o recurso de Notifications no navegador do usuário
 * 2º : Se 1º for true, associa o evento que dispara um pedido para o usuário que pede permissão para usar o recurso de notifications no seu navegador
 * 3º : Se o pedido foi aceito pelo usuário, esconde o botão de de ativar notificações e já mostra uma notificação de sucesso
 */


function settingsEventButton2EnableNotifications() {
  //Checando se a API de notificações e de SW existem no navegador do usuário
  if ('Notification' in window && 'serviceWorker' in navigator) {
    //Pegando os dois botões que habilitam notificações, um para mobile e um para desktop/telas maiores
    var btnEnableNotification = $('button.enable-notifications'); //Monstrando os botoões que permitem o usário ativar notificações

    $('header ul.menu > li.menu-item.menu-item--notifications').style.display = 'flex'; //Associando funcao que pede ao usuário permissão para mostrar notificações quando o evento do click dos botões for disparado

    btnEnableNotification.addEventListener('click', function (event) {
      //Desativando o botão para não permitir dois cliques seguidos
      event.target.style.disabled = true; // Mostra uma mensagem padrão pedindo o usuário para dar permissões de notificação para a aplicação
      //!OBS: A permissão de notificação requisitada ao usuário também da permissão ao recurso de Push Notifications, que são as notificações que vem do servidor para o navegador e do navegador para a aplicação

      Notification.requestPermission(function (result) {
        console.log('User Choice', result); //Checando a escolha do usuário

        if (result !== 'granted') {
          //Se o usuario não aceitou (result==='denied')
          console.log('No notification permission granted!'); //Mudando o icone e texto do botão indicando Notificações Desativadas

          btnEnableNotification.style.width = '239px';
          btnEnableNotification.querySelector('i').classList.remove('icon-bell-alt');
          btnEnableNotification.querySelector('i').classList.add('icon-bell-off');
          btnEnableNotification.querySelector('p').innerText = 'Notificações Desativadas';
        } else {
          //Se o usuário aceitou (result==='granted')
          console.log('The permission to notifications was accept!'); //Escondendo o botão após o usuário dar as permissões para notifications
          // event.target.style.display = 'none';
          //Disparando a notificação de sucesso DIRETO DA APLICAÇÃO
          // displayConfirmNotification();
          //Disparando o registro de uma subscription no dispositivo com o navegador para realizar Push Notifications

          configureWebPushSubscription();
        }
      });
    });
  }
} //! Iniciando o [SW]


if (!window.Promise) window.Promise = Promise; //! Pegando o evento defaut que mostra o banner para installar o app PWA

window.addEventListener('beforeinstallprompt', function (event) {
  console.log(' beforeinstallprompt fired by chrome');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});
registerServiceWorker();
settingsEventButton2EnableNotifications();
checkUserSubscriptionWPN();
checkIsLoggedUser();