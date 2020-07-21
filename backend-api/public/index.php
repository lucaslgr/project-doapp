<?php
    use Core\Core;

    //Iniciando a $_SESSION
    session_start();

    //Liberando todos remetentes de requisições no CORS
    header("Access-Control-Allow-Origin: *"); 
    //Liberando todos os verbos HTTP
    header("Access-Control-Allow-Methods: *");
    //Liberando o header Content-Type
    header("Access-Controll-Allow-Headers: Content-Type");

    //Importando os arquivos de setup
    require '../config.php';
    require '../routes.php';
    require '../vendor/autoload.php';

    //Iniciando a aplicacão
    $c = new Core();
    $c->run();
?>