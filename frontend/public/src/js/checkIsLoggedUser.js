//Verifica se o usuario esta logado, se não estiver, redireciona para o index.html
//Checando se o JWT e o id do usuário logado estão setados

if (   (window.localStorage.getItem('jwt') == '')
    || (window.localStorage.getItem('jwt') == 'null')
    || (window.localStorage.getItem('jwt') == 'undefined')
    || (window.localStorage.getItem('jwt') == undefined)
    || (window.localStorage.getItem('id_logged_user') == '')
    || (window.localStorage.getItem('id_logged_user') == 'undefined')
    || (window.localStorage.getItem('id_logged_user') == undefined)
    || (window.localStorage.getItem('id_logged_user') == 'null')) {
    window.location.href = BASE_URL;
}