<?php
/**
 * =============================================================================================
 *                Arquivo de configuração do banco de dados/PDO e da const BASE_URL 
 * =============================================================================================
 */

require 'environment.php';
//!ATENTION - VAPID keys para autenticação das Web Push Notifications
//PUBLIC E PRIVATE KEY do VAPID para enviar WEB PUSH NOTIFICATIONS para o servidor do Google
define('PUBLIC_KEY_VAPID', 'YOUR_PUBLIC_KEY_VAPID'); //(length=87) //? CONFIGURAR
define('PRIVATE_KEY_VAPID', 'YOUR_PRIVATE_KEY_VAPID'); //(length=43) //? CONFIGURAR

if (ENVIRONMENT == 'development') {
    define('BASE_URL', 'http://localhost/project-doapp/backend-api/public/');
    define('URL_IMG', $_SERVER['DOCUMENT_ROOT']."/project-doapp/backend-api/public/Images/");
    $config['dbname'] = 'project-doapp';
    $config['host'] = '127.0.0.1'; //ou 'localhost'
    $config['dbuser'] = 'root';
    $config['dbpass'] = '';
    //PRIVATE KEY para o JWT token de preferência com 256 caracteres
    define('PRIVATE_KEY_JWT', md5('YOUR_KEY'));
}
else { //Se não => ENVIRONMENT = 'production'
    define('BASE_URL', 'BASE_URL_API_PRODUCTION'); //? CONFIGURAR
    define('URL_IMG', $_SERVER['DOCUMENT_ROOT']."/projects/doapp/backend-api/public/Images/"); //? CONFIGURAR
    $config['dbname'] = 'db_name'; //? CONFIGURAR
    $config['host'] = 'localhost'; //? CONFIGURAR
    $config['dbuser'] = 'db_user'; //? CONFIGURAR
    $config['dbpass'] = 'db_pass'; //? CONFIGURAR
    //PRIVATE KEY para o JWT token de preferência com 256 caracteres
    define('PRIVATE_KEY_JWT', md5('YOUR_KEY')); //? CONFIGURAR
}
global $db;
try {
    $db = new PDO('mysql:dbname='.$config['dbname'].';host='.$config['host'],
                    $config['dbuser'],
                    $config['dbpass']);
    //Setando o timezone por conexão
    $db->query("SET GLOBAL time_zone = 'America/Sao_Paulo'");
} catch(PDOException $e) {
    die($e->getMessage());
    exit();
}

?>