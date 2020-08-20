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
    }
