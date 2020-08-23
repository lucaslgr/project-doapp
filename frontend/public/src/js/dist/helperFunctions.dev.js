"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var $ = document.querySelector.bind(document);
var $$ = document.querySelectorAll.bind(document);
/**
 * Converte uma string no encode base64 para Int8
 * @param {string} base64String 
 */

function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
/**
 * Converte uma determinada URL em base64 para um arquivo
 * @param {*} dataURI 
 */


function dataURItoBlob(dataURI) {
  var byteString = atob(dataURI.split(',')[1]);
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);

  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  var blob = new Blob([ab], {
    type: mimeString
  });
  return blob;
}
/**
 * Funcao que chama a respectiva mascara passando o respectivo elemento
 */


function mask(o, f) {
  var v_obj = o;
  var v_fun = f;
  setTimeout(function () {
    v_obj.value = v_fun(v_obj.value);
  }, 1);
} //Função para máscara de telefone


function phoneNumber(v) {
  v = v.replace(/\D/g, ""); //Remove tudo o que não é dígito

  v = v.replace(/^(\d\d)(\d)/g, "($1) $2"); //Coloca parênteses em volta dos dois primeiros dígitos   

  v = v.replace(/(\d{4})(\d)/, "$1-$2"); //Coloca hífen entre o quarto e o quinto dígitos 

  if (v.length == 15) {
    v = v.replace('-', '');
    v = v.replace(/(\d{5})(\d{4})/, "$1-$2"); //Coloca hífen entre o quarto e o quinto dígitos
  } else {
    v = v.replace('-', '');
    v = v.replace(/(\d{4})(\d)/, "$1-$2"); //Coloca hífen entre o quarto e o quinto dígitos
  } // if(v.length > 15) {
  //     v = v.substring(0, 15);
  // }


  return v;
}
/**
 * @param {string} email 
 */


function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
/**
 * Checa se um JSON é vazio
 */
// Speed up calls to hasOwnProperty


function isEmpty(obj) {
  var hasOwnProperty = Object.prototype.hasOwnProperty; // null and undefined are "empty"

  if (obj == null) return true; // Assume if it has a length property with a non-zero value
  // that that property is correct.

  if (obj.length > 0) return false;
  if (obj.length === 0) return true; // If it isn't an object at this point
  // it is empty, but it can't be anything *but* empty
  // Is it empty?  Depends on your application.

  if (_typeof(obj) !== "object") return true; // Otherwise, does it have any properties of its own?
  // Note that this doesn't handle
  // toString and valueOf enumeration bugs in IE < 9

  for (var key in obj) {
    if (hasOwnProperty.call(obj, key)) return false;
  }

  return true;
}
/**
 * Valida um latitude e longitude, verificando se ele é null ou vazio
 */


function filterCoordinate(coordinate) {
  return coordinate == 0 || coordinate == null ? false : coordinate;
}