<?php

//!ATENTION - VAPID keys para autenticação das Web Push Notifications
//!'publicKey' => string 'BBiT7Jc-HMy4svIPv2n4-TgJ8AxdQO0kczafH0gcCt3VaH3Cr3Aee4s3mwbcguzrwz_6AJFJY40DG88ivDGqsp4' (length=87)
//!'privateKey' => string 'AMUaVRayDDg9O2Iw8UqUenzVMa8d1DIe0qOvyLGshq8' (length=43)

namespace Controllers;
use \Core\Controller;
use \Models\Posts;
use \Util\ErrorsManager;
use \Minishlink\WebPush\VAPID;

class PostsController extends Controller{
    
    public function getAll()
    {
        $response = [];

        $method = $this->getMethod();
        // $authorization = $this->getAuthorization();

        //Se o método for diferente do GET retorna erro de método inválido
        if($method != 'GET'){
            ErrorsManager::setMethodNotAllowedError($response);
            $this->returnJson($response);
            return;
        }

        $posts = new Posts();

        $result = $posts->getAllPosts();
        if(isset($result['errors'])){
            $response['errors'] = $result['errors'];
            $this->returnJson($response);
            return;
        }

        if(!isset($result) || empty($result) || !count($result)>0){
            //Setando 204 => No Content
            $this->returnJson($response, 204);
            return;
        }

        $response['data'] = $result;
        $this->returnJson($response, 200);
    }

    // public function generateVapidKeys()
    // {
    //     var_dump(VAPID::createVapidKeys()); // store the keys afterwards
    //     exit;
    // }

    public function addPost()
    {
        $response = [];

        $method = $this->getMethod();
        $data = $this->getRequestData();
        // $authorization = $this->getAuthorization();

        //Se o método for diferente do GET retorna erro de método inválido
        if($method != 'POST'){
            ErrorsManager::setMethodNotAllowedError($response);
            $this->returnJson($response);
            return;
        }

        //Verificando se as informações foram enviadas para a API
        if( count($data) < 4                ||
            empty($data['title'])           ||
            empty($data['location'])        ||
            empty($data['price'])           ||
            empty($data['whatsapp_contact'])){
            ErrorsManager::setUnprocessableEntityError($response);
            $this->returnJson($response);
            return;
        }

        $posts = new Posts();

        $result = $posts->createNewPost(
            $data['title'],
            $data['location'],
            $data['image'], 
            $data['price'],
            $data['whatsapp_contact']
        );

        if(isset($result['errors'])){
            $response['errors'] = $result['errors'];
            $this->returnJson($response);
            return;
        }

        if(!isset($result) || empty($result)){
            //Setando 204 => No Content
            $this->returnJson($response, 204);
            return;
        }

        //Verifica se foi enviado id que representa o anuncio/post no indexedDB no frontend da aplicacao
        if(isset($data['id']) && !empty($data['id']))
            $response['data']['id_indexedDB'] = $data['id'];

        $response['data']['id_post'] = $result;
        $this->returnJson($response, 200);
    }
}