<?php

namespace Util;

class JWT
{
    //Chave secreta do jwt_token para usar na criptografia
    private string $secret_key;

    public function __construct()
    {
        $this->secret_key = PRIVATE_KEY_JWT;
    }
    //Criando um JWT com criptografia HS256 
    public function create(array $data_payload): string
    {
        //Passo 1: urlEncode no JSON do header
        //Passo 2: urlEncode no JSON do payload
        //Passo 3: Gerar a signature criptografada utilizando a chave secreta setada
        //Passo 4: urlEncode na signature
        //Passo 5: Junta as 3 partes => header.payload.signature

        //Definindo o header
        $header = json_encode(array(
            "type" => "JWT",
            "alg" => "HS256"
        ));
        $payload = json_encode($data_payload);
        
        //HASH do header e do Payload
        $base_header = $this->base64url_encode($header);
        $base_payload = $this->base64url_encode($payload);

        //Tipo da criptografia alg->HS256->sha256
        //OBS: O ultimo parametro como true é para ele manter letras maiúsculas e minusculas
        $signature = hash_hmac("sha256",$base_header.'.'.$base_payload, $this->secret_key, true);
        $base_signature = $this->base64url_encode($signature);

        //Montando o JWT
        $jwt = $base_header.'.'.$base_payload.'.'.$base_signature;
        return $jwt;
    }
    public function validate(string $token)
    {
        // Passo 1: Verificar se o TOKEN tem 3 partes: HEADER, PAYLOAD e SIGNATURE
        // Passo 2: Bater a assinatura com os dados
        
        $response = array();
        $jwt_split = explode('.', $token);
        //Conferindo passo 1
        if (count($jwt_split) == 3) {
            //Gerando a assinatura com as informações do HEADER($jwt_split[0]) e do PAYLOAD($jwt_split[1]) do token
            $signature = hash_hmac("sha256", $jwt_split[0].'.'.$jwt_split[1], $this->secret_key, true);
            
            $base_signature = $this->base64url_encode($signature);
            //Conferindo o passo 2
            if ($base_signature == $jwt_split[2]) {
                
                //Recuperando os dados do PAYLOAD com decode
                $response = json_decode($this->base64url_decode($jwt_split[1]));
                return $response;
            }
        } else
            return false;
    }
    //https://www.php.net/manual/pt_BR/function.base64-encode.php
    //Funções para base64URL que não tem +, nem / e nem =
    private function base64url_encode($data)
    {
        return rtrim(strtr(base64_encode($data),'+/','-_'),'=');
    }
    private function base64url_decode($data)
    {
        return base64_decode(strtr($data,'-_','+/').str_repeat('=',3-(3+strlen($data))%4));
    }
}