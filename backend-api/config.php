<?php
/**
 * =============================================================================================
 *                Arquivo de configuração do banco de dados/PDO e da const BASE_URL 
 * =============================================================================================
 */

    require 'environment.php';
    
    if (ENVIRONMENT == 'development') {
        define('BASE_URL', 'http://localhost/project-barganhapp/backend-api/public/');
        define('URL_IMG', $_SERVER['DOCUMENT_ROOT']."/project-barganhapp/backend-api/public/Images/");
        $config['dbname'] = 'project-barganhapp';
        $config['host'] = '127.0.0.1'; //ou 'localhost'
        $config['dbuser'] = 'root';
        $config['dbpass'] = '';
    }
    else { //Se não => ENVIRONMENT = 'production'
        define('BASE_URL', 'https://lgrdev.com/projects/barganhapp/backend-api/public/');
        define('URL_IMG', $_SERVER['DOCUMENT_ROOT']."/projects/barganhapp/backend-api/public/Images/");
        $config['dbname'] = 'u756318379_barganhapp';
        $config['host'] = 'localhost';
        $config['dbuser'] = 'u756318379_admin';
        $config['dbpass'] = 'dsaA#dAS13ffd12';
    }

    global $db;

    try {
        $db = new PDO('mysql:dbname='.$config['dbname'].';host='.$config['host'],
                        $config['dbuser'],
                        $config['dbpass']);
    } catch(PDOException $e) {
        die($e->getMessage());
        exit();
    }

?>