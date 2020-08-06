<?php
/**
 * =============================================================================================
 *                Arquivo de configuração do banco de dados/PDO e da const BASE_URL 
 * =============================================================================================
 */

    require 'environment.php';
    
    if (ENVIRONMENT == 'development') {
        define('BASE_URL', 'http://localhost/project-doapp/backend-api/public/');
        define('URL_IMG', $_SERVER['DOCUMENT_ROOT']."/project-doapp/backend-api/public/Images/");
        $config['dbname'] = 'project-doapp';
        $config['host'] = '127.0.0.1'; //ou 'localhost'
        $config['dbuser'] = 'root';
        $config['dbpass'] = '';
    }
    else { //Se não => ENVIRONMENT = 'production'
        define('BASE_URL', 'https://lgrdev.com/projects/doapp/backend-api/public/');
        define('URL_IMG', $_SERVER['DOCUMENT_ROOT']."/projects/doapp/backend-api/public/Images/");
        $config['dbname'] = 'u756318379_doapp';
        $config['host'] = 'localhost';
        $config['dbuser'] = 'u756318379_doapp';
        $config['dbpass'] = '8X$ow$VoE68';
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