const ENVIRONMENT = 'development';
 // const ENVIRONMENT = 'production';

let BASE_URL;
let API_BASE_URL;

if(ENVIRONMENT === 'development'){ //!development
    BASE_URL = 'http://localhost/project-doapp/frontend/public';
    API_BASE_URL = 'http://localhost/project-doapp/backend-api/public';
} else { //!production
    BASE_URL = 'BASE_URL_PRODUCTION'; //? CONFIGURAR
    API_BASE_URL = 'BASE_URL_API_PRODUCTION'; //? CONFIGURAR
}
