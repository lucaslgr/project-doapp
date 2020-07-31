//Picture capturada pelo Canvas
let pictureCaptured;

//GeoLocation capturada
let locationCaptured;

//Pegando a referência para os elementos a serem manipulados
let videoPlayer = $('.modal.modal-add-post #video-player');
let canvasImgCapture = $('.modal.modal-add-post #canvas-img-capture');
let btnImgCapture = $('.modal.modal-add-post #btn-img-capture');
let imgPickerBox = $('.modal.modal-add-post .image-picker-box');
let imgPickerInput = $('.modal.modal-add-post #image-picker');
let imgPickerInputLabel = $('.modal.modal-add-post label[for=image-picker]');
let btnGeoLocation = $('.modal.modal-add-post #btn-location');
let locationLoader = $('.modal.modal-add-post .spinner.spinner-location');

//Checa os recursos necessários e configura a aplicação para utilizar as funcionalidades de camera 
function initializeMedia() {
  //Checando se no navegador temos o recurso de acesso a media devices do dispositivo [Até o momento, apenas o Chrome tem]
  if(!('mediaDevices' in navigator)){ //Se não tiver, criamos nosso própria recurso de mediaDevices no navegador
    navigator.mediaDevices = {};
  }

  //Checando se o recurso mediaDevices não possui já definido o método getUserMedia [Só entra nesse IF se entrar no primeiro IF também]
  if(!('getUserMedia' in navigator.mediaDevices)){
    
    //Implementando a nossa própria solução, pegando os métodos antigos de acesso a câmera respectivos de cada navegador e implementamos manualmente no mediaDevices.getUserMedia
    navigator.mediaDevices.getUserMedia = (constraints) => {
      /**
       * navigator.webkitGetUserMedia => Safari
       * navigator.mozGetUserMedia => Mozila
       */
      let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      
      //Entra aqui se o navegador não for o Mozila ou o Safari e também não tiver a API mediaDevices definidas
      if(!getUserMedia){
        return Promise.reject(new Error('getUserMedia is not implemented!'));
      }

      //!OBS: A Sintaxe nativa do método getUserMedia sempre retorna uma Promise, logo, devemos retornar uma Promise para caso de sucesso e de falha também para não quebrar a sintaxe
      return new Promise( (resolve, reject) => {
        //Setando como o método getUserMedia deverá ser chamado
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    }
  }

  //Acionando o método que vai pedir ao usuário permissão para acessar o video(câmera) e se ele permitir vai fazer a conexão
  // navigator.mediaDevices.getUserMedia({video: true, audio: true});
  navigator.mediaDevices.getUserMedia({video: true})
    //Se o usuário deu permissão para acessar a câmera
    .then( stream =>{
      //Enviando o fluxo de video para o a tag <video> definida na página
      videoPlayer.srcObject = stream;
      videoPlayer.style.display = 'block'; //Monstrando a tag <video>
      btnImgCapture.style.display = 'block'; //Monstrando o botão de Captura
    })
    //Se o usuário não deu permissão OU se foi lançado a Promise com ERROR para o caso em que o navegador não possui a API mediaDevices e nem foi possível implementar manualmente nas condições acima
    .catch( error => {
      //Se por algum motivo não foi possível utilizar a câmera, mostramos ao usuário a possibilidade de enviar um arquivo de imagem
      imgPickerBox.style.display = 'flex';
    });
}

//Captura uma imagem da tag video e coloca ela na tag canvas
function captureImageFromStream2Canvas(buttonCapture){

  //Monstrando o Canvas que vai conter a imagem capturada
  canvasImgCapture.style.display = 'block';
  //Escondendo o Streaming de video (tag <video>)
  videoPlayer.style.display = 'none';
  // buttonCapture.style.display = 'none';
  buttonCapture.setAttribute('disabled', true); //Desabilitando o botão de captura
  buttonCapture.style.cursor = 'not-allowed'; //Mudando o cursor para not-allowed

  let canvasContext = canvasImgCapture.getContext('2d'); //Setando que o conteúdo do canvas terá 2 dimensões
  //Inserindo a imagem do stream de video no conteúdo do Canvas
  canvasContext.drawImage(
    videoPlayer, //Fonte da imagem
    0, //Posição em X que ela ocupara no canvas
    0, //Posição em Y que ela ocupara no canvas
    canvasImgCapture.width, //Largura do destino 
    videoPlayer.videoHeight / ( videoPlayer.videoWidth / canvasImgCapture.width) //Altura do destino
  );

  //Parando o streaming de video vindo da tag <video>
  videoPlayer.srcObject.getVideoTracks().forEach( eachTrack => {
    eachTrack.stop(); //Parando cada faixa de video
  });

  //Pegando a imagem capturada no canvas, passando a url para dataURItoBlob e pegando um arquivo de imagem no retorno
  pictureCaptured = dataURItoBlob(canvasImgCapture.toDataURL());
}

//Captura a imagem upada na tag input[type=file] que é apresentada como opção quando o usuário não permite o aceso a câmera ou quando o navegador do usuário não fornece esse recurso
function captureImageFromInputFile(inputFile){
  pictureCaptured = inputFile.files[0]; //Pegando apenas o primeiro arquivo
  imgPickerInputLabel.innerText = 'Uma imagem foi enviada!';
}

//Checa os recursos necessários e configura a aplicação para utilizar as funcionalidades de geo localização
function initializeGeoLocation(){
  //Checando se NÃO tem o recurso de geolocalização no navegador
  if(!('geolocation' in navigator)){
    btnGeoLocation.style.display = 'none';
  }
}

//Captura a geoLocalizacao quando clica no botão de captura
function captureGeoLocation(){
  //Verificando se existe o recurso
  if(!('geolocation' in navigator)){
    return;
  }

  //Bloqueando o click do botão após clicar uma vez
  btnGeoLocation.setAttribute('disabled', true);
  btnGeoLocation.style.cursor = 'not-allowed';

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
      setTimeout( () => {
        locationLoader.style.display = 'none';
      },500);

      //Pegando a localizacao
      locationCaptured = {
        latitude : position.coords.latitude,
        longitude : position.coords.longitude
      }
      console.log('Condinates got by GeoLocation API', position.coords);

      $('input[name=location]').value = 'Cataguases York';
      $('input[name=location]').focus();

      //!TODO Conectar com API do google maps para conseguir o endereço da localização
      const GOOGLE_API_KEY = 'YOUR KEY';
      fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${locationCaptured.latitude},${locationCaptured.longitude}&key=${GOOGLE_API_KEY}`,
        { method : 'GET' }
      )
      .then( response => {
        if(response.ok)
          return response.json();
      })
      .then( responseJSON => {
        console.log('Response from Google Maps API', responseJSON);
      })
      .catch( error => {
        console.log('Request to Google Maps API failed', error);
      }); 
    },
    //2º Parâmetro: Callback com o erro
    (error) => {
      //Se houver uma falha, o usuário pode tentar pegar a localização novamente
      //Tirando o bloqueio de click botão
      btnGeoLocation.removeAttribute('disabled');
      btnGeoLocation.style.cursor = 'pointer';
      locationLoader.style.display = 'none';
      alert('Por favor tente novamente, não foi possível pegar a sua localização...');

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
  $('.modal.modal-add-post').classList.remove('show-modal-add-post');
  $('section#posts').classList.remove('display-none');

  //Parando o streaming de video vindo da tag <video> se ela tiver sendo utilizada
  if(window.getComputedStyle(videoPlayer).getPropertyValue('display') !== 'none' ) {
    videoPlayer.srcObject.getVideoTracks().forEach( eachTrack => {
      eachTrack.stop(); //Parando cada faixa de video
    });
  }

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
  $('input[name=location]').value = '';
  $('input[name=price]').value = '';
  $('input[name=whatsapp-contact]').value = '';
  return;
}

//Extrai e envia os dados do Post para a API
function sendModalPost() {
  const endpoint = 'http://localhost/project-barganhapp/backend-api/public/posts/new';

  let idPost = new Date().toISOString(); //Setando um ID temporário para os posts a serem armazenados no IndexedDB
  let title = $('input[name=title]').value;
  let location = $('input[name=location]').value;
  let price = $('input[name=price]').value;
  let whatsapp_contact = $('input[name=whatsapp-contact]').value;

  //Pegando os dados do Post e transformando no formato FormData para podermos enviar a imagem
  let postFormData = new FormData();
  postFormData.append('id', idPost);
  postFormData.append('title', title);
  postFormData.append('location', location);
  postFormData.append('price', price);
  postFormData.append('whatsapp_contact', whatsapp_contact);
  //Enviando a imagem e renomeando-a pois no servidor não podemos ter imagens com nmomes iguais
  postFormData.append('image', pictureCaptured, `${idPost}.png`); 

  //*Verificando se no navegador existe os recursos de [serviceWorker] e [SyncManager](BackgroundSyncronization)
  if('serviceWorker' in navigator && 'SyncManager' in window){
    //*Quando o [SW] estiver registrado, instalado e ativado ele retorna uma promise no .ready
    navigator.serviceWorker.ready
      .then( sw => {
        //Montando JSON das info do post a ser gravado no indexedDB para background synchronization
        let requestData = {
          id: idPost,
          title: title,
          location: location,
          image: pictureCaptured,
          price: price,
          whatsapp_contact: whatsapp_contact
        };

        //Salvando as informações da requisição no IndexedDB para serem sincronizadas no [SW]
        writeData('sync-posts', requestData)
          .then( () => {
            //*Acessando o Sync Manager do [SW] e registrando uma async task com o nome passado no parâmetro
            sw.sync.register('sync-new-post');
          })
          .then( () => {
            alert('Anúncio inserido com sucesso!');
            // fillPosts(); //! fillPosts() é engatilhado pelo SW quando ele executa a sync task('sync-new-post') registrada e retorna uma mensagem para main thred no client
            clearModalAddPostInputs();
            closeModalAddPost();
          })
          .catch((errors) => {
            console.log('ERRO', errors);
            alert(`ERRO na sincronização de anúncios : ${errors.msg}`);
            closeModalAddPost();
          })
      });
  }
  //* Se o navegador não tiver recursos de [SW] e [SyncManager]
  else {
    fetch(endpoint, {
      "method": "POST",
      "headers": {
        'Content-Type': 'application/json'
      },
      "body": postFormData
    })
    .then((response) => {
      return response.json();
    })
    .then((responseJSON) => {
      if (responseJSON.errors) {
        throw responseJSON.errors;
      }
      alert('Anúncio inserido com sucesso!');
      console.log('Inserido um novo post, seu id eh: ' + responseJSON.data.id_post);
      fillPosts();
      clearModalAddPostInputs();
      closeModalAddPost();
    })
    .catch((errors) => {
      console.log('ERRO', errors);
      alert(`ERRO ${errors.status_code} : ${errors.msg}`);
      closeModalAddPost();
    })
  }
}

//Cria uma nova postagem de anuncio
function createPost(dataPost) {
  // ! MODELO
  // <div class="each-post">
  //  <img src="./src/images/product-default.png" alt="">
  //  <h1 class="title">Título</h1>
  //  <h4>Localização: <div class="location"> Cataguases-MG</div></h4>
  //  <h4>Data: <div class="date-created"> 20/03/2020 às 12:20</div></h4>
  //  <h4>Price: <div class="price">R$ 10,00</div></h4>
  //  <h4>Contato: <div class="whatsapp-contact">(32)9 88094352</div></h4>
  //</div>  

  // dataPost.title;
  // dataPost.image;
  // dataPost.location;
  // dataPost.date_created;
  // dataPost.price;
  // dataPost.whatsapp_contact;

  //Montando os elementos HTML que constituem o DOM
  let postWrapper = document.createElement('div');
  postWrapper.setAttribute('data-id', dataPost.id);
  postWrapper.className = 'each-post';

  if (dataPost.image === '')
    dataPost.image = './src/images/products/product-default.png';

  let postImg = document.createElement('img');
  postImg.setAttribute('src', dataPost.image); //!VALOR da url da imagem
  postImg.setAttribute('alt', 'imagem do produto');

  let postTitle = document.createElement('h1');
  postTitle.className = 'title';
  postTitle.innerText = dataPost.title; //!VALOR do título

  let postLocation = document.createElement('h4');
  postLocation.innerText = 'Localização: ';
  let locationValue = document.createElement('div');
  locationValue.className = 'location';
  locationValue.innerText = dataPost.location; //!VALOR da localizacao
  postLocation.appendChild(locationValue);

  let postDateCreated = document.createElement('h4');
  postDateCreated.innerText = 'Data: ';
  let dataCreatedValue = document.createElement('div');
  dataCreatedValue.className = 'date-created';
  dataCreatedValue.innerText = dataPost.date_created; //!VALOR da data de criação
  postDateCreated.appendChild(dataCreatedValue);

  let postPrice = document.createElement('h4');
  postPrice.innerText = 'Preço: ';
  let dataPriceValue = document.createElement('div');
  dataPriceValue.className = 'price';
  dataPriceValue.innerText = `R$ ${parseFloat(dataPost.price).toFixed(2)}`; //!VALOR do produto
  postPrice.appendChild(dataPriceValue);

  let postContact = document.createElement('h4');
  postContact.innerText = 'Whatsapp: ';
  let dataContactValue = document.createElement('div');
  dataContactValue.className = 'whatsapp-contact';
  dataContactValue.innerText = dataPost.whatsapp_contact; //!VALOR do número de whatsapp
  postContact.appendChild(dataContactValue);

  //Adicionando todos os elementos no PostWrapper
  postWrapper.appendChild(postImg);
  postWrapper.appendChild(postTitle);
  postWrapper.appendChild(postLocation);
  postWrapper.appendChild(postDateCreated);
  postWrapper.appendChild(postPrice);
  postWrapper.appendChild(postContact);

  // componentHandler.upgradeElement(postWrapper);
  let sectionPostsArea = $('section#posts .section-area');
  //Adicionando a nova postagem na area de postagens
  sectionPostsArea.appendChild(postWrapper);
}

//Limpa todos os cards de posts/anuncios
function clearAllCards() {
  $$('section#posts .section-area .each-post').forEach(each => each.remove());
}

//Puxando da API todos posts do banco e inserindo na tela
function fillPosts() {
  // ! ESTRATÉGIA : CACHE THEN NETWORK
  let networkDataReceived = false;
  const endpoint = 'http://localhost/project-barganhapp/backend-api/public/posts';

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
    console.log(`Data Cards from web`, responseJSON);

    //Setando a flag que indica que a requisição executada pela network recebeu a resposta
    networkDataReceived = true;
    
    if (responseJSON.errors) {
      throw responseJSON.errors;
    }
    clearAllCards(); //Limpando todos cards existentes de anuncios antes de atualizar
    responseJSON.data.map((eachPost) => {
      createPost(eachPost);
    })
  })
  .catch((errors) => {
      console.log('ERRO', errors);
      // alert(`ERRO ${errors.status_code} : ${errors.msg}`);
  })

  //Verifica se o navegador/janela tem o recurso de IndexedDB
  if ('indexedDB' in window) {
    readAllData('posts')
      .then( responseJSON => {
        if (responseJSON.errors) {
          throw responseJSON.errors;
        }

        //Checa se não recebeu a informação da requisição feita pela network primeiro
        if(!networkDataReceived){
          console.log('Data Cards from indexedDB', responseJSON);
          clearAllCards(); //Limpando todos cards existentes de anuncios antes de atualizar

          responseJSON.map( eachPost => {
            createPost(eachPost);
          })
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

//Registra um escutador de mensagens vindas do [SW] para main thread no client encaminha para as respectivas actions de acordo com a mensagem
function registerServiceWorkerMessagesListener(){
  if('serviceWorker' in navigator){
    navigator.serviceWorker.addEventListener('message', event => {
      // console.log(event.data.msg, event.data.url);
      console.log('Mensagem recebida do [SW] para main thread', event.data.action);

      //Verifica se foi setada uma action
      if(event.data.action){
        //Executando a action(funcao) dinamicamente
        window[event.data.action]();
      }
    });
  }
}

//Preenchendo a area de posts com todos os posts
fillPosts();

//Chamando a funcao que implanta um escutador das mensagens vindas do [SW] para o client na main thread
registerServiceWorkerMessagesListener();

//Quando toda a página carregar, executa esse bloco
(function () {

}())