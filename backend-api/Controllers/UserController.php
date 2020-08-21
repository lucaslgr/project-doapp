<?php

namespace Controllers;
use \Core\Controller;
use \Util\ErrorsManager;
use \Models\Users;
use \Util\Jwt;

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

        $name = isset($data['name'])?trim($data['name']):null;
        $email = filter_var($data['email'], \FILTER_VALIDATE_EMAIL);
        $password = isset($data['password'])?trim($data['password']):null;

        //Checando se as informações foram enviadas
        if(empty($name)
        || empty($email)
        || empty($password)){
            ErrorsManager::setUnprocessableEntityError($response);
            $this->returnJson($response);
            return;
        }

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

        if(!isset($result) || empty($result)){
            //Setando 204 => No Content
            $this->returnJson($response, 200);
            return;
        }

        //Criando o JWT com o ID do usuario inserido no banco
        $jwt = new Jwt();

        $response['data']['jwt'] = $jwt->create([
            'id_user' => $result,
        ]);

        $response['data']['id_user'] = $result;
        $this->returnJson($response, 200);
    }
}