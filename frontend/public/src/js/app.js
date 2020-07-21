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
    console.log('Enviou um post');
}

(function() {

}())