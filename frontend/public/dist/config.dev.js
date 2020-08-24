"use strict";

var ENVIRONMENT = 'development'; // const ENVIRONMENT = 'production';

var BASE_URL;
var API_BASE_URL;

if (ENVIRONMENT === 'development') {
  //!development
  BASE_URL = 'http://localhost/project-doapp/frontend/public';
  API_BASE_URL = 'http://localhost/project-doapp/backend-api/public';
} else {
  //!production
  BASE_URL = 'https://lgrdev.com/projects/doapp';
  API_BASE_URL = 'https://lgrdev.com/projects/doapp/backend-api/public';
}