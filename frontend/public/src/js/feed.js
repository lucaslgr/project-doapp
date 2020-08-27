//Picture capturada pelo Canvas
let pictureCaptured;

//GeoLocation capturada
let locationCaptured = { latitude: 0, longitude: 0 };

//Armazena a pagina atual da paginacao
let currentPage = 1;
//Const que armazena o limite de posts exibidos por pagina
const limitPostsPerPage = 5;

//Armazena o termo pesquisado pelo usuário para encontrar posts pelo título, por default é ''
let term = '';

//Pegando a referência para os elementos a serem manipulados
const videoPlayer = $('.modal.modal-add-post #video-player');
const canvasImgCapture = $('.modal.modal-add-post #canvas-img-capture');
const boxCameraControls = $('.modal.modal-add-post .camera-controls');
const selectOptionsCamera = $('.modal.modal-add-post #camera-options');
const btnImgCapture = $('.modal.modal-add-post #btn-img-capture');
const imgPickerBox = $('.modal.modal-add-post .image-picker-box');
const imgPickerInput = $('.modal.modal-add-post #image-picker');
const imgPickerInputLabel = $('.modal.modal-add-post label[for=image-picker]');
const btnGeoLocation = $('.modal.modal-add-post #btn-location');
const locationLoader = $('.modal.modal-add-post .spinner.spinner-location');
const loaderConteiner = $('.loader'); //Loader apresentado no scroll inifito
const sectionPostsArea = $('section#posts .section-area'); //Area onde ficam as postagens

//Checa os recursos necessários e configura a aplicação para utilizar as funcionalidades de camera 
function initializeMedia() {
  //Checando se no navegador temos o recurso de acesso a media devices do dispositivo [Até o momento, apenas o Chrome tem]
  if (!('mediaDevices' in navigator)) { //Se não tiver, criamos nosso própria recurso de mediaDevices no navegador
    navigator.mediaDevices = {};
  }

  //Checando se o recurso mediaDevices não possui já definido o método getUserMedia [Só entra nesse IF se entrar no primeiro IF também]
  if (!('getUserMedia' in navigator.mediaDevices)) {

    //Implementando a nossa própria solução, pegando os métodos antigos de acesso a câmera respectivos de cada navegador e implementamos manualmente no mediaDevices.getUserMedia
    navigator.mediaDevices.getUserMedia = (constraints) => {
      /**
       * navigator.webkitGetUserMedia => Safari
       * navigator.mozGetUserMedia => Mozila
       */
      let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      //Entra aqui se o navegador não for o Mozila ou o Safari e também não tiver a API mediaDevices definidas
      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented!'));
      }

      //!OBS: A Sintaxe nativa do método getUserMedia sempre retorna uma Promise, logo, devemos retornar uma Promise para caso de sucesso e de falha também para não quebrar a sintaxe
      return new Promise((resolve, reject) => {
        //Setando como o método getUserMedia deverá ser chamado
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    }
  }

  //Definindo o JSON das videoConstraints para configurar o acesso a API de mediaDevices para câmera traseira se houver
  const videoConstraints = {
    facingMode : 'environment'
  };

  //Acionando o método que vai pedir ao usuário permissão para acessar o video(câmera) e se ele permitir vai fazer a conexão
  // navigator.mediaDevices.getUserMedia({video: true, audio: true});
  navigator.mediaDevices
    .getUserMedia({ video: videoConstraints , audio: false})
    //Se o usuário deu permissão para acessar a câmera
    .then(stream => {
      //Enviando o fluxo de video para o a tag <video> definida na página
      videoPlayer.srcObject = stream;
      videoPlayer.style.display = 'block'; //Monstrando a tag <video>
      boxCameraControls.style.display = 'flex'; //Monstrando os controles de Câmera (Inclui o botão de captura e o botão para trocar de câmera)
    
      //Pegando todos dispositivos de Media disponíveis(Câmera) e populando o select com eles no método gotDevices
      return navigator.mediaDevices.enumerateDevices();
    })
    .then(gotDevices)
    //Se o usuário não deu permissão OU se foi lançado a Promise com ERROR para o caso em que o navegador não possui a API mediaDevices e nem foi possível implementar manualmente nas condições acima
    .catch(error => {
      //Se por algum motivo não foi possível utilizar a câmera, mostramos ao usuário a possibilidade de enviar um arquivo de imagem
      imgPickerBox.style.display = 'flex';
      console.log('[MediaDevices] Couldn\'t possible access video devices', error);
    });
}

//Pega todos os dispositivos de Media disponíveis no dispositivo
function gotDevices(mediaDevices) {
  selectOptionsCamera.innerHTML = '<option>Selecione a Câmera</option>';
  // selectOptionsCamera.appendChild(document.createElement('option'));
  let count = 1;
  mediaDevices.forEach(mediaDevice => {
    if (mediaDevice.kind === 'videoinput') {
      const option = document.createElement('option');
      option.value = mediaDevice.deviceId;
      const label = mediaDevice.label || `Camera ${count++}`;
      const textNode = document.createTextNode(label);
      option.appendChild(textNode);
      selectOptionsCamera.appendChild(option);
    }
  });
}

//Muda o dispositivo que está enviando o fluxo de video para tag <video> de acordo com o video da <option> selecionada no <select>
function changeCurrentStream(selectElement){

  //Para o streamming de video atual se houver 
  if(typeof videoPlayer.srcObject !== 'undefined'){
    stopVideoTracks(videoPlayer.srcObject);
  }

  //Declarando o JSON das videoConstraints para configurar o acesso a API de mediaDevices para uma câmera específica
  const videoConstraints = {};

  //Checa se no select foi escolhido uma opção de valor VAZIO
  if(selectElement.value === ''){
    //Se foi escolhida uma opção vazia, setamos a padrão que é a câmera traseira no caso de um Mobile
    videoConstraints.facingMode = 'environment'; 
  } else {
    videoConstraints.deviceId = { exact: selectElement.value };
  }

  //Acionando o método que vai pedir ao usuário permissão para acessar o video(câmera) e se ele permitir vai fazer a conexão
  // navigator.mediaDevices.getUserMedia({video: true, audio: true});
  navigator.mediaDevices
    .getUserMedia({ video: videoConstraints , audio: false})
    //Se o usuário deu permissão para acessar a câmera
    .then(stream => {
      //Enviando o fluxo de video para o a tag <video> definida na página
      videoPlayer.srcObject = stream;
    })
    //Se o usuário não deu permissão OU se foi lançado a Promise com ERROR para o caso em que o navegador não possui a API mediaDevices e nem foi possível implementar manualmente nas condições acima
    .catch(error => {
      //Se por algum motivo não foi possível utilizar a câmera, mostramos ao usuário a possibilidade de enviar um arquivo de imagem
      imgPickerBox.style.display = 'flex';
      console.log('[MediaDevices] Couldn\'t possible access video devices', error);
    });
}

//Para o streaming de video passado no parâmetro
function stopVideoTracks(stream) {
  //Parando o streaming de video vindo da tag <video>
  stream.getVideoTracks().forEach(eachTrack => {
    eachTrack.stop(); //Parando cada faixa de video
  });
}

//Captura uma imagem da tag video e coloca ela na tag canvas
function captureImageFromStream2Canvas(buttonCapture) {

  //Monstrando o Canvas que vai conter a imagem capturada
  canvasImgCapture.style.display = 'block';
  //Escondendo o Streaming de video (tag <video>)
  videoPlayer.style.display = 'none';
  // buttonCapture.style.display = 'none';
  buttonCapture.setAttribute('disabled', true); //Desabilitando o botão de captura
  buttonCapture.style.cursor = 'not-allowed'; //Mudando o cursor para not-allowed

  let canvasContext = canvasImgCapture.getContext('2d'); //Setando que o conteúdo do canvas terá 2 dimensões
  //Inserindo a imagem do stream de video no conteúdo do Canvas

  //!Redimensionando a imagem vinda do video no Canvas
  let widthOrigin = videoPlayer.videoWidth;
  let heightOrigin = videoPlayer.videoHeight;
  let heightCanvas = canvasImgCapture.height;
  let widthCanvas = canvasImgCapture.width;
  if(widthOrigin > heightOrigin){
    heightCanvas = (canvasImgCapture.width/widthOrigin) * heightOrigin;
  } else if(widthOrigin < heightOrigin){
    widthCanvas = (canvasImgCapture.height/heightOrigin) * widthOrigin;
  }

  canvasImgCapture.setAttribute('width', widthCanvas);
  canvasImgCapture.setAttribute('height', heightCanvas);

  canvasContext.drawImage(
    videoPlayer, //Fonte da imagem
    0, //Posição em X que ela ocupara no canvas
    0, //Posição em Y que ela ocupara no canvas
    widthCanvas, //Largura do destino 
    heightCanvas //Altura do destino
  );

  //Parando o streaming de video vindo da tag <video>
  stopVideoTracks(videoPlayer.srcObject);

  //Pegando a imagem capturada no canvas, passando a url para dataURItoBlob e pegando um arquivo de imagem no retorno
  pictureCaptured = dataURItoBlob(canvasImgCapture.toDataURL());
}

//Captura a imagem upada na tag input[type=file] que é apresentada como opção quando o usuário não permite o aceso a câmera ou quando o navegador do usuário não fornece esse recurso
function captureImageFromInputFile(inputFile) {
  pictureCaptured = inputFile.files[0]; //Pegando apenas o primeiro arquivo
  imgPickerInputLabel.innerText = 'Uma imagem foi enviada!';
}

//Checa os recursos necessários e configura a aplicação para utilizar as funcionalidades de geo localização
function initializeGeoLocation() {
  //Checando se NÃO tem o recurso de geolocalização no navegador
  if (!('geolocation' in navigator)) {
    btnGeoLocation.style.display = 'none';
  }
}

//Captura a geoLocalizacao quando clica no botão de captura
function captureGeoLocation() {
  //Verificando se existe o recurso
  if (!('geolocation' in navigator)) {
    return;
  }

  //Bloqueando o click do botão após clicar uma vez
  btnGeoLocation.setAttribute('disabled', true);
  btnGeoLocation.style.cursor = 'not-allowed';

  //Flag levantada quando o alert é mostrado uma vez
  let flagAlert = true;

  //Monstrando o Loading 
  locationLoader.style.display = 'inline-block';

  //Pegando a posição atual
  //!OBS: Antes de tentar pegar a posição do usuário o método getCurrentPosition pede permissão ao usuário para tentar acessar a API de geolocalização do navegador
  navigator.geolocation.getCurrentPosition(
    //1º Parametro: Callback com a localizacao
    (position) => {
      //Se conseguir pegar a localização, tiramos o loading e bloqueamos o botão
      //Bloqueando o click do botão após clicar uma vez
      btnGeoLocation.setAttribute('disabled', true);
      btnGeoLocation.style.cursor = 'not-allowed';
      setTimeout(() => {
        locationLoader.style.display = 'none';
      }, 500);

      //Pegando a localizacao
      locationCaptured.latitude = position.coords.latitude;
      locationCaptured.longitude = position.coords.longitude;

      console.log('Condinates got by GeoLocation API', position.coords);

      //*Utilizando a API do MAPBOX para pegar o endereço do usuário
      const MAPBOX_APIKEY = 'pk.eyJ1IjoibHVjYXNsZ3IiLCJhIjoiY2tkYzJrcmVpMTBwMzJ0cGdjYnNnZHc4MSJ9.rpysMhdt4d9iJsKT2boujw';
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${locationCaptured.longitude},${locationCaptured.latitude}.json?types=address&access_token=${MAPBOX_APIKEY}`
      )
        .then(response => {
          if (response.ok) {
            return response.json();
          }
        })
        .then(responseJSON => {
          console.log('Fetched adress from MAPBOX API reverse geolocation', responseJSON);
          $('textarea[name=location]').value = responseJSON.features[0].place_name;
          $('textarea[name=location]').focus();
          console.log('Response from MAPBOX API', responseJSON);
        })
        .catch(error => {
          console.log('Request to MAPBOX API failed', error);
        });
    },
    //2º Parâmetro: Callback com o erro
    (error) => {
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
    },
    //3º Parâmetro: JSON com options que setam caracteristicas na utilizacao da API
    {
      timeout: 7000 //Setando o tempo limite a API conseguir a localizacao na resposta da requisicao
    }
  );
}

//Mostra o modal que adiciona uma nova postagem
function showModalAddPost() {
  //Inicializando a API de câmera
  initializeMedia();
  //Inicializando a API de geolocalização
  initializeGeoLocation();

  $('.modal.modal-add-post').classList.toggle('show-modal-add-post');
  $('section#posts').classList.toggle('display-none');
}

//Fecha o modal que adiciona uma nova postagem
function closeModalAddPost() {
  //Parando o streaming de video vindo da tag <video> se ela tiver com algum streaming(fluxo de video)
  if (videoPlayer.srcObject) {
    console.log('Stopping the Streamimg...');
    stopVideoTracks(videoPlayer.srcObject);
  }

  //Setando um tempo para que a animation ocorra
  setTimeout(() => {
    $('.modal.modal-add-post').classList.remove('show-modal-add-post');
    $('section#posts').classList.remove('display-none');
  }, 10);

  //Tirando os elementos que mostram o streaming de video vindo da câmera e a area do image picker quando fecha o modal
  videoPlayer.style.display = 'none';
  imgPickerBox.style.display = 'none';
  canvasImgCapture.style.display = 'none';

  //==========================================<LIMPANDO O CONTEÚDO DO CANVAS>===============================================//
  //Limpando o conteúdo capturado no canvas(SE HOUVER) sem resetá-lo
  let contextCanvas = canvasImgCapture.getContext('2d');
  // Store the current transformation matrix
  contextCanvas.save();

  // Use the identity matrix while clearing the canvas
  contextCanvas.setTransform(1, 0, 0, 1, 0, 0);
  contextCanvas.clearRect(0, 0, canvasImgCapture.width, canvasImgCapture.height);

  // Restore the transform
  contextCanvas.restore();
  //========================================================================================================================//

  //Limpando a imagem salva
  pictureCaptured = null;

  //Reabilitando o botão de captura caso esteja desabilitado
  btnImgCapture.removeAttribute('disabled');
  btnImgCapture.style.cursor = 'pointer';

  //Reabilitando o botão de captura de localização
  //Reabilitando o botão de captura caso esteja desabilitado
  btnGeoLocation.removeAttribute('disabled');
  btnGeoLocation.style.cursor = 'pointer';

  //Limpando o input[type=file]
  imgPickerInput.value = '';
  //Alterando o texto do Label
  imgPickerInputLabel.innerText = 'Selecione uma imagem!';

  //Monstrando os controles para pegar a geolocalização
  btnGeoLocation.style.display = 'block';
  locationLoader.style.display = 'none';
}

//Limpa os inputs do modal
function clearModalAddPostInputs() {
  $('input[name=title]').value = '';
  $('textarea[name=location]').value = '';
  $('input[name=whatsapp-contact]').value = '';
  return;
}

//Extrai e envia os dados do Post para a API
function sendModalPost() {
  const endpoint = API_BASE_URL+'/posts/new';

  let idPost = new Date().toISOString(); //Setando um ID temporário para os posts a serem armazenados no IndexedDB
  let title = $('input[name=title]').value;
  let location = $('textarea[name=location]').value;
  let whatsappContact = $('input[name=whatsapp-contact]').value;

  //Verifica se ficou algum campo vazio
  if(idPost == '' || idPost == null ||
    title == '' || title == null ||
    location == '' || location == null ||
    whatsappContact=='' || whatsappContact == null ||
    pictureCaptured =='' || pictureCaptured == null) {
    Swal.fire({
      icon: 'error',
      title: 'ERRO:',
      text: 'Todas informações precisam ser preenchidas para finalizar seu anúncio.'
    });
    return;//Cancela a operação de enviar o anuncio
  }

  //Verifica se o whatsapp está válido
  if(whatsappContact.length < 14 ){
    $('input[name=whatsapp-contact]').focus();

    Swal.fire({
      icon: 'error',
      title: 'ERRO:',
      text: 'Número de whatsapp inválido.'
    });
    return;//Cancela a operação de enviar o anuncio
  }

  //Pegando os dados do Post e transformando no formato FormData para podermos enviar a imagem
  let postFormData = new FormData();
  postFormData.append('id', idPost);
  postFormData.append('title', title);
  postFormData.append('longitude', locationCaptured.longitude);
  postFormData.append('latitude', locationCaptured.latitude);
  postFormData.append('location', location);
  postFormData.append('whatsapp_contact', whatsappContact);
  //Enviando a imagem e renomeando-a pois no servidor não podemos ter imagens com nmomes iguais
  postFormData.append('image', pictureCaptured, `${idPost}.png`);

  //*Verificando se no navegador existe os recursos de [serviceWorker] e [SyncManager](BackgroundSyncronization)
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    //*Quando o [SW] estiver registrado, instalado e ativado ele retorna uma promise no .ready
    navigator.serviceWorker.ready
      .then(sw => {
        //Montando JSON das info do post a ser gravado no indexedDB para background synchronization
        let requestData = {
          id: idPost,
          title: title,
          location: location,
          longitude: locationCaptured.longitude,
          latitude: locationCaptured.latitude,
          image: pictureCaptured,
          whatsapp_contact: whatsappContact
        };

        //Salvando as informações da requisição no IndexedDB para serem sincronizadas no [SW]
        writeData('sync-posts', requestData)
          .then(() => {
            //*Acessando o Sync Manager do [SW] e registrando uma async task com o nome passado no parâmetro
            sw.sync.register('sync-new-post');
          })
          .then(() => {
            //Alerta de sucesso
            Swal.fire({
              icon: 'success',
              title: 'Anúncio inserido com sucesso!',
              showConfirmButton: false,
              timer: 1500
            })

            // fillPosts(); //! fillPosts() é engatilhado pelo SW quando ele executa a sync task('sync-new-post') registrada e retorna uma mensagem para main thred no client
            clearModalAddPostInputs();
            closeModalAddPost();
          })
          .catch((errors) => {
            console.log('ERRO', errors);
            // alert(`ERRO na sincronização de anúncios : ${errors.msg}`);

            //Alerta de erro
            Swal.fire({
              icon: 'error',
              title: 'ERRO:',
              text: 'Ocorreu um erro na sincronização dos anúncios.'
            });

            closeModalAddPost();
          })
      });
  }
  //* Se o navegador não tiver recursos de [SW] e [SyncManager]
  else {
    fetch(endpoint, {
      "method": "POST",
      "headers": {
        // 'Content-Type': 'application/json'
        "Authorization": `${window.localStorage.getItem('jwt')}`
      },
      "body": postFormData
    })
      .then((response) => {
        return response.json();
      })
      .then((responseJSON) => {
        if (responseJSON.errors) {
          throw responseJSON.errors;
          return;
        } else {
          //Alerta de sucesso
          Swal.fire({
            icon: 'success',
            title: 'Anúncio inserido com sucesso!',
            showConfirmButton: false,
            timer: 1500
          });

          console.log('inserting a new post such id is: ' + responseJSON.data.id_post);
        }
        
        fillPosts();
        clearModalAddPostInputs();
        closeModalAddPost();
      })
      .catch((errors) => {
        console.log('ERRO', errors);
        // alert(`ERRO ${errors.status_code} : ${errors.msg}`);
        //Alerta de erro
        Swal.fire({
          icon: 'error',
          title: 'ERRO:',
          text: 'Ocorreu um erro na sincronização dos anúncios.'
        });

        closeModalAddPost();
      })
  }
}

//Cria uma nova postagem de anuncio utilizando appendChild
function createPost(dataPost) {
  
  //Montando os elementos HTML que constituem o DOM
  let postWrapper = document.createElement('div');
  postWrapper.setAttribute('data-id', dataPost.id);
  postWrapper.className = 'each-post';

  let postImg = document.createElement('img');

  //Verificando se está vazia a URI de imagem que veio do BD
  if (dataPost.image === '')
    dataPost.image = './src/images/products/product-default.png';

  postImg.setAttribute('src', dataPost.image); //!VALOR da url da imagem
  postImg.setAttribute('alt', 'imagem do produto');

  let postTitle = document.createElement('h1');
  postTitle.className = 'title';
  postTitle.innerText = dataPost.title; //!VALOR do título

  //!TABELA COM AS INFORMAÇÕES
  let table = document.createElement('table');

  //! MONTANDO A LINHA DA LOCATION NA TABELA
  let trLocation = document.createElement('tr');
  
  let tdLocationHeader = document.createElement('td')
  tdLocationHeader.classList.add('tdheader');                          
  tdLocationHeader.innerText = 'Localização:';
                            
  let tdLocationValue = document.createElement('td');

  let aLocationValue = document.createElement('a');
  aLocationValue.classList.add('links-info');
  aLocationValue.classList.add('link-location');
  aLocationValue.setAttribute('target', '_blank');

  //Pegando latitude e longitude
  const longitude = filterCoordinate(dataPost.longitude);
  const latitude = filterCoordinate(dataPost.latitude);
  if(longitude && latitude){ //Só seta o href se a latitude e longitude tiverem vierem do BD
    aLocationValue.setAttribute('href', `https://www.google.com/maps/place/${latitude},${longitude}`);
  }

  let pLocationValue = document.createElement('p');
  pLocationValue.innerText = dataPost.location;
  
  let iconLocationValue = document.createElement('i');
  iconLocationValue.classList.add('icon-location');
  //Montando a tag <a>
  aLocationValue.appendChild(pLocationValue);
  aLocationValue.appendChild(iconLocationValue);

  //Montando o <td> value da Location
  tdLocationValue.appendChild(aLocationValue);

  //Montando o <tr> da location
  trLocation.appendChild(tdLocationHeader);
  trLocation.appendChild(tdLocationValue);

  //Inserindo o <tr> da location na table
  table.appendChild(trLocation);
  //![FIM] MONTANDO A LINHA DA LOCATION NA TABELA

  //! MONTANDO A LINHA COM INFORMAÇÕES DO WHATSAPP NA TABELA
  let trWhatsapp = document.createElement('tr');
  
  let tdWhatsappHeader = document.createElement('td');
  tdWhatsappHeader.classList.add('tdheader');
  tdWhatsappHeader.innerText = 'Whatsapp:';

  let tdWhatsappValue = document.createElement('td');
  
  let aWhatsappValue = document.createElement('a');
  aWhatsappValue.classList.add('links-info');
  aWhatsappValue.classList.add('link-whats');
  aWhatsappValue.setAttribute('target', '_blank');

  //Tirando tudo que não seja número
  const whatsappNumber = dataPost.whatsapp_contact.replace(/\D/g,"");
  aWhatsappValue.setAttribute('href', `https://api.whatsapp.com/send?phone=55${whatsappNumber}&text=Ol%C3%A1%2C%20vim%20pelo%20DoApp%20e%20fiquei%20interessado%20na%20sua%20doa%C3%A7%C3%A3o..`);
  aWhatsappValue.setAttribute('rel', 'noreferrer');
  
  let pWhatsappValue = document.createElement('p');
  pWhatsappValue.innerText = dataPost.whatsapp_contact;
  
  let iconWhatsappValue = document.createElement('i');
  iconWhatsappValue.classList.add('icon-whatsapp');
  //Montando a tag <a>
  aWhatsappValue.appendChild(pWhatsappValue);
  aWhatsappValue.appendChild(iconWhatsappValue);

  //Montando o <td> value da Whatsapp
  tdWhatsappValue.appendChild(aWhatsappValue);

  //Montando o <tr> da Whatsapp
  trWhatsapp.appendChild(tdWhatsappHeader);
  trWhatsapp.appendChild(tdWhatsappValue);

  //Inserindo o <tr> da location na table
  table.appendChild(trWhatsapp);
  //![FIM] MONTANDO A LINHA COM INFORMAÇÕES DO WHATSAPP NA TABELA

  //! MONTANDO A LINHA COM INFORMAÇÕES DA DATA DE POSTAGEM NA TABELA
  let trDateCreated = document.createElement('tr');
  
  let tdDateCreatedHeader = document.createElement('td');
  tdDateCreatedHeader.classList.add('tdheader')
  tdDateCreatedHeader.innerText = 'Data:';

  let tdDateCreatedValue = document.createElement('td');
  tdDateCreatedValue.classList.add('date-value');
  
  let pDateCreatedValue = document.createElement('p');
  pDateCreatedValue.innerText = dataPost.date_created;

  let iconDateValue = document.createElement('i');
  iconDateValue.classList.add('icon-calendar');

  //Adicionando o <p> e o <i> dentro do <td>
  tdDateCreatedValue.appendChild(pDateCreatedValue);
  tdDateCreatedValue.appendChild(iconDateValue);

  //Montando o <tr> da DateCreated
  trDateCreated.appendChild(tdDateCreatedHeader);
  trDateCreated.appendChild(tdDateCreatedValue);

  //Inserindo o <tr> da location na table
  table.appendChild(trDateCreated);
  //![FIM] MONTANDO A LINHA COM INFORMAÇÕES DA DATA DE POSTAGEM NA TABELA

  //Adicionando todos os elementos no PostWrapper
  postWrapper.appendChild(postImg);
  postWrapper.appendChild(postTitle);
  postWrapper.appendChild(table);

  //Adicionando a nova postagem na area de postagens
  sectionPostsArea.appendChild(postWrapper);
}

//Cria o HTML de uma nova postagem e retorna como string
function createPostHTML(dataPost) {
  console.log('Inserting HTMLPosts on post area', dataPost);

  //Extraindo todos os dados do JSON com as informações do post
  let {id, title, image, longitude, latitude, location, whatsapp_contact, date_created} = dataPost;

  //Verificando se sao coordenadas validas
  longitude = filterCoordinate(longitude);
  latitude = filterCoordinate(latitude);  

  //Tirando todos os caracteres especiais do numero de whatsapp
  let whatsappOnlyNumber = whatsapp_contact.replace(/\D/g,"");

  const URL_API_GOOGLEMAPS = `https://www.google.com/maps/place/${latitude},${longitude}`;
  const URL_API_WHATSAPP = `https://api.whatsapp.com/send?phone=55${whatsappOnlyNumber}&text=Ol%C3%A1%2C%20vim%20pelo%20DoApp%20e%20fiquei%20interessado%20na%20sua%20doa%C3%A7%C3%A3o..`;

  return (
  `<div class="each-post" data-id="${id}">
    <img src="${image}" alt="imagem do objeto">
      <h1 class="title">${title}</h1>
      <table>
        <tr>
          <td class="tdheader">Localização:</td>
          <td>
            <a target="_blank" class="links-info link-location" rel="noreferrer" ${(longitude && latitude)?`href="${URL_API_GOOGLEMAPS}"`:''}>
              <p>${location}</p>
              <i class="icon-location"></i>
            </a>
          </td>
        </tr>
        <tr>
          <td class="tdheader">Whatsapp:</td>
          <td>
            <a target="_blank" class="links-info link-whats" rel="noreferrer" href="${URL_API_WHATSAPP}">
              <p>${whatsapp_contact}</p>
              <i class="icon-whatsapp"></i>
            </a>
          </td>
        </tr>
        <tr>
          <td class="tdheader">Data:</td>
          <td class="date-value">
            <p>${date_created}</p>
            <i class="icon-calendar"></i>
          </td>
        </tr>
      </table>
  </div>`);
}

//Limpa todos os cards de posts/anuncios
function clearAllCards() {
  console.log('Cleaning all cards on posts area');
  // $$('section#posts .section-area .each-post').forEach(each => each.remove());
  sectionPostsArea.innerHTML = '';
}

//Limpa todos os cards de posts/anuncios com os respectivos Id especificados no arrayIds recebido no parâmetro
function clearAllCardsByIds(arrayIds) {
  console.log('Cleaning all cards by id', arrayIds);
  $$('section#posts .section-area .each-post').forEach( eachPost =>{
    if(arrayIds.includes(parseInt(eachPost.getAttribute('data-id')))){
      eachPost.remove();
      console.log('Removin duplicate post with id = ', eachPost.getAttribute('data-id'));
    }
  });
}

//Puxando da API todos posts do banco e inserindo na tela
//Parâmetro FlagclearPostsArea => se for true ele limpa todos os posts e insere os novos, se for false mantém os atuais e adiciona os novos
function fillPosts(resetPage = true, FlagclearPostsArea = true, queryTerm = '') {
  // ! ESTRATÉGIA : CACHE THEN NETWORK
  //flag que é levantada quando a resposta da requisição a rede é obtida
  let networkDataReceived = false;

  //Se foi requisitado para primeira pagina setamos currentPage = 1
  if(resetPage){
    currentPage = 1;
  }

  //Se foi requisitado algum termo específico atualiza o termo global, se não foi, reseta
  console.log('Term search', queryTerm);
  if(queryTerm != ''){
    term = queryTerm;
  } else {
    term = '';
  }

  const endpoint = `${API_BASE_URL}/posts?limit=${limitPostsPerPage}&page=${currentPage}&term=${term}`;

  //*Buscando os posts pela rede
  fetch(endpoint, {
    "method": "GET",
    "headers": {
      "Content-Type": "application/json"
    }
  })
    .then((response) => {
      return response.json();
    })
    .then((responseJSON) => {
      //Se estiver vazio, finaliza a funcao poupando processamento 
      if(isEmpty(responseJSON)){
        return;
      }

      //Setando a flag que indica que a requisição executada pela network recebeu a resposta
      networkDataReceived = true;

      if (responseJSON.errors) {
        throw responseJSON.errors;
      }

      console.log(`Data Cards from web`, responseJSON);

      // clearAllCards(); //Limpando todos cards existentes de anuncios antes de atualizar
      let postsTemplate = responseJSON.data.map((eachPost) => {
        return createPostHTML(eachPost);
      }).join('');

      
      //Pegando o ID de todas postagens vindas da requisição
      postsId = [];
      responseJSON.data.map( (eachPost) => {postsId.push(parseInt(eachPost.id))});

      //Verifica se já existe uma postagem com o respectivo ID e deleta ela antes de inserir
      if(!isEmpty(postsId))
        clearAllCardsByIds(postsId);


      //Se a flag for levantada limpa todos os cards
      if(FlagclearPostsArea){
        sectionPostsArea.innerHTML = postsTemplate;
      }
      else {
        //Verifica se já existe uma postagem com o respectivo ID e atualiza com os dados recebidos da rede e se não houver cria o HTML da postagem e insere na pagina
        sectionPostsArea.innerHTML += postsTemplate;
      }
      
    })
    .catch((errors) => {
      console.log('ERRO', errors);
  })

  //*Verifica se o navegador/janela tem o recurso de IndexedDB e Utiliza os dados do IndexedDB apenas para a primeira página(primeiros 5 itens da paginação)
  // if ('indexedDB' in window && currentPage == 1 && term == '') {
  if ('indexedDB' in window) {
    readAllData('posts')
      .then(responseJSON => {
        //Verificando se houver algum error para ser lançado ao catch
        if (responseJSON.errors) {
          throw responseJSON.errors;
        }

       //Se estiver vazio, finaliza a funcao poupando processamento 
        if(isEmpty(responseJSON)){
          return;
        }

        //Checa se não recebeu a informação da requisição feita pela network primeiro
        if (!networkDataReceived) {
          console.log('Data Cards from indexedDB', responseJSON);
          // clearAllCards(); //Limpando todos cards existentes de anuncios antes de atualizar

          let postsIndexedDB = [];

          //!Filtragem pelo termo pesquisado
          if(term != ''){
            //Filtrando pelo termo procurado
            responseJSON = responseJSON.filter((post) => {
              if(post.title.indexOf(term) > -1){
                return true;
              } else {
                return false;
              }
            }); 
          }

          //!Ordenacao dos dados dos Posts vindos do IndexedDB
          //Invertenndo a ordem pelo ID do posts assim como é feito no MySQl pela API
          responseJSON.sort((p1, p2) => {
            if(parseInt(p1.id) > parseInt(p2.id)){
                return -1;
            } else {
                return 1;
            }
          }); 

          //Definindo as variaveis de controle para a paginacao assim como é feito pela API ao consultar o MySQl
          let limitToIndexedDB = limitPostsPerPage;
          // let pag = 2;
          let offset = (currentPage - 1) * limitPostsPerPage;
          limitToIndexedDB = limitPostsPerPage + offset;

          for (let i = offset; i < limitToIndexedDB; i++) {
            //Se não existir corta a execução
            if(responseJSON[i])
              postsIndexedDB.push(responseJSON[i]);
          }
          console.log('Posts from IndexedDB paginated', postsIndexedDB, term, limitPostsPerPage, currentPage);

          let postsTemplate = postsIndexedDB.map((eachPost) => {
            return createPostHTML(eachPost);
          }).join('');
          
          // //Verifica se já existe uma postagem com o respectivo ID e deleta ela antes de inserir 
          // postsId = [];
          // responseJSON.map( (eachPost) => {postsId.push(parseInt(eachPost.id))});
          
          // //Verifica se já existe uma postagem com o respectivo ID e deleta ela antes de inserir
          // if(!isEmpty(postsId))
          //   clearAllCardsByIds(postsId);
          // sectionPostsArea.innerHTML += postsTemplate;  
          //Se a flag for levantada limpa todos os cards
          if(FlagclearPostsArea){
            sectionPostsArea.innerHTML = postsTemplate;  
          } else {
            sectionPostsArea.innerHTML += postsTemplate;  
          }
        }
      })
      .catch((errors) => {
        console.log('ERRO', errors);
      })

    //!CACHE
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

}

//Armazena o id do TimeOut para puxar os posts e atualizar o DOM
let typingTimer;

//Busca novas postagens pelo termo digitado no input puxando pelo titulo da postagem
function searchingPostByTerm(inputSearch){
  //Setando o loader
  loaderConteiner.classList.add('show');

  //Pegando o term digitado pelo usuario
  let searchingTerm = inputSearch.value;

  //Limpa o TimeOut em espera se o usuário tiver digitado mais caracateres em menos de 1 seg
  //Ou seja: tenta identificar quando o usuário para de digitar
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    //Fazendo request dos posts com o termo específicado
    fillPosts(true,true,searchingTerm);
  }, 1000);

  setTimeout(() => {
    loaderConteiner.classList.remove('show');
  }, 1000);
}

//Registra um escutador de mensagens vindas do [SW] para main thread no client encaminha para as respectivas actions de acordo com a mensagem
function registerServiceWorkerMessagesListener() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', event => {
      // console.log(event.data.msg, event.data.url);
      console.log('Mensagem recebida do [SW] para main thread', event.data.action);

      //Verifica se foi setada uma action
      if (event.data.action) {
        //Executando a action(funcao) dinamicamente
        window[event.data.action]();
      }
    });
  }
}

//Pede permissão e registra o recurso de Periodic Background Synchronization para buscar por novos posts/anuncios a cada X segundos
function registerServiceWorkerPeriodicSync() {

  //Checando  se o navegador possui o recurso de SW
  if ('serviceWorker' in navigator) {

    //Retorna uma promise cujo resolve é o registro do SW
    navigator.serviceWorker.ready
      .then(swRegistration => {

        //Checando também se a aplicação já registrou o um Periodic Sync com label periodic-sync-posts alguma vez
        swRegistration.periodicSync.getTags()
          //Pegando as tags de todas Periodic Syncs Tasks
          .then(tagsList => {
            if (!tagsList.includes('periodic-sync-posts')) {

              //Checando se o navegador que a aplicação está rodando possui o recurso para API Periodic Sync
              if ('periodicSync' in swRegistration && !tagsList.includes('periodic-sync-posts')) {

                //Pedindo a permissão ao usuário para a aplicação utilizar o recurso de Periodic Sync
                navigator.permissions.query({
                  name: 'periodic-background-sync',
                })
                  .then(status => {
                    //Checando se o usuário não deu permissão para implementar o Periodic Back. Sync. na aplicação
                    if (status.state !== 'granted') {
                      //Permissão Negada: Periodic Sync não pode ser implementado
                      console.log("User didn't gave permission for Periodic Sync API");
                      return;
                    }

                    //Permissão Aceita: Periodic Sync pode ser implementado
                    console.log("User gave permission for Periodic Sync API");

                    //Tentando registrar uma Tarefa na API
                    // Registrando uma tarefa sincrona para rodar a cada 10 seg 
                    swRegistration.periodicSync.register('periodic-sync-posts', {
                      minInterval: 5 * 1000, // 5 seconds
                    })
                      .then(res => {
                        console.log('[SW] Periodic background sync registered!');
                      })
                      .catch(error => {
                        console.error(`[SW] Periodic background sync failed:\n${error}`);
                      });
                  })
              }
            }
          });
      });
  }
}

//!Funções para o SCROLL INFINITO
function getNextPosts(){
  setTimeout(() => {
    currentPage++;
    fillPosts(false, false, term);
  }, 300);
}

//Função que esconde o loader de scroll inifito 
function removeLoader() {
  setTimeout(() => {
    loaderConteiner.classList.remove('show');
    getNextPosts();
  }, 1000);
}

//Função que mostra o loader de scroll inifito
function showLoader() {
  loaderConteiner.classList.add('show');
  removeLoader();
}

//Função que lança um aviso de erro
function errorNotification(){
  //Alerta de erro
  Swal.fire({
    icon: 'error',
    title: 'ERRO:',
    text: 'Ocorreu um erro no envio do seu anúncio para o nosso servidor. Por favor, tente mais tarde.'
  });
}

//Adicionando o escutador para checar se o scroll chegou no final para carregar mais postagens e fazer o scroll infinito
window.addEventListener('scroll', () => {
  //Extraindo as propriedades que desejamos
  //* scrollTop: Representa em pixels distância do topo do documento e o topo visível do documento
  //* scrollHeight: Representa o tamanho total da altura em pixels deste documento incluindo as partes não visíveis desse documento
  //* clientHeight: Rrepresenta em pixels a distância entre o topo visível e o final da parte visível da página
  const {clientHeight, scrollHeight, scrollTop} = document.documentElement;
  
  //Flag que indica se o usuário chegou perto, à 10px do fim da página
  const isPageBottomAlmostReached = (scrollTop + clientHeight >= scrollHeight - 10);

  //Calculando quão próximo do fim da página o usuário esta para carregar os novos anúncios e verificando a FLAG de habilitacao
  if(isPageBottomAlmostReached){
    showLoader();
  }
});

//Preenchendo a area de posts com todos os posts
fillPosts();

//Chamando a funcao que implanta um escutador das mensagens vindas do [SW] para o client na main thread
registerServiceWorkerMessagesListener();

//Chamando a funcao que pede permissão ao usuário para implantar o Periodic Sync através de [SW] se o navegador possuir o recurso
registerServiceWorkerPeriodicSync();

//Quando toda a página carregar, executa esse bloco
(function () {

}())