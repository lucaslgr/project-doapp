<?php

namespace Models;
use \Core\Model;
use \Util\ErrorsManager;

class Posts extends Model {
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * SUCESSO: Retorna todos os posts do banco de dados em ordem decrescente, do mais atual para o mais antigo
     * FALHA: Retorna os errors no array com [errors] => [];
     * 
     * @return array
     */
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

    /**
     * SUCESSO: Retorna o id do post inserido
     * FALHA: Retorna os errors no array com [errors] => [];
     * 
     * @return int
     */
    public function createNewPost($title, $location, $image, $price, $whatsapp_contact)
    {
        $result = [];

        $sql = $this->pdo->prepare(
            "INSERT INTO posts(title, location, image, price, whatsapp_contact, status, date_created)
            VALUES(?, ?, ?, ?, ?, 0, NOW())"
        );

        $status_query = $sql->execute([
            $title,
            $location,
            $image,
            $price,
            $whatsapp_contact
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