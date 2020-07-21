<?php
/**
 * =============================================================================================
 *                                 Arquivo de configuração das ROTAS
 * =============================================================================================
 */

    global $routes;
    $routes = array();

    //Cofiguração das rotas
    $routes['/posts'] = '/posts/getall';
    $routes['/'] = '/home/index';
?>