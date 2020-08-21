<?php
/**
 * =============================================================================================
 *                Arquivo de configuração do banco de dados/PDO e da const BASE_URL 
 * =============================================================================================
 */

    require 'environment.php';


    //!ATENTION - VAPID keys para autenticação das Web Push Notifications
    //!'publicKey' => string 'BBiT7Jc-HMy4svIPv2n4-TgJ8AxdQO0kczafH0gcCt3VaH3Cr3Aee4s3mwbcguzrwz_6AJFJY40DG88ivDGqsp4' (length=87)
    //!'privateKey' => string 'AMUaVRayDDg9O2Iw8UqUenzVMa8d1DIe0qOvyLGshq8' (length=43)
    //PUBLIC E PRIVATE KEY do VAPID para enviar WEB PUSH NOTIFICATIONS para o servidor do Google
    define('PUBLIC_KEY_VAPID', 'BBiT7Jc-HMy4svIPv2n4-TgJ8AxdQO0kczafH0gcCt3VaH3Cr3Aee4s3mwbcguzrwz_6AJFJY40DG88ivDGqsp4');
    define('PRIVATE_KEY_VAPID', 'AMUaVRayDDg9O2Iw8UqUenzVMa8d1DIe0qOvyLGshq8');
    
    if (ENVIRONMENT == 'development') {
        define('BASE_URL', 'http://localhost/project-doapp/backend-api/public/');
        define('URL_IMG', $_SERVER['DOCUMENT_ROOT']."/project-doapp/backend-api/public/Images/");
        $config['dbname'] = 'project-doapp';
        $config['host'] = '127.0.0.1'; //ou 'localhost'
        $config['dbuser'] = 'root';
        $config['dbpass'] = '';

        //PRIVATE KEY para o JWT token de preferência com 256 caracteres
        define('PRIVATE_KEY_JWT', md5('SUA_KEY'));
    }
    else { //Se não => ENVIRONMENT = 'production'
        define('BASE_URL', 'https://lgrdev.com/projects/doapp/backend-api/public/');
        define('URL_IMG', $_SERVER['DOCUMENT_ROOT']."/projects/doapp/backend-api/public/Images/");
        $config['dbname'] = 'u756318379_doapp';
        $config['host'] = 'localhost';
        $config['dbuser'] = 'u756318379_doapp';
        $config['dbpass'] = 'S$TgU6S[b~6m';

        //PRIVATE KEY para o JWT token de preferência com 256 caracteres
        define('PRIVATE_KEY_JWT', md5('SUA_KEY'));
    }

    global $db;

    try {
        $db = new PDO('mysql:dbname='.$config['dbname'].';host='.$config['host'],
                        $config['dbuser'],
                        $config['dbpass']);

        //Setando o timezone por conexão
        // $db->query("SET GLOBAL time_zone = 'America/Sao_Paulo'");
        $db->query("SET GLOBAL time_zone = 'America/Sao_Paulo'");
    } catch(PDOException $e) {
        die($e->getMessage());
        exit();
    }

?>