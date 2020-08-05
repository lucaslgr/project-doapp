const ENVIRONMENT = 'development';
// const ENVIRONMENT = 'production';

let BASE_URL;
let API_BASE_URL;

if(ENVIRONMENT === 'development'){ //!development
    BASE_URL = 'http://localhost/project-barganhapp/frontend/public';
    API_BASE_URL = 'http://localhost/project-barganhapp/backend-api/public';
} else { //!production
    BASE_URL = 'https://lgrdev.com/projects/barganhapp';
    API_BASE_URL = 'https://lgrdev.com/projects/barganhapp/backend-api/public';
}