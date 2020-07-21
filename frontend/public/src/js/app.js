const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

function showMenuMobile(){
    $('ul.menu-mobile').classList.toggle('show-menu-mobile');
}

function showModalAddPost(){
    $('.modal.modal-add-post').classList.toggle('show-modal-add-post');
}

function closeModalAddPost(){
    $('.modal.modal-add-post').classList.remove('show-modal-add-post');
}

function sendModalPost(){
    let title = $('input[name=title]').value;
    let location = $('input[name=location]').value;
    let price = $('input[name=price]').value;
    let whatsapp_contact = $('input[name=whatsapp-contact]').value;

    let request_data = {
        title : title,
        location : location,
        price : price,
        whatsapp_contact : whatsapp_contact
    };

    console.log(request_data);

    closeModalAddPost();
}

function createPost(dataPost){
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
    let postWrapper =  document.createElement('div');
    postWrapper.className = 'each-post';

    if(dataPost.image === '')
        dataPost.image = 'product-default.png';

    let postImg = document.createElement('img'); 
    postImg.setAttribute('src', `./src/images/${dataPost.image}`); //!VALOR da url da imagem
    postImg.setAttribute('alt', 'imagem do produto');

    let postTitle = document.createElement('h1');
    postTitle.className = 'title';
    postTitle.innerText =  dataPost.title; //!VALOR do título

    let postLocation = document.createElement('h4');
    postLocation.innerText = 'Localização: ';
    let locationValue  = document.createElement('div');
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

//Remove todos os anuncios
function clearAllCards(){
    $$('section#posts .section-area .each-post').forEach( each => each.remove());
}

//Puxando a API todos posts do banco e inserindo na tela
function fillPosts(){
    // clearAllCards();

    let endpointGetAll = 'http://localhost/project-barganhapp/backend-api/public/posts';

    fetch(endpointGetAll,{
        "method" : "GET",
        "headers" : {
            "Content-Type" : "application/json"
        }
    })
    .then( (response) => {
        return response.json();
    })
    .then( (responseJSON) => {

        responseJSON.data.map( (eachPost) => {
            createPost(eachPost);
        })
    })
    .catch( (error) => {
        console.log('Ocorreu erro na requisicao dos posts', error);
    })

}

(function() {
    fillPosts();


}())