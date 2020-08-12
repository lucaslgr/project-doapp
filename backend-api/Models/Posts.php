<?php

namespace Models;
use \Core\Model;
use DateInterval;
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
    public function getAllPosts($limit = 5, $page = 1)
    {
        $result = [];

        $offset = (intval($page) - 1) * intval($limit);

        $sql = $this->pdo->prepare("SELECT * FROM posts ORDER BY id DESC LIMIT $offset, $limit");
        $status_query = $sql->execute();

        //Se houve algum erro
        if(!$status_query){
            ErrorsManager::setDatabaseError($result);
            return $result;
        }

        if($sql->rowCount() > 0){
            $sqldata = $sql->fetchAll(\PDO::FETCH_ASSOC);

            foreach($sqldata as $key => $value){
                //Corrigindo o fuso horario para -3 horas e formatando a data e o tempo
                $datetime = new \DateTime($sqldata[$key]['date_created']); 
                $datetime->sub(new DateInterval('PT3H'));//Substraindo 3 horas
                $sqldata[$key]['date_created'] = $datetime->format('H:i:s | d/m/Y');
            }

            return $sqldata;
        }

        return $result;
    }

    /**
     * SUCESSO: Retorna o id do post inserido
     * FALHA: Retorna os errors no array com [errors] => [];
     * 
     * @return int
     */
    public function createNewPost($title, $location, $image, $whatsapp_contact, $longitude = 0.0, $latitude = 0.0)
    {
        $result = [];
        $status_query = false;

        if($longitude != 0.0 && $latitude != 0.0){
            $sql = $this->pdo->prepare(
                "INSERT INTO posts(title, longitude, latitude, location, image, whatsapp_contact, status, date_created) VALUES(?, ?, ?, ?, ?, ?, 0, NOW())"
            );
    
            $status_query = $sql->execute([
                $title,
                $longitude,
                $latitude,
                $location,
                $image,
                $whatsapp_contact
            ]);
        } else {
            $sql = $this->pdo->prepare(
                "INSERT INTO posts(title, location, image, whatsapp_contact, status, date_created) VALUES(?, ?, ?, ?, 0, NOW())"
            );
    
            $status_query = $sql->execute([
                $title,
                $location,
                $image,
                $whatsapp_contact
            ]);
        }

        //Se houve algum erro
        if(!$status_query){
            ErrorsManager::setDatabaseError($result);
            return $result;
        }


        $result = $this->pdo->lastInsertId();

        return $result;
    }
}