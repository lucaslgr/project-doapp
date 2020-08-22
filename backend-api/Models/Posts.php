<?php

/**
 * =============================================================================================
 *                         Model responsável por operar a tabela Posts 
 * =============================================================================================
 */

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
    public function getAllPosts($limit = 5, $page = 1, $term = '')
    {
        $result = [];

        $offset = (intval($page) - 1) * intval($limit);

        $term_query = '';
        //Montando a query de pesquisa
        if($term != ''){
            $term_query = "WHERE title LIKE '%".\addslashes($term)."%'";
        }

        $sql = $this->pdo->prepare("SELECT * FROM posts $term_query ORDER BY id DESC LIMIT $offset, $limit");
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
     * Retorna todos os Posts vinculados a um usuário do respectivo ID
     * 
     * SUCESSO: Retorna todos os posts do banco de dados em ordem decrescente, do mais atual para o mais antigo pertencentes ao usuario do respectivo id
     * FALHA: Retorna os errors no array com [errors] => [];
     *
     * @param [int] $id_user
     * @return void
     */
    public function getAllPostsByUser($id_user)
    {
        $result = [];

        $sql = $this->pdo->prepare("SELECT * FROM posts WHERE id_user = ? ORDER BY id DESC");
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
    public function createNewPost($id_user, $title, $location, $image, $whatsapp_contact, $longitude = 0.0, $latitude = 0.0)
    {
        $result = [];
        $status_query = false;

        if($longitude != 0.0 && $latitude != 0.0){
            $sql = $this->pdo->prepare(
                "INSERT INTO posts(id_user, title, longitude, latitude, location, image, whatsapp_contact, status, date_created) VALUES(?, ?, ?, ?, ?, ?, ?, 0, NOW())"
            );
    
            $status_query = $sql->execute([
                $id_user,
                $title,
                $longitude,
                $latitude,
                $location,
                $image,
                $whatsapp_contact
            ]);
        } else {
            $sql = $this->pdo->prepare(
                "INSERT INTO posts(id_user, title, location, image, whatsapp_contact, status, date_created) VALUES(?, ?, ?, ?, ?, 0, NOW())"
            );
    
            $status_query = $sql->execute([
                $id_user,
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


    /**
     * Deleta o post do respectivo id e pertencente ao usuario do respectivo id recebido como parâmetro
     *
     * SUCESSO: Retorna o id do post inserido
     * FALHA: Retorna os errors no array com [errors] => [];
     * 
     * @param [type] $id_user
     * @param [type] $id_post
     * @return void
     */
    public function deletePostById($id_user, $id_post)
    {
        $result = [];

        //Checando se o post pertence ao usuário do respectivo id
        $sql = $this->pdo->prepare("SELECT * FROM posts WHERE id = ? AND id_user = ?");
        $status_query = $sql->execute([
            $id_post,
            $id_user
        ]);

        //Se houve algum erro na query
        if(!$status_query){
            ErrorsManager::setDatabaseError($result);
            return $result;
        }

        if(!($sql->rowCount() > 0)){
            $sqldata = $sql->fetch(\PDO::FETCH_ASSOC);

            ErrorsManager::setUnauthorizedError($result);
            return $result;
        }

        $sql = $this->pdo->prepare("DELETE FROM posts WHERE id = ? AND id_user = ?");
        $status_query = $sql->execute([
            $id_post,
            $id_user
        ]);

        //Se houve algum erro
        if(!$status_query){
            ErrorsManager::setDatabaseError($result);
            return $result;
        }

        $result = true;

        return $result;
    }
}