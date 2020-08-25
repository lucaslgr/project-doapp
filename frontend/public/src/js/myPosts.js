//Pegando a referência para os elementos a serem manipulados
const sectionPostsArea = $('section#posts .section-area.section-area--myposts'); //Area onde ficam as postagens do respectivo user logado

/**
 * Cria uma nova postagem respectiva as informações do JSON recebido
 * @param {JSON} dataPost 
 */
function createUserPostHTML(dataPost){
  console.log('Inserting HTMLPosts on post area', dataPost);

  //Extraindo todos os dados do JSON com as informações do post
  const {id, title, image, date_created} = dataPost;

  return `
    <div class="each-post" data-id="${id}">
      <img src="${image}" alt="imagem do objeto">
      <h1 class="title">${title}</h1>
      <table>
        <tr>
          <td class="tdheader">Data:</td>
          <td>${date_created}</td>
        </tr>
      </table>
      <i class="icon-trash" onclick="deleteThisPost(${id})"></i>
    </div>  
  `;
}

/**
 * Remove o respectivo DOM HTML do post respectivo ao ID passado como parâmetro
 * @param {int} postId 
 */
function removePostByIdHTML(postId){
  //Pegando o DOM do respectivo post referente ao id passado por parâmetro
  const post = sectionPostsArea.querySelector(`.each-post[data-id="${postId}"]`);

  console.log('Removing this post', post);

  //Removendo o DOM do respecctivo post
  post.remove();
}

/**
 * Deleta o post respectivo ao id passado como parâmetro e também do BD
 * @param {int} postId 
 */
function deleteThisPost(postId){
  //Mostrando aviso para confirmar se o usuário deseja realmente deletar o respectivo anuncio
  Swal.fire({
    title: 'Você tem certeza que deseja remover esse anúncio?',
    text: "Essa ação não poderá ser revertida!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#0060b8',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sim!'
  })
  .then((result) => {
    //Checando se o usuário confirmou que quer deletar o respectivo anuncio
    if (result.value) {
      console.log(`Removing the post with respective id`, postId);
      const endpoint = `${API_BASE_URL}/posts/del/${postId}`;

      fetch(endpoint,{
        "method" : "DELETE",
        "headers": {
          "Authorization": `${window.localStorage.getItem('jwt')}`
        }
      })
      .then(response => {
        return response.json();
      })
      .then(responseJSON => {

        //Verificando se houve errors e lançando par ao catch
        if (responseJSON.errors) {
          throw responseJSON.errors;
        }

        console.log(`Respective post was removed`, postId);

        //Removendo o DOM HTML do respectivo post
        removePostByIdHTML(postId);

        //Exibindo a mensagem de sucesso
        Swal.fire({
          icon: 'success',
          title: 'Anuncio removido com sucesso!',
          showConfirmButton: false,
          timer: 1500
        })

      })
      .catch(errors => {
        //Exibindo a mensagem de sucesso
        Swal.fire({
          icon: 'error',
          title: 'ERRO:',
          text: errors.msg
        });
      });
    }
  })



  
}

/**
 * Função responsável por preencher o HTML com todos os posts do respectivo usuario logado
 */
function fillPostsLoggedUser() {
  const endpoint = `${API_BASE_URL}/posts/${window.localStorage.getItem('id_logged_user')}`;

  //Limpando todos posts na section que contém o HTML dos posts
  sectionPostsArea.innerHTML = '';

  fetch(endpoint, {
    "method": "GET",
    "headers": {
      "Authorization": `${window.localStorage.getItem('jwt')}`
    }
  })
  .then(response => {
    return response.json();
  })
  .then(responseJSON => {
    //Verificando se houve errors e lançando par ao catch
    if (responseJSON.errors) {
      throw responseJSON.errors;
    }

    console.log(`Data Cards from web`, responseJSON);

    //Se estiver vazio, finaliza a funcao poupando processamento 
    if(isEmpty(responseJSON)){
      //Mostrando aviso de que o respectivo usuário ainda não possui nenhuma postagem
      Swal.fire({
        icon: 'warning',
        title: 'Você não possui nenhum anúncio a ser exibido.',
        showConfirmButton: false,
        timer: 1500
      })
      return;
    }

    let postsUserTemplate = responseJSON.data.map((eachPost) => {
      return createUserPostHTML(eachPost);
    }).join('');

    sectionPostsArea.innerHTML += postsUserTemplate;
  })
  .catch( errors => {
    console.log('ERRO', errors);
  })
}

//Preenchendo a area de posts com todos os posts DO USUÁRIO LOGADO
fillPostsLoggedUser();