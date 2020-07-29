<?php
/**
 * =============================================================================================
 *                                 Arquivo de configuração das ROTAS
 * =============================================================================================
 */

    global $routes;
    $routes = array();

    //Cofiguração das rotas
    $routes['/posts/new']               = '/posts/addPost'; //POST
    $routes['/posts']                   = '/posts/getAll'; //GET
    $routes['/savesubscription']        = '/home/savesubscription'; //POST
    // $routes['/generatekeys']         = '/posts/generateVapidKeys'; //GET
    $routes['/']                        = '/home/index';
?>