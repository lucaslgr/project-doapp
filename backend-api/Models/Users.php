<?php
/**
 * =============================================================================================
 *                          Model responsável por operar a tabela Users 
 * =============================================================================================
 */
namespace Models;
use \Core\Model;
use \Util\ErrorsManager;
use \Util\Jwt;

class Users extends Model {
    //Armazena o id do usuario logado
    private $logged_user_id;

    public function __construct()
    {
        parent::__construct();
    }

    public function newRegister(string $name, string $email, string $password)
    {
        $result = [];
        $status_query = false;
        $sql = $this->pdo->prepare(
            "INSERT INTO users(name, email, password) VALUES(?, ?, ?)"
        );

        $status_query = $sql->execute([
            $name,
            $email,
            password_hash($password, \PASSWORD_BCRYPT),
        ]);  
        //Se houve algum erro
        if(!$status_query){
            ErrorsManager::setDatabaseError($result);
            return $result;
        }

        //Setando o id do usuario logado (acabou de logar automaticamente apos se registrar)
        $this->logged_user_id = $this->pdo->lastInsertId();

        //Setando o result
        $result['id_user'] = $this->logged_user_id;
        $result['jwt'] = $this->createJWT();

        return $result;
    }

    public function checkEmailExists(string $email)
    {
            $result = [];
            $status_query = false;

            $sql = $this->pdo->prepare(
                "SELECT * FROM users WHERE email = ?"
            );
    
            $status_query = $sql->execute([
                $email
            ]);  

            //Se houve algum erro
            if(!$status_query){
                ErrorsManager::setDatabaseError($result);
                return $result;
            }

            //Verifica se retornou algum resultado, ou seja, se já existe um usuário com o respectivo email
            if($sql->rowCount() > 0){
                ErrorsManager::setConflictError($result, 'E-mail ja cadastrado');
                return $result;
            }

            //Setando como false, pois não existe usuario cadastrado com o email
            $result = false;

            return $result;
    }
    
    public function checkCredentials(string $email, string $password)
    {
        $result = [];
        $status_query = false;
        $sql = $this->pdo->prepare(
            "SELECT * FROM users WHERE email = ?"
        );

        $status_query = $sql->execute([
            $email
        ]);  
        //Se houve algum erro
        if(!$status_query){
            ErrorsManager::setDatabaseError($result);
            return $result;
        }
        //Verifica se retornou algum resultado, ou seja, se já existe um usuário com o respectivo email
        if($sql->rowCount() <= 0){
            ErrorsManager::setUnauthorizedError($result, 'E-mail e/ou senha incorretos');
            return $result;
        }
        //Pegando a senha criptografada no banco de dados
        $user_info = $sql->fetch(\PDO::FETCH_ASSOC); 
        $encrypted_password = $user_info['password']; 
        //Verificando se a senha enviada NÃO corresponde a senha encriptografada armazenada no banco de dados
        if(!\password_verify($password, $encrypted_password)){
            ErrorsManager::setUnauthorizedError($result, 'E-mail e/ou senha incorretos');
            return $result;
        }

        //Setando o id do usuario logado (acabou de logar automaticamente apos se registrar)
        $this->logged_user_id = $user_info['id'];

        //Setando o result
        $result['id_user'] = $this->logged_user_id;
        $result['jwt'] = $this->createJWT();

        return $result;
    }

    public function checkLogout(string $jwt_token)
    {
        $result = [];

        //Setando o id do usuario logado (acabou de logar automaticamente apos se registrar)
        // $this->logged_user_id = $user_info['id'];

        $jwt = new Jwt();

        //Pegando o payload enviado no jwt
        $payload_info = $jwt->validate($jwt_token);

        //Checando se não é um JWT valido
        if(!isset($payload_info->id_user)){
            ErrorsManager::setUnauthorizedError($result);
            return $result;
        }
        
        //Setando o id do usuario logado como null só para garantir 
        $this->logged_user_id = null;
        $result = true;

        return $result;
    }

    public function setLoggedIdUser(int $id)
    {
        $this->logged_user_id = $id;
    }

    public function getLoggedIdUser()
    {
        return $this->logged_user_id;
    }

    public function createJWT()
    {
        $jwt = new Jwt();
        //Criando e retornando um novo token baseado no id do user
        return $jwt->create([
            'id_user' => $this->logged_user_id
        ]);
    }

    public function validaJWT(string $jwt_token)
    {
        $jwt = new Jwt();

        //Pegando as informações do Payload do JWT
        $payload_info = $jwt->validate($jwt_token);

        //Checa se o JWT foi validado com sucesso
        if(isset($payload_info->id_user)){
            //Setando o id de user logado
            $this->logged_user_id = $payload_info->id_user;
            return true;
        } else {
            return false;
        }
    }
}
