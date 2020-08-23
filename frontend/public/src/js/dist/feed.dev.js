"use strict";

//Picture capturada pelo Canvas
var pictureCaptured; //GeoLocation capturada

var locationCaptured = {
  latitude: 0,
  longitude: 0
}; //Armazena a pagina atual da paginacao

var currentPage = 1; //Const que armazena o limite de posts exibidos por pagina

var limitPostsPerPage = 5; //Armazena o termo pesquisado pelo usuário para encontrar posts pelo título, por default é ''

var term = ''; //Pegando a referência para os elementos a serem manipulados

var videoPlayer = $('.modal.modal-add-post #video-player');
var canvasImgCapture = $('.modal.modal-add-post #canvas-img-capture');
var boxCameraControls = $('.modal.modal-add-post .camera-controls');
var selectOptionsCamera = $('.modal.modal-add-post #camera-options');
var btnImgCapture = $('.modal.modal-add-post #btn-img-capture');
var imgPickerBox = $('.modal.modal-add-post .image-picker-box');
var imgPickerInput = $('.modal.modal-add-post #image-picker');
var imgPickerInputLabel = $('.modal.modal-add-post label[for=image-picker]');
var btnGeoLocation = $('.modal.modal-add-post #btn-location');
var locationLoader = $('.modal.modal-add-post .spinner.spinner-location');
var loaderConteiner = $('.loader'); //Loader apresentado no scroll inifito

var sectionPostsArea = $('section#posts .section-area'); //Area onde ficam as postagens
//Checa os recursos necessários e configura a aplicação para utilizar as funcionalidades de camera 

function initializeMedia() {
  //Checando se no navegador temos o recurso de acesso a media devices do dispositivo [Até o momento, apenas o Chrome tem]
  if (!('mediaDevices' in navigator)) {
    //Se não tiver, criamos nosso própria recurso de mediaDevices no navegador
    navigator.mediaDevices = {};
  } //Checando se o recurso mediaDevices não possui já definido o método getUserMedia [Só entra nesse IF se entrar no primeiro IF também]


  if (!('getUserMedia' in navigator.mediaDevices)) {
    //Implementando a nossa própria solução, pegando os métodos antigos de acesso a câmera respectivos de cada navegador e implementamos manualmente no mediaDevices.getUserMedia
    navigator.mediaDevices.getUserMedia = function (constraints) {
      /**
       * navigator.webkitGetUserMedia => Safari
       * navigator.mozGetUserMedia => Mozila
       */
      var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia; //Entra aqui se o navegador não for o Mozila ou o Safari e também não tiver a API mediaDevices definidas

      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented!'));
      } //!OBS: A Sintaxe nativa do método getUserMedia sempre retorna uma Promise, logo, devemos retornar uma Promise para caso de sucesso e de falha também para não quebrar a sintaxe


      return new Promise(function (resolve, reject) {
        //Setando como o método getUserMedia deverá ser chamado
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  } //Definindo o JSON das videoConstraints para configurar o acesso a API de mediaDevices para câmera traseira se houver


  var videoConstraints = {
    facingMode: 'environment'
  }; //Acionando o método que vai pedir ao usuário permissão para acessar o video(câmera) e se ele permitir vai fazer a conexão
  // navigator.mediaDevices.getUserMedia({video: true, audio: true});

  navigator.mediaDevices.getUserMedia({
    video: videoConstraints,
    audio: false
  }) //Se o usuário deu permissão para acessar a câmera
  .then(function (stream) {
    //Enviando o fluxo de video para o a tag <video> definida na página
    videoPlayer.srcObject = stream;
    videoPlayer.style.display = 'block'; //Monstrando a tag <video>

    boxCameraControls.style.display = 'flex'; //Monstrando os controles de Câmera (Inclui o botão de captura e o botão para trocar de câmera)
    //Pegando todos dispositivos de Media disponíveis(Câmera) e populando o select com eles no método gotDevices

    return navigator.mediaDevices.enumerateDevices();
  }).then(gotDevices) //Se o usuário não deu permissão OU se foi lançado a Promise com ERROR para o caso em que o navegador não possui a API mediaDevices e nem foi possível implementar manualmente nas condições acima
  ["catch"](function (error) {
    //Se por algum motivo não foi possível utilizar a câmera, mostramos ao usuário a possibilidade de enviar um arquivo de imagem
    imgPickerBox.style.display = 'flex';
    console.log('[MediaDevices] Couldn\'t possible access video devices', error);
  });
} //Pega todos os dispositivos de Media disponíveis no dispositivo


function gotDevices(mediaDevices) {
  selectOptionsCamera.innerHTML = '<option>Selecione a Câmera</option>'; // selectOptionsCamera.appendChild(document.createElement('option'));

  var count = 1;
  mediaDevices.forEach(function (mediaDevice) {
    if (mediaDevice.kind === 'videoinput') {
      var option = document.createElement('option');
      option.value = mediaDevice.deviceId;
      var label = mediaDevice.label || "Camera ".concat(count++);
      var textNode = document.createTextNode(label);
      option.appendChild(textNode);
      selectOptionsCamera.appendChild(option);
    }
  });
} //Muda o dispositivo que está enviando o fluxo de video para tag <video> de acordo com o video da <option> selecionada no <select>


function changeCurrentStream(selectElement) {
  //Para o streamming de video atual se houver 
  if (typeof videoPlayer.srcObject !== 'undefined') {
    stopVideoTracks(videoPlayer.srcObject);
  } //Declarando o JSON das videoConstraints para configurar o acesso a API de mediaDevices para uma câmera específica


  var videoConstraints = {}; //Checa se no select foi escolhido uma opção de valor VAZIO

  if (selectElement.value === '') {
    //Se foi escolhida uma opção vazia, setamos a padrão que é a câmera traseira no caso de um Mobile
    videoConstraints.facingMode = 'environment';
  } else {
    videoConstraints.deviceId = {
      exact: selectElement.value
    };
  } //Acionando o método que vai pedir ao usuário permissão para acessar o video(câmera) e se ele permitir vai fazer a conexão
  // navigator.mediaDevices.getUserMedia({video: true, audio: true});


  navigator.mediaDevices.getUserMedia({
    video: videoConstraints,
    audio: false
  }) //Se o usuário deu permissão para acessar a câmera
  .then(function (stream) {
    //Enviando o fluxo de video para o a tag <video> definida na página
    videoPlayer.srcObject = stream;
  }) //Se o usuário não deu permissão OU se foi lançado a Promise com ERROR para o caso em que o navegador não possui a API mediaDevices e nem foi possível implementar manualmente nas condições acima
  ["catch"](function (error) {
    //Se por algum motivo não foi possível utilizar a câmera, mostramos ao usuário a possibilidade de enviar um arquivo de imagem
    imgPickerBox.style.display = 'flex';
    console.log('[MediaDevices] Couldn\'t possible access video devices', error);
  });
} //Para o streaming de video passado no parâmetro


function stopVideoTracks(stream) {
  //Parando o streaming de video vindo da tag <video>
  stream.getVideoTracks().forEach(function (eachTrack) {
    eachTrack.stop(); //Parando cada faixa de video
  });
} //Captura uma imagem da tag video e coloca ela na tag canvas


function captureImageFromStream2Canvas(buttonCapture) {
  //Monstrando o Canvas que vai conter a imagem capturada
  canvasImgCapture.style.display = 'block'; //Escondendo o Streaming de video (tag <video>)

  videoPlayer.style.display = 'none'; // buttonCapture.style.display = 'none';

  buttonCapture.setAttribute('disabled', true); //Desabilitando o botão de captura

  buttonCapture.style.cursor = 'not-allowed'; //Mudando o cursor para not-allowed

  var canvasContext = canvasImgCapture.getContext('2d'); //Setando que o conteúdo do canvas terá 2 dimensões
  //Inserindo a imagem do stream de video no conteúdo do Canvas
  //!Redimensionando a imagem vinda do video no Canvas

  var widthOrigin = videoPlayer.videoWidth;
  var heightOrigin = videoPlayer.videoHeight;
  var heightCanvas = canvasImgCapture.height;
  var widthCanvas = canvasImgCapture.width;

  if (widthOrigin > heightOrigin) {
    heightCanvas = canvasImgCapture.width / widthOrigin * heightOrigin;
  } else if (widthOrigin < heightOrigin) {
    widthCanvas = canvasImgCapture.height / heightOrigin * widthOrigin;
  }

  canvasImgCapture.setAttribute('width', widthCanvas);
  canvasImgCapture.setAttribute('height', heightCanvas);
  canvasContext.drawImage(videoPlayer, //Fonte da imagem
  0, //Posição em X que ela ocupara no canvas
  0, //Posição em Y que ela ocupara no canvas
  widthCanvas, //Largura do destino 
  heightCanvas //Altura do destino
  ); //Parando o streaming de video vindo da tag <video>

  stopVideoTracks(videoPlayer.srcObject); //Pegando a imagem capturada no canvas, passando a url para dataURItoBlob e pegando um arquivo de imagem no retorno

  pictureCaptured = dataURItoBlob(canvasImgCapture.toDataURL());
} //Captura a imagem upada na tag input[type=file] que é apresentada como opção quando o usuário não permite o aceso a câmera ou quando o navegador do usuário não fornece esse recurso


function captureImageFromInputFile(inputFile) {
  pictureCaptured = inputFile.files[0]; //Pegando apenas o primeiro arquivo

  imgPickerInputLabel.innerText = 'Uma imagem foi enviada!';
} //Checa os recursos necessários e configura a aplicação para utilizar as funcionalidades de geo localização


function initializeGeoLocation() {
  //Checando se NÃO tem o recurso de geolocalização no navegador
  if (!('geolocation' in navigator)) {
    btnGeoLocation.style.display = 'none';
  }
} //Captura a geoLocalizacao quando clica no botão de captura


function captureGeoLocation() {
  //Verificando se existe o recurso
  if (!('geolocation' in navigator)) {
    return;
  } //Bloqueando o click do botão após clicar uma vez


  btnGeoLocation.setAttribute('disabled', true);
  btnGeoLocation.style.cursor = 'not-allowed'; //Flag levantada quando o alert é mostrado uma vez

  var flagAlert = true; //Monstrando o Loading 

  locationLoader.style.display = 'inline-block'; //Pegando a posição atual
  //!OBS: Antes de tentar pegar a posição do usuário o método getCurrentPosition pede permissão ao usuário para tentar acessar a API de geolocalização do navegador

  navigator.geolocation.getCurrentPosition( //1º Parametro: Callback com a localizacao
  function (position) {
    //Se conseguir pegar a localização, tiramos o loading e bloqueamos o botão
    //Bloqueando o click do botão após clicar uma vez
    btnGeoLocation.setAttribute('disabled', true);
    btnGeoLocation.style.cursor = 'not-allowed';
    setTimeout(function () {
      locationLoader.style.display = 'none';
    }, 500); //Pegando a localizacao

    locationCaptured.latitude = position.coords.latitude;
    locationCaptured.longitude = position.coords.longitude;
    console.log('Condinates got by GeoLocation API', position.coords); //*Utilizando a API do MAPBOX para pegar o endereço do usuário

    var MAPBOX_APIKEY = 'pk.eyJ1IjoibHVjYXNsZ3IiLCJhIjoiY2tkYzJrcmVpMTBwMzJ0cGdjYnNnZHc4MSJ9.rpysMhdt4d9iJsKT2boujw';
    fetch("https://api.mapbox.com/geocoding/v5/mapbox.places/".concat(locationCaptured.longitude, ",").concat(locationCaptured.latitude, ".json?types=address&access_token=").concat(MAPBOX_APIKEY)).then(function (response) {
      if (response.ok) {
        return response.json();
      }
    }).then(function (responseJSON) {
      console.log('Fetched adress from MAPBOX API reverse geolocation', responseJSON);
      $('textarea[name=location]').value = responseJSON.features[0].place_name;
      $('textarea[name=location]').focus();
      console.log('Response from MAPBOX API', responseJSON);
    })["catch"](function (error) {
      console.log('Request to MAPBOX API failed', error);
    });
  }, //2º Parâmetro: Callback com o erro
  function (error) {
    //Se houver uma falha, o usuário pode tentar pegar a localização novamente
    //Tirando o bloqueio de click botão
    btnGeoLocation.removeAttribute('disabled');
    btnGeoLocation.style.cursor = 'pointer';
    locationLoader.style.display = 'none';

    if (flagAlert) {
      alert('Não foi possível pegar a sua localização...Por favor tente novamente ou digite o seu endereço manualmente.');
      flagAlert = false;
    }

    locationCaptured = null; //Setando a localização como null
  }, //3º Parâmetro: JSON com options que setam caracteristicas na utilizacao da API
  {
    timeout: 7000 //Setando o tempo limite a API conseguir a localizacao na resposta da requisicao

  });
} //Mostra o modal que adiciona uma nova postagem


function showModalAddPost() {
  //Inicializando a API de câmera
  initializeMedia(); //Inicializando a API de geolocalização

  initializeGeoLocation();
  $('.modal.modal-add-post').classList.toggle('show-modal-add-post');
  $('section#posts').classList.toggle('display-none');
} //Fecha o modal que adiciona uma nova postagem


function closeModalAddPost() {
  //Parando o streaming de video vindo da tag <video> se ela tiver com algum streaming(fluxo de video)
  if (videoPlayer.srcObject) {
    console.log('Stopping the Streamimg...');
    stopVideoTracks(videoPlayer.srcObject);
  } //Setando um tempo para que a animation ocorra


  setTimeout(function () {
    $('.modal.modal-add-post').classList.remove('show-modal-add-post');
    $('section#posts').classList.remove('display-none');
  }, 10); //Tirando os elementos que mostram o streaming de video vindo da câmera e a area do image picker quando fecha o modal

  videoPlayer.style.display = 'none';
  imgPickerBox.style.display = 'none';
  canvasImgCapture.style.display = 'none'; //==========================================<LIMPANDO O CONTEÚDO DO CANVAS>===============================================//
  //Limpando o conteúdo capturado no canvas(SE HOUVER) sem resetá-lo

  var contextCanvas = canvasImgCapture.getContext('2d'); // Store the current transformation matrix

  contextCanvas.save(); // Use the identity matrix while clearing the canvas

  contextCanvas.setTransform(1, 0, 0, 1, 0, 0);
  contextCanvas.clearRect(0, 0, canvasImgCapture.width, canvasImgCapture.height); // Restore the transform

  contextCanvas.restore(); //========================================================================================================================//
  //Limpando a imagem salva

  pictureCaptured = null; //Reabilitando o botão de captura caso esteja desabilitado

  btnImgCapture.removeAttribute('disabled');
  btnImgCapture.style.cursor = 'pointer'; //Reabilitando o botão de captura de localização
  //Reabilitando o botão de captura caso esteja desabilitado

  btnGeoLocation.removeAttribute('disabled');
  btnGeoLocation.style.cursor = 'pointer'; //Limpando o input[type=file]

  imgPickerInput.value = ''; //Alterando o texto do Label

  imgPickerInputLabel.innerText = 'Selecione uma imagem!'; //Monstrando os controles para pegar a geolocalização

  btnGeoLocation.style.display = 'block';
  locationLoader.style.display = 'none';
} //Limpa os inputs do modal


function clearModalAddPostInputs() {
  $('input[name=title]').value = '';
  $('textarea[name=location]').value = '';
  $('input[name=whatsapp-contact]').value = '';
  return;
} //Extrai e envia os dados do Post para a API


function sendModalPost() {
  var endpoint = API_BASE_URL + '/posts/new';
  var idPost = new Date().toISOString(); //Setando um ID temporário para os posts a serem armazenados no IndexedDB

  var title = $('input[name=title]').value;
  var location = $('textarea[name=location]').value;
  var whatsappContact = $('input[name=whatsapp-contact]').value; //Verifica se ficou algum campo vazio

  if (idPost == '' || idPost == null || title == '' || title == null || location == '' || location == null || whatsappContact == '' || whatsappContact == null || pictureCaptured == '' || pictureCaptured == null) {
    Swal.fire({
      icon: 'error',
      title: 'ERRO:',
      text: 'Todas informações precisam ser preenchidas para finalizar seu anúncio.'
    });
    return; //Cancela a operação de enviar o anuncio
  } //Verifica se o whatsapp está válido


  if (whatsappContact.length < 14) {
    $('input[name=whatsapp-contact]').focus();
    Swal.fire({
      icon: 'error',
      title: 'ERRO:',
      text: 'Número de whatsapp inválido.'
    });
    return; //Cancela a operação de enviar o anuncio
  } //Pegando os dados do Post e transformando no formato FormData para podermos enviar a imagem


  var postFormData = new FormData();
  postFormData.append('id', idPost);
  postFormData.append('title', title);
  postFormData.append('longitude', locationCaptured.longitude);
  postFormData.append('latitude', locationCaptured.latitude);
  postFormData.append('location', location);
  postFormData.append('whatsapp_contact', whatsappContact); //Enviando a imagem e renomeando-a pois no servidor não podemos ter imagens com nmomes iguais

  postFormData.append('image', pictureCaptured, "".concat(idPost, ".png")); //*Verificando se no navegador existe os recursos de [serviceWorker] e [SyncManager](BackgroundSyncronization)

  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    //*Quando o [SW] estiver registrado, instalado e ativado ele retorna uma promise no .ready
    navigator.serviceWorker.ready.then(function (sw) {
      //Montando JSON das info do post a ser gravado no indexedDB para background synchronization
      var requestData = {
        id: idPost,
        title: title,
        location: location,
        longitude: locationCaptured.longitude,
        latitude: locationCaptured.latitude,
        image: pictureCaptured,
        whatsapp_contact: whatsappContact
      }; //Salvando as informações da requisição no IndexedDB para serem sincronizadas no [SW]

      writeData('sync-posts', requestData).then(function () {
        //*Acessando o Sync Manager do [SW] e registrando uma async task com o nome passado no parâmetro
        sw.sync.register('sync-new-post');
      }).then(function () {
        //Alerta de sucesso
        Swal.fire({
          icon: 'success',
          title: 'Anúncio inserido com sucesso!',
          showConfirmButton: false,
          timer: 1500
        }); // fillPosts(); //! fillPosts() é engatilhado pelo SW quando ele executa a sync task('sync-new-post') registrada e retorna uma mensagem para main thred no client

        clearModalAddPostInputs();
        closeModalAddPost();
      })["catch"](function (errors) {
        console.log('ERRO', errors); // alert(`ERRO na sincronização de anúncios : ${errors.msg}`);
        //Alerta de erro

        Swal.fire({
          icon: 'error',
          title: 'ERRO:',
          text: 'Ocorreu um erro na sincronização dos anúncios.'
        });
        closeModalAddPost();
      });
    });
  } //* Se o navegador não tiver recursos de [SW] e [SyncManager]
  else {
      fetch(endpoint, {
        "method": "POST",
        // "headers": {
        //   'Content-Type': 'application/json'
        // },
        "body": postFormData
      }).then(function (response) {
        return response.json();
      }).then(function (responseJSON) {
        if (responseJSON.errors) {
          throw responseJSON.errors;
        } //Alerta de sucesso


        Swal.fire({
          icon: 'success',
          title: 'Anúncio inserido com sucesso!',
          showConfirmButton: false,
          timer: 1500
        });
        console.log('inserting a new post such id is: ' + responseJSON.data.id_post);
        fillPosts();
        clearModalAddPostInputs();
        closeModalAddPost();
      })["catch"](function (errors) {
        console.log('ERRO', errors); // alert(`ERRO ${errors.status_code} : ${errors.msg}`);
        //Alerta de erro

        Swal.fire({
          icon: 'error',
          title: 'ERRO:',
          text: 'Ocorreu um erro na sincronização dos anúncios.'
        });
        closeModalAddPost();
      });
    }
} //Cria uma nova postagem de anuncio utilizando appendChild


function createPost(dataPost) {
  //Montando os elementos HTML que constituem o DOM
  var postWrapper = document.createElement('div');
  postWrapper.setAttribute('data-id', dataPost.id);
  postWrapper.className = 'each-post';
  var postImg = document.createElement('img'); //Verificando se está vazia a URI de imagem que veio do BD

  if (dataPost.image === '') dataPost.image = './src/images/products/product-default.png';
  postImg.setAttribute('src', dataPost.image); //!VALOR da url da imagem

  postImg.setAttribute('alt', 'imagem do produto');
  var postTitle = document.createElement('h1');
  postTitle.className = 'title';
  postTitle.innerText = dataPost.title; //!VALOR do título
  //!TABELA COM AS INFORMAÇÕES

  var table = document.createElement('table'); //! MONTANDO A LINHA DA LOCATION NA TABELA

  var trLocation = document.createElement('tr');
  var tdLocationHeader = document.createElement('td');
  tdLocationHeader.classList.add('tdheader');
  tdLocationHeader.innerText = 'Localização:';
  var tdLocationValue = document.createElement('td');
  var aLocationValue = document.createElement('a');
  aLocationValue.classList.add('links-info');
  aLocationValue.classList.add('link-location');
  aLocationValue.setAttribute('target', '_blank'); //Pegando latitude e longitude

  var longitude = filterCoordinate(dataPost.longitude);
  var latitude = filterCoordinate(dataPost.latitude);

  if (longitude && latitude) {
    //Só seta o href se a latitude e longitude tiverem vierem do BD
    aLocationValue.setAttribute('href', "https://www.google.com/maps/place/".concat(latitude, ",").concat(longitude));
  }

  var pLocationValue = document.createElement('p');
  pLocationValue.innerText = dataPost.location;
  var iconLocationValue = document.createElement('i');
  iconLocationValue.classList.add('icon-location'); //Montando a tag <a>

  aLocationValue.appendChild(pLocationValue);
  aLocationValue.appendChild(iconLocationValue); //Montando o <td> value da Location

  tdLocationValue.appendChild(aLocationValue); //Montando o <tr> da location

  trLocation.appendChild(tdLocationHeader);
  trLocation.appendChild(tdLocationValue); //Inserindo o <tr> da location na table

  table.appendChild(trLocation); //![FIM] MONTANDO A LINHA DA LOCATION NA TABELA
  //! MONTANDO A LINHA COM INFORMAÇÕES DO WHATSAPP NA TABELA

  var trWhatsapp = document.createElement('tr');
  var tdWhatsappHeader = document.createElement('td');
  tdWhatsappHeader.classList.add('tdheader');
  tdWhatsappHeader.innerText = 'Whatsapp:';
  var tdWhatsappValue = document.createElement('td');
  var aWhatsappValue = document.createElement('a');
  aWhatsappValue.classList.add('links-info');
  aWhatsappValue.classList.add('link-whats');
  aWhatsappValue.setAttribute('target', '_blank'); //Tirando tudo que não seja número

  var whatsappNumber = dataPost.whatsapp_contact.replace(/\D/g, "");
  aWhatsappValue.setAttribute('href', "https://api.whatsapp.com/send?phone=55".concat(whatsappNumber, "&text=Ol%C3%A1%2C%20vim%20pelo%20DoApp%20e%20fiquei%20interessado%20na%20sua%20doa%C3%A7%C3%A3o.."));
  var pWhatsappValue = document.createElement('p');
  pWhatsappValue.innerText = dataPost.whatsapp_contact;
  var iconWhatsappValue = document.createElement('i');
  iconWhatsappValue.classList.add('icon-whatsapp'); //Montando a tag <a>

  aWhatsappValue.appendChild(pWhatsappValue);
  aWhatsappValue.appendChild(iconWhatsappValue); //Montando o <td> value da Whatsapp

  tdWhatsappValue.appendChild(aWhatsappValue); //Montando o <tr> da Whatsapp

  trWhatsapp.appendChild(tdWhatsappHeader);
  trWhatsapp.appendChild(tdWhatsappValue); //Inserindo o <tr> da location na table

  table.appendChild(trWhatsapp); //![FIM] MONTANDO A LINHA COM INFORMAÇÕES DO WHATSAPP NA TABELA
  //! MONTANDO A LINHA COM INFORMAÇÕES DA DATA DE POSTAGEM NA TABELA

  var trDateCreated = document.createElement('tr');
  var tdDateCreatedHeader = document.createElement('td');
  tdDateCreatedHeader.classList.add('tdheader');
  tdDateCreatedHeader.innerText = 'Data:';
  var tdDateCreatedValue = document.createElement('td');
  tdDateCreatedValue.classList.add('date-value');
  var pDateCreatedValue = document.createElement('p');
  pDateCreatedValue.innerText = dataPost.date_created;
  var iconDateValue = document.createElement('i');
  iconDateValue.classList.add('icon-calendar'); //Adicionando o <p> e o <i> dentro do <td>

  tdDateCreatedValue.appendChild(pDateCreatedValue);
  tdDateCreatedValue.appendChild(iconDateValue); //Montando o <tr> da DateCreated

  trDateCreated.appendChild(tdDateCreatedHeader);
  trDateCreated.appendChild(tdDateCreatedValue); //Inserindo o <tr> da location na table

  table.appendChild(trDateCreated); //![FIM] MONTANDO A LINHA COM INFORMAÇÕES DA DATA DE POSTAGEM NA TABELA
  //Adicionando todos os elementos no PostWrapper

  postWrapper.appendChild(postImg);
  postWrapper.appendChild(postTitle);
  postWrapper.appendChild(table); //Adicionando a nova postagem na area de postagens

  sectionPostsArea.appendChild(postWrapper);
} //Cria o HTML de uma nova postagem e retorna como string


function createPostHTML(dataPost) {
  console.log('Inserting HTMLPosts on post area', dataPost); //Extraindo todos os dados do JSON com as informações do post

  var id = dataPost.id,
      title = dataPost.title,
      image = dataPost.image,
      longitude = dataPost.longitude,
      latitude = dataPost.latitude,
      location = dataPost.location,
      whatsapp_contact = dataPost.whatsapp_contact,
      date_created = dataPost.date_created; //Verificando se sao coordenadas validas

  longitude = filterCoordinate(longitude);
  latitude = filterCoordinate(latitude); //Tirando todos os caracteres especiais do numero de whatsapp

  var whatsappOnlyNumber = whatsapp_contact.replace(/\D/g, "");
  var URL_API_GOOGLEMAPS = "https://www.google.com/maps/place/".concat(latitude, ",").concat(longitude);
  var URL_API_WHATSAPP = "https://api.whatsapp.com/send?phone=55".concat(whatsappOnlyNumber, "&text=Ol%C3%A1%2C%20vim%20pelo%20DoApp%20e%20fiquei%20interessado%20na%20sua%20doa%C3%A7%C3%A3o..");
  return "<div class=\"each-post\" data-id=\"".concat(id, "\">\n    <img src=\"").concat(image, "\" alt=\"imagem do objeto\">\n      <h1 class=\"title\">").concat(title, "</h1>\n      <table>\n        <tr>\n          <td class=\"tdheader\">Localiza\xE7\xE3o:</td>\n          <td>\n            <a target=\"_blank\" class=\"links-info link-location\" ").concat(longitude && latitude ? "href=\"".concat(URL_API_GOOGLEMAPS, "\"") : '', ">\n              <p>").concat(location, "</p>\n              <i class=\"icon-location\"></i>\n            </a>\n          </td>\n        </tr>\n        <tr>\n          <td class=\"tdheader\">Whatsapp:</td>\n          <td>\n            <a target=\"_blank\" class=\"links-info link-whats\" href=\"").concat(URL_API_WHATSAPP, "\">\n              <p>").concat(whatsapp_contact, "</p>\n              <i class=\"icon-whatsapp\"></i>\n            </a>\n          </td>\n        </tr>\n        <tr>\n          <td class=\"tdheader\">Data:</td>\n          <td class=\"date-value\">\n            <p>").concat(date_created, "</p>\n            <i class=\"icon-calendar\"></i>\n          </td>\n        </tr>\n      </table>\n  </div>");
} //Limpa todos os cards de posts/anuncios


function clearAllCards() {
  console.log('Cleaning all cards on posts area'); // $$('section#posts .section-area .each-post').forEach(each => each.remove());

  sectionPostsArea.innerHTML = '';
} //Limpa todos os cards de posts/anuncios com os respectivos Id especificados no arrayIds recebido no parâmetro


function clearAllCardsByIds(arrayIds) {
  console.log('Cleaning all cards by id', arrayIds);
  $$('section#posts .section-area .each-post').forEach(function (eachPost) {
    if (arrayIds.includes(parseInt(eachPost.getAttribute('data-id')))) {
      eachPost.remove();
      console.log('Removin duplicate post with id = ', eachPost.getAttribute('data-id'));
    }
  });
} //Puxando da API todos posts do banco e inserindo na tela
//Parâmetro FlagclearPostsArea => se for true ele limpa todos os posts e insere os novos, se for false mantém os atuais e adiciona os novos


function fillPosts() {
  var resetPage = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
  var FlagclearPostsArea = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var queryTerm = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
  // ! ESTRATÉGIA : CACHE THEN NETWORK
  //flag que é levantada quando a resposta da requisição a rede é obtida
  var networkDataReceived = false; //Se foi requisitado para primeira pagina setamos currentPage = 1

  if (resetPage) {
    currentPage = 1;
  } //Se a flag for levantada limpa todos os cards


  if (FlagclearPostsArea) {
    clearAllCards();
  } //Se foi requisitado algum termo específico atualiza o termo global, se não foi, reseta


  console.log('Termo procurado', queryTerm);

  if (queryTerm != '') {
    term = queryTerm;
  } else {
    term = '';
  }

  var endpoint = "".concat(API_BASE_URL, "/posts?limit=").concat(limitPostsPerPage, "&page=").concat(currentPage, "&term=").concat(term);
  fetch(endpoint, {
    "method": "GET",
    "headers": {
      "Content-Type": "application/json"
    }
  }).then(function (response) {
    return response.json();
  }).then(function (responseJSON) {
    console.log("Data Cards from web", responseJSON); //Se estiver vazio, finaliza a funcao poupando processamento 

    if (isEmpty(responseJSON)) {
      return;
    } //Setando a flag que indica que a requisição executada pela network recebeu a resposta


    networkDataReceived = true;

    if (responseJSON.errors) {
      throw responseJSON.errors;
    } // clearAllCards(); //Limpando todos cards existentes de anuncios antes de atualizar


    var postsTemplate = responseJSON.data.map(function (eachPost) {
      return createPostHTML(eachPost);
    }).join(''); //Pegando o ID de todas postagens vindas da requisição

    postsId = [];
    responseJSON.data.map(function (eachPost) {
      postsId.push(parseInt(eachPost.id));
    }); //Verifica se já existe uma postagem com o respectivo ID e deleta ela antes de inserir

    if (!isEmpty(postsId)) clearAllCardsByIds(postsId); //Verifica se já existe uma postagem com o respectivo ID e atualiza com os dados recebidos da rede e se não houver cria o HTML da postagem e insere na pagina

    sectionPostsArea.innerHTML += postsTemplate;
  })["catch"](function (errors) {
    console.log('ERRO', errors); // alert(`ERRO ${errors.status_code} : ${errors.msg}`);
  }); //Verifica se o navegador/janela tem o recurso de IndexedDB e Utiliza os dados do IndexedDB apenas para a primeira página(primeiros 5 itens da paginação)
  // if ('indexedDB' in window && currentPage == 1 && term == '') {

  if ('indexedDB' in window) {
    readAllData('posts').then(function (responseJSON) {
      if (responseJSON.errors) {
        throw responseJSON.errors;
      } //Se estiver vazio, finaliza a funcao poupando processamento 


      if (isEmpty(responseJSON)) {
        return;
      } //Checa se não recebeu a informação da requisição feita pela network primeiro


      if (!networkDataReceived) {
        console.log('Data Cards from indexedDB', responseJSON); // clearAllCards(); //Limpando todos cards existentes de anuncios antes de atualizar

        var postsIndexedDB = []; //!Filtragem pelo termo pesquisado

        if (term != '') {
          //Filtrando pelo termo procurado
          responseJSON = responseJSON.filter(function (post) {
            if (post.title.indexOf(term) > -1) {
              return true;
            } else {
              return false;
            }
          });
        } //!Paginacao dos dados dos Posts vindos do IndexedDB
        //Invertenndo a ordem pelo ID do posts assim como é feito no MySQl pela API


        responseJSON.sort(function (p1, p2) {
          if (parseInt(p1.id) > parseInt(p2.id)) {
            return -1;
          } else {
            return 1;
          }
        }); //Definindo as variaveis de controle para a paginacao assim como é feito pela API ao consultar o MySQl

        var limitToIndexedDB = limitPostsPerPage; // let pag = 2;

        var offset = (currentPage - 1) * limitPostsPerPage;
        limitToIndexedDB = limitPostsPerPage + offset;

        for (var i = offset; i < limitToIndexedDB; i++) {
          //Se não existir corta a execução
          if (!responseJSON[i]) return;
          postsIndexedDB.push(responseJSON[i]);
        }

        console.log('Posts from IndexedDB paginated', postsIndexedDB, term, limitPostsPerPage, currentPage);
        var postsTemplate = postsIndexedDB.map(function (eachPost) {
          return createPostHTML(eachPost);
        }).join(''); // //Verifica se já existe uma postagem com o respectivo ID e deleta ela antes de inserir 
        // postsId = [];
        // responseJSON.map( (eachPost) => {postsId.push(parseInt(eachPost.id))});
        // //Verifica se já existe uma postagem com o respectivo ID e deleta ela antes de inserir
        // if(!isEmpty(postsId))
        //   clearAllCardsByIds(postsId);

        sectionPostsArea.innerHTML += postsTemplate;
      }
    })["catch"](function (errors) {
      console.log('ERRO', errors);
    }); //!CACHE
    // caches.match(endpoint)
    //   .then( (response) => {
    //     return response.json();
    //   })
    //   .then( (responseJSON) => {
    //     console.log('From cache', responseJSON);
    //     if (responseJSON.errors) {
    //       throw responseJSON.errors;
    //     }
    //     //Checa se não recebeu a informação da requisição feita pela network primeiro
    //     if(!networkDataReceived){
    //       clearAllCards();
    //       responseJSON.data.map((eachPost) => {
    //         createPost(eachPost);
    //       })
    //     }
    //   })
    //   .catch((errors) => {
    //     console.log('ERRO', errors);
    //   })
  }
} //Armazena o id do TimeOut para puxar os posts e atualizar o DOM


var typingTimer; //Busca novas postagens pelo termo digitado no input puxando pelo titulo da postagem

function searchingPostByTerm(inputSearch) {
  //Setando o loader
  loaderConteiner.classList.add('show'); //Pegando o term digitado pelo usuario

  var searchingTerm = inputSearch.value; //Limpa o TimeOut em espera se o usuário tiver digitado mais caracateres em menos de 1 seg
  //Ou seja: tenta identificar quando o usuário para de digitar

  clearTimeout(typingTimer);
  typingTimer = setTimeout(function () {
    //Fazendo request dos posts com o termo específicado
    fillPosts(true, true, searchingTerm);
  }, 1000);
  setTimeout(function () {
    loaderConteiner.classList.remove('show');
  }, 1000);
} //Registra um escutador de mensagens vindas do [SW] para main thread no client encaminha para as respectivas actions de acordo com a mensagem


function registerServiceWorkerMessagesListener() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', function (event) {
      // console.log(event.data.msg, event.data.url);
      console.log('Mensagem recebida do [SW] para main thread', event.data.action); //Verifica se foi setada uma action

      if (event.data.action) {
        //Executando a action(funcao) dinamicamente
        window[event.data.action]();
      }
    });
  }
} //Pede permissão e registra o recurso de Periodic Background Synchronization para buscar por novos posts/anuncios a cada X segundos


function registerServiceWorkerPeriodicSync() {
  //Checando  se o navegador possui o recurso de SW
  if ('serviceWorker' in navigator) {
    //Retorna uma promise cujo resolve é o registro do SW
    navigator.serviceWorker.ready.then(function (swRegistration) {
      //Checando também se a aplicação já registrou o um Periodic Sync com label periodic-sync-posts alguma vez
      swRegistration.periodicSync.getTags() //Pegando as tags de todas Periodic Syncs Tasks
      .then(function (tagsList) {
        if (!tagsList.includes('periodic-sync-posts')) {
          //Checando se o navegador que a aplicação está rodando possui o recurso para API Periodic Sync
          if ('periodicSync' in swRegistration && !tagsList.includes('periodic-sync-posts')) {
            //Pedindo a permissão ao usuário para a aplicação utilizar o recurso de Periodic Sync
            navigator.permissions.query({
              name: 'periodic-background-sync'
            }).then(function (status) {
              //Checando se o usuário não deu permissão para implementar o Periodic Back. Sync. na aplicação
              if (status.state !== 'granted') {
                //Permissão Negada: Periodic Sync não pode ser implementado
                console.log("User didn't gave permission for Periodic Sync API");
                return;
              } //Permissão Aceita: Periodic Sync pode ser implementado


              console.log("User gave permission for Periodic Sync API"); //Tentando registrar uma Tarefa na API
              // Registrando uma tarefa sincrona para rodar a cada 10 seg 

              swRegistration.periodicSync.register('periodic-sync-posts', {
                minInterval: 5 * 1000 // 5 seconds

              }).then(function (res) {
                console.log('[SW] Periodic background sync registered!');
              })["catch"](function (error) {
                console.error("[SW] Periodic background sync failed:\n".concat(error));
              });
            });
          }
        }
      });
    });
  }
} //!Funções para o SCROLL INFINITO


function getNextPosts() {
  setTimeout(function () {
    currentPage++;
    fillPosts(false, false, term);
  }, 300);
} //Função que esconde o loader de scroll inifito 


function removeLoader() {
  setTimeout(function () {
    loaderConteiner.classList.remove('show');
    getNextPosts();
  }, 1000);
} //Função que mostra o loader de scroll inifito


function showLoader() {
  loaderConteiner.classList.add('show');
  removeLoader();
} //Função que lança um aviso de erro


function errorNotification() {
  //Alerta de erro
  Swal.fire({
    icon: 'error',
    title: 'ERRO:',
    text: 'Ocorreu um erro no envio do seu anúncio para o nosso servidor. Por favor, tente mais tarde.'
  });
} //Adicionando o escutador para checar se o scroll chegou no final para carregar mais postagens e fazer o scroll infinito


window.addEventListener('scroll', function () {
  //Extraindo as propriedades que desejamos
  //* scrollTop: Representa em pixels distância do topo do documento e o topo visível do documento
  //* scrollHeight: Representa o tamanho total da altura em pixels deste documento incluindo as partes não visíveis desse documento
  //* clientHeight: Rrepresenta em pixels a distância entre o topo visível e o final da parte visível da página
  var _document$documentEle = document.documentElement,
      clientHeight = _document$documentEle.clientHeight,
      scrollHeight = _document$documentEle.scrollHeight,
      scrollTop = _document$documentEle.scrollTop; //Flag que indica se o usuário chegou perto, à 10px do fim da página

  var isPageBottomAlmostReached = scrollTop + clientHeight >= scrollHeight - 10; //Calculando quão próximo do fim da página o usuário esta para carregar os novos anúncios e verificando a FLAG de habilitacao

  if (isPageBottomAlmostReached) {
    showLoader();
  }
}); //Preenchendo a area de posts com todos os posts

fillPosts(); //Chamando a funcao que implanta um escutador das mensagens vindas do [SW] para o client na main thread

registerServiceWorkerMessagesListener(); //Chamando a funcao que pede permissão ao usuário para implantar o Periodic Sync através de [SW] se o navegador possuir o recurso

registerServiceWorkerPeriodicSync(); //Quando toda a página carregar, executa esse bloco

(function () {})();