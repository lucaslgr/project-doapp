<?php

namespace Controllers;
use \Core\Controller;
use \Minishlink\WebPush\Subscription;
use \Models\Posts;
use \Models\Users;
use \Util\ErrorsManager;
use \Minishlink\WebPush\WebPush;
use \Models\SubscriptionWPN;

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
        $term = (isset($data['term']) && $data['term']!='')?$data['term']:'';

        $posts = new Posts();

        $result = $posts->getAllPosts($limit, $page, $term);
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

    public function getPostsByUser($id_user)
    {
        $response = [];

        $id_user = intval($id_user);

        $method = $this->getMethod();
        $authorization = $this->getAuthorization();

        //Se o método for diferente do GET retorna erro de método inválido
        if($method != 'GET'){
            ErrorsManager::setMethodNotAllowedError($response);
            $this->returnJson($response);
            return;
        }

        //Verificando se o JWT NÃO foi enviado no authorization no header da request
        if(!isset($authorization) || empty($authorization)){
            ErrorsManager::setUnauthorizedError($response);
            $this->returnJson($response);
            return;
        }

        $users = new Users();
        //Checa se o JWT NÃO é válido
        if($users->validaJWT($authorization) === false){
            ErrorsManager::setUnauthorizedError($response);
            $this->returnJson($response);
            return;
        }

        //Checando se o JWT pertence ao usuário no qual deseja pegar os POSTS
        //OBS: Apenas o próprio usuário pode ver seus próprios POSTS separadamente
        if($users->getLoggedIdUser() !== $id_user){
            ErrorsManager::setUnauthorizedError($response);
            $this->returnJson($response);
            return;
        }

        $posts = new Posts();

        $result = $posts->getAllPostsByUser($id_user);
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
        $authorization = $this->getAuthorization();

        //Se o método for diferente do GET retorna erro de método inválido
        if($method != 'POST'){
            ErrorsManager::setMethodNotAllowedError($response);
            $this->returnJson($response);
            return;
        }
        
        //Verificando se o JWT NÃO foi enviado no authorization no header da request
        if(!isset($authorization) || empty($authorization)){
            ErrorsManager::setUnauthorizedError($response);
            $this->returnJson($response);
            return;
        }

        $users = new Users();
        //Checa se o JWT NÃO é válido
        if($users->validaJWT($authorization) === false){
            ErrorsManager::setUnauthorizedError($response);
            $this->returnJson($response);
            return;
        }

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
            $users->getLoggedIdUser(),
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
                'publicKey' => PUBLIC_KEY_VAPID, // (recommended) uncompressed public key P-256 encoded in Base64-URL
                'privateKey' => PRIVATE_KEY_VAPID, // (recommended) in fact the secret multiplier of the private key encoded in Base64-URL
                //// 'pemFile' => '', // if you have a PEM file and can link to it on your filesystem
                //// 'pem' => '', // if you have a PEM file and want to hardcode its content
            ],
        ];

        //Instanciando um WebPush
        $webPush = new WebPush($auth);

        //Setando true para reutilizar os mesmos VAPID Headers, reusando o JWT para identificação da API
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
                    "title":"Uma nova doação foi postada!",
                    "content": "'.$data['title'].'",
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

    public function deletePost($id_post)
    {
        $response = [];

        $id_user = intval($id_post);

        $method = $this->getMethod();
        $authorization = $this->getAuthorization();

        //Se o método for diferente do GET retorna erro de método inválido
        if($method != 'DELETE'){
            ErrorsManager::setMethodNotAllowedError($response);
            $this->returnJson($response);
            return;
        }

        //Verificando se o JWT NÃO foi enviado no authorization no header da request
        if(!isset($authorization) || empty($authorization)){
            ErrorsManager::setUnauthorizedError($response);
            $this->returnJson($response);
            return;
        }

        $users = new Users();
        //Checa se o JWT NÃO é válido
        if($users->validaJWT($authorization) === false){
            ErrorsManager::setUnauthorizedError($response);
            $this->returnJson($response);
            return;
        }

        $posts = new Posts();

        $result = $posts->deletePostById($users->getLoggedIdUser(), $id_post);
        if(isset($result['errors'])){
            $response['errors'] = $result['errors'];
            $this->returnJson($response);
            return;
        }

        if($result === true)
            $result = [ 'msg' => 'Anúncio deletado com sucesso!'];

        $response['data'] = $result;
        $this->returnJson($response, 200);
        return;
    }
}