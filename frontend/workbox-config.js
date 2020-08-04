module.exports = {
  "globDirectory": "public/",
  //Arquivos que estão designados ao Pre-Caching
  "globPatterns": [
    "**/*.{html,json,css,eot,svg,ttf,woff,woff2,js}",
    "src/images/logos/*.{jpg,png}",
    "src/images/products/*.{jpg,png}",
  ],

  //Caminho de destino do SW gerado pelo workbox para Pre-Caching
  "swDest": "public/sw-base.js",

  //Caminho de destino do SW customizado para produção
  "swSrc": "public/sw-source.js",

  //Arquivos a serem ignorados
  "globIgnores": [
    "help.html"
  ]
};