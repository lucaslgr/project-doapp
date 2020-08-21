<?php
/**
 * =============================================================================================
 *                          Model responsável por operar a tabela Users 
 * =============================================================================================
 */
    namespace Models;

    use \Core\Model;
    use \Util\ErrorsManager;

    class Users extends Model {
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

            $result = $this->pdo->lastInsertId();

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
    }
