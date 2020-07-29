<?php

namespace Models;

use \Core\Model;
use \Util\ErrorsManager;

class SubscriptionWPN extends Model{
    
    public function __construct()
    {
        parent::__construct();
    }

    public function saveSubscriptionKey(array $subscription)
    {
        $result = [];

        $sql = $this->pdo->prepare(
            "INSERT INTO subscriptions_wpn
            (navigator_endpoint, key_p256dh, key_auth, expiration_time)
            VALUES(?, ?, ?, ?)"
        );

        $status_query = $sql->execute([
            $subscription['endpoint'],
            $subscription['keys']->p256dh,
            $subscription['keys']->auth,
            $subscription['expirationTime'],
        ]);

        //Se houve algum erro
        if(!$status_query){
            ErrorsManager::setDatabaseError($result);
            return $result;
        }

        //Retorna o id da subscription gravada
        $result = $this->pdo->lastInsertId();

        return $result;
    }

    public function getAllSubscriptions()
    {
        $result = [];

        $sql = $this->pdo->prepare(
            "SELECT * FROM subscriptions_wpn"
        );

        $status_query = $sql->execute();

        //Se houve algum erro
        if(!$status_query){
            ErrorsManager::setDatabaseError($result);
            return $result;
        }

        if($sql->rowCount() > 0){
            $result = $sql->fetchAll(\PDO::FETCH_ASSOC);
        }

        return $result;
    }
}