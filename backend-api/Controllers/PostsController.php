<?php

//!ATENTION - VAPID keys para autenticação das Web Push Notifications
//!'publicKey' => string 'BBiT7Jc-HMy4svIPv2n4-TgJ8AxdQO0kczafH0gcCt3VaH3Cr3Aee4s3mwbcguzrwz_6AJFJY40DG88ivDGqsp4' (length=87)
//!'privateKey' => string 'AMUaVRayDDg9O2Iw8UqUenzVMa8d1DIe0qOvyLGshq8' (length=43)

namespace Controllers;
use \Core\Controller;
use Minishlink\WebPush\Subscription;
use \Models\Posts;
use \Util\ErrorsManager;
use \Minishlink\WebPush\WebPush;
use Models\SubscriptionWPN;

class PostsController extends Controller{
    
    public function getAll()
    {
        $response = [];

        $method = $this->getMethod();
        // $authorization = $this->getAuthorization();

        //Se o método for diferente do GET retorna erro de método inválido
        if($method != 'GET'){
            ErrorsManager::setMethodNotAllowedError($response);
            $this->returnJson($response);
            return;
        }

        $data = $this->getRequestData();
        $limit = $data['limit']??5;
        $page = $data['page']??1;

        $posts = new Posts();

        $result = $posts->getAllPosts($limit, $page);
        if(isset($result['errors'])){
            $response['errors'] = $result['errors'];
            $this->returnJson($response);
            return;
        }

        if(!isset($result) || empty($result) || !count($result)>0){
            //Setando 204 => No Content
            $this->returnJson($response, 200);
            return;
        }

        $response['data'] = $result;
        $this->returnJson($response, 200);
    }

    public function addPost()
    {
        $response = [];

        $method = $this->getMethod();
        $data = $this->getRequestData();
        // $authorization = $this->getAuthorization();
        $name_img = '';

        //Pegando o arquivo SE foi enviada E SE é do tipo .jpg ou .png
        if(isset($_FILES['image']) && preg_match("/(png|jpg|jpeg)$/",$_FILES['image']['type']) === 1){
            //Gerando um nome randomico para a imagem
            $name_img = \substr(md5(time().rand(0,9999)), 0, 10).'.png';
            $url_img = URL_IMG.$name_img;

            \move_uploaded_file(
                $_FILES['image']['tmp_name'],
                $url_img
            );
        }

        //Se o método for diferente do GET retorna erro de método inválido
        if($method != 'POST'){
            ErrorsManager::setMethodNotAllowedError($response);
            $this->returnJson($response);
            return;
        }

        //Verificando se as informações foram enviadas para a API
        if( count($data) < 4                ||
            empty($data['title'])           ||
            empty($data['location'])        ||
            empty($data['whatsapp_contact'])){
            ErrorsManager::setUnprocessableEntityError($response);
            $this->returnJson($response);
            return;
        }

        $posts = new Posts();

        $result = $posts->createNewPost(
            $data['title'],
            $data['location'],
            \BASE_URL.'Images/'.$name_img,
            $data['whatsapp_contact'],
            \floatval($data['longitude']),
            \floatval($data['latitude'])
        );

        if(isset($result['errors'])){
            $response['errors'] = $result['errors'];
            $this->returnJson($response);
            return;
        }

        if(!isset($result) || empty($result)){
            //Setando 204 => No Content
            $this->returnJson($response, 204);
            return;
        }

        //Verifica se foi enviado id que representa o anuncio/post no indexedDB no frontend da aplicacao
        if(isset($data['id']) && !empty($data['id']))
            $response['data']['id_indexedDB'] = $data['id'];

        
        //!Após gravar o post no banco, lançamos as WebPushNotifications para todos os subscribers que temos no BD

        //Montando o array com as informações de Autenticação
        $auth = [
            //// 'GCM' => '', // deprecated and optional, it's here only for compatibility reasons
            'VAPID' => [
                'subject' => 'mailto:lucaslgr1206@gmail.com', // can be a mailto: or your website address
                'publicKey' => 'BBiT7Jc-HMy4svIPv2n4-TgJ8AxdQO0kczafH0gcCt3VaH3Cr3Aee4s3mwbcguzrwz_6AJFJY40DG88ivDGqsp4', // (recommended) uncompressed public key P-256 encoded in Base64-URL
                'privateKey' => 'AMUaVRayDDg9O2Iw8UqUenzVMa8d1DIe0qOvyLGshq8', // (recommended) in fact the secret multiplier of the private key encoded in Base64-URL
                //// 'pemFile' => '', // if you have a PEM file and can link to it on your filesystem
                //// 'pem' => '', // if you have a PEM file and want to hardcode its content
            ],
        ];

        //Instanciando um WebPush
        $webPush = new WebPush($auth);

        //Setando para setar os mesmos VAPID Headers, reusando o JWT para identificação da API
        $webPush->setReuseVAPIDHeaders(true);

        //Instanciando um Model de Subscription
        $subs = new SubscriptionWPN();

        //Pegando todas Subscriptions salvas no Banco de Dados
        $allSubscriptions = $subs->getAllSubscriptions();

        //Percorrendo todas Subscriptions
        foreach ($allSubscriptions as $key => $eachSubs) {

            //Montando a Notificacao a ser enviada para cada Subscription
            //!OBS: O payload é limitado pelos servidores de WPN dos navegadores a ter um tamanho de 4Kbytes, logo, para se enviar imagens enviamos apenas as URLs
            $notification = [
                'subscription' => Subscription::create([
                    'endpoint' => $eachSubs['navigator_endpoint'],
                    'keys' => [
                        'p256dh'=> $eachSubs['key_p256dh'],
                        'auth' => $eachSubs['key_auth'],
                    ]
                ]),
                'payload' => '{
                    "title":"Novo anúncio",
                    "content": "Um novo anúncio foi postado!!!",
                    "openUrl" : "/index.html"
                }'
            ];

            //Enviando a notificação para cada Subscription
            $webPush->sendNotification(
                $notification['subscription'],
                $notification['payload']    
            );
        }

        /**
         * Checando os resultados
         * @var MessageSentReport $report
         */
        foreach ($webPush->flush() as $report) {
            $endpoint = $report->getRequest()->getUri()->__toString();

            if ($report->isSuccess()) {
                // echo "[v] Message sent successfully for subscription {$endpoint}.";
                $response['data']['reports_push_notifications'][] = "[v] Message sent successfully for subscription {$endpoint}.";
            } else {
                // echo "[x] Message failed to sent for subscription {$endpoint}: {$report->getReason()}";
                $response['data']['reports_push_notifications'][] = "[x] Message failed to sent for subscription {$endpoint}: {$report->getReason()}";
            }
        }

        $response['data']['id_post'] = $result;
        $this->returnJson($response, 200);
    }
}