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
    $routes['/posts/{iduser}']          = '/posts/getPostsByUser/:iduser'; //GET
    $routes['/posts/del/{idpost}']      = '/posts/deletePost/:idpost'; //GET
    $routes['/posts']                   = '/posts/getAll'; //GET
    $routes['/savesubscription']        = '/home/savesubscription'; //POST
    $routes['/user/register']           = '/user/register';
    $routes['/user/login']              = '/user/login';
    $routes['/user/logout']             = '/user/logout';
    $routes['/']                        = '/home/index';
    // $routes['/generatekeys']            = '/home/generateVapidKeys'; //GET
?>