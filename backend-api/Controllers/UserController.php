<?php

namespace Controllers;
use \Core\Controller;
use \Util\ErrorsManager;
use \Models\Users;

class UserController extends Controller {

    

    public function __construct()
    {
        
    }

    public function register()
    {
        $response = [];

        $method = $this->getMethod();
        // $authorization = $this->getAuthorization();
        $data = $this->getRequestData();

        //Se o método for diferente do GET retorna erro de método inválido
        if($method != 'POST'){
            ErrorsManager::setMethodNotAllowedError($response);
            $this->returnJson($response);
            return;
        }

        //Checando se as informações foram enviadas
        if(!isset($data['name']) || empty(trim($data['name']))
        || !isset($data['email']) || empty(trim($data['email']))
        || !isset($data['password']) || empty(trim($data['password']))){
            ErrorsManager::setUnprocessableEntityError($response);
            $this->returnJson($response);
            return;
        }

        //Checando se o email é válido
        if(filter_var($data['email'], \FILTER_VALIDATE_EMAIL) === false){
            ErrorsManager::setUnprocessableEntityError($response, 'E-mail invalido.');
            $this->returnJson($response);
            return;
        }

        $name = trim($data['name']);
        $email = trim($data['email']);
        $password = trim($data['password']);

        $users = new Users();

        $result = $users->checkEmailExists($email);

        if(isset($result['errors'])){
            $response['errors'] = $result['errors'];
            $this->returnJson($response);
            return;
        }

        //Criando o registro do usuário
        $result = $users->newRegister($name, $email, $password);

        if(isset($result['errors'])){
            $response['errors'] = $result['errors'];
            $this->returnJson($response);
            return;
        }

        $response = [
            'data' => [
                'id_user' => $result['id_user'],
                'jwt' => $result['jwt']
            ]
        ];

        $this->returnJson($response, 200);
    }

    public function login()
    {
        $response = [];

        $method = $this->getMethod();
        // $authorization = $this->getAuthorization();
        $data = $this->getRequestData();

        //Se o método for diferente do GET retorna erro de método inválido
        if($method != 'POST'){
            ErrorsManager::setMethodNotAllowedError($response);
            $this->returnJson($response);
            return;
        }

        if(!isset($data['email']) || empty(trim($data['email']))
        || !isset($data['password']) || empty(trim($data['password']))){
            ErrorsManager::setUnprocessableEntityError($response);
            $this->returnJson($response);
            return;
        }

        //Checando se o email é válido
        if(filter_var($data['email'], \FILTER_VALIDATE_EMAIL) === false){
            ErrorsManager::setUnprocessableEntityError($response, 'E-mail invalido.');
            $this->returnJson($response);
            return;
        }

        $email = trim($data['email']);
        $password = trim($data['password']);

        $users = new Users();

        $result = $users->checkCredentials($email, $password);

        //Setando o id do usuario logado (acabou de logar automaticamente apos se registrar)
        $this->logged_user_id = $result;

        if(isset($result['errors'])){
            $response['errors'] = $result['errors'];
            $this->returnJson($response);
            return;
        }

        //Setando a response
        $response = [
            'data' => [
                'id_user' => $result['id_user'],
                'jwt' => $result['jwt']
            ]
        ];

        $this->returnJson($response, 200);
    }
}