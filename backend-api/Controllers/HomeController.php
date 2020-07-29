<?php
/**
 * =============================================================================================
 *                                      Model de exemplo 
 * =============================================================================================
 */

namespace Controllers;

use \Core\Controller;
use \Models\SubscriptionWPN;
use \Util\ErrorsManager;

class HomeController extends Controller{
    public function index() {
        
        $response = [
            'name' => 'Lucas Guimarães',
            'github' => 'https://github.com/lucaslgr',
            'linkedin' => 'https://www.linkedin.com/in/lucas-guimar%C3%A3es-rocha-a30282132/'
        ];

        $status_code = 200;

        $this->returnJson($response, $status_code);
    }

    /**
     * Grava uma subscription de um usuário no BD para poder enviar WebPushNotifications posteriormente
     *
     * @return void
     */
    public function savesubscription()
    {
        $response = [];

        $method = $this->getMethod();
        $data = $this->getRequestData();
        // $authorization = $this->getAuthorization();

        //Respondendo a requisição de pre-flight
        if($method == 'OPTIONS'){
            $this->returnJson($response, 200);
            return;
        }

        //Se o método for diferente do GET retorna erro de método inválido
        if($method != 'POST'){
            ErrorsManager::setMethodNotAllowedError($response);
            $this->returnJson($response);
            return;
        }

        //Verificando se as informações foram enviadas para a API
        if( count($data) < 3                ||
            empty($data['endpoint'])        ||
            empty($data['keys']->p256dh)    ||
            empty($data['keys']->auth)){
            ErrorsManager::setUnprocessableEntityError($response);
            $this->returnJson($response);
            return;
        }

        $subs = new SubscriptionWPN();
        $result = $subs->saveSubscriptionKey((array)$data);

        if(isset($result['errors'])){
            $response['errors'] = $result['errors'];
            $this->returnJson($response);
            return;
        }

        $response['data']['id_subscription'] = $result;
        $this->returnJson($response, 200);
    }
}