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

    static public function setUnauthorizedError(&$response, $msgUnauthorized = '')
    {
        $response['errors'] = [
            'status_code' => 401,
            'msg' => $msgUnauthorized!=''?$msgUnauthorized:'Nao autorizado'
        ];
    }

    static public function setConflictError(&$response, $msgConflict = ''){
        $response['errors'] = [
            'status_code' => 409,
            'msg' => $msgConflict!=''?$msgConflict:'Informação em conflito.'
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

    static public function setBadRequestError(&$response){
        $response['errors'] = [
            'status_code' => 400,
            'msg' => 'Requisicao nao compreendida ou sintaxe invalida'
        ];
    }

    static public function setUnprocessableEntityError(&$response, $msgUnprocessable = ''){
        $response['errors'] = [
            'status_code' => 422,
            'msg' => $msgUnprocessable!=''?$msgUnprocessable:'A requisicao esta bem formada mas inabilitada para ser seguida devido a erros semanticos'
        ];
    }
}