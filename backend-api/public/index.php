<?php
    use Core\Core;

    //Setando o fuso horário de São Paulo
    date_default_timezone_set('America/Sao_Paulo');

    //Iniciando a $_SESSION
    session_start();

    //Liberando todos remetentes de requisições no CORS
    header("Access-Control-Allow-Origin: https://lgrdev.com"); 
    //Liberando todos os verbos HTTP
    header("Access-Control-Allow-Methods: *");
    //Liberando o header Content-Type
    header("Access-Control-Allow-Headers: Content-Type, Accept, Authorization, X-Requested-With");

    //Importando os arquivos de setup
    require '../config.php';
    require '../routes.php';
    require '../vendor/autoload.php';

    //Iniciando a aplicacão
    $c = new Core();
    $c->run();
?>