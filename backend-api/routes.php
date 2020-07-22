<?php
/**
 * =============================================================================================
 *                                 Arquivo de configuração das ROTAS
 * =============================================================================================
 */

    global $routes;
    $routes = array();

    //Cofiguração das rotas
    $routes['/posts/new'] = '/posts/addpost'; //POST
    $routes['/posts'] = '/posts/getall'; //GET
    $routes['/'] = '/home/index';
?>