<?php

namespace Models;
use \Core\Model;
use \Util\ErrorsManager;

class Posts extends Model {
    public function __construct()
    {
        parent::__construct();
    }

    public function getAllPosts()
    {
        $result = [];

        $sql = $this->pdo->prepare("SELECT * FROM posts ORDER BY id DESC");
        $status_query = $sql->execute();

        //Se houve algum erro
        if(!$status_query){
            ErrorsManager::setDatabaseError($result);
            return $result;
        }

        if($sql->rowCount() > 0){
            return $sql->fetchAll(\PDO::FETCH_ASSOC);
        }

        return $result;
    }
}