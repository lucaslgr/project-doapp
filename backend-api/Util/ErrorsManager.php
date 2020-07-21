<?php

namespace Util;

class ErrorsManager {


    static public function setDatabaseError(&$response)
    {
        $response['errors'] = [
            'status_code' => 500,
            'msg' => 'Erro interno no servidor'
        ];
    }

    static public function setUnauthorizedError(&$response)
    {
        $response['errors'] = [
            'status_code' => 401,
            'msg' => 'Nao autorizado'
        ];
    }

    static public function setForbiddenError(&$response)
    {
        $response['errors'] = [
            'status_code' => 403,
            'msg' => 'Requisicao proibida'
        ];
    }

    static public function setMethodNotAllowedError(&$response){
        $response['errors'] = [
            'status_code' => 405,
            'msg' => 'Metodo HTTP nao pertimitido'
        ];
    }
}