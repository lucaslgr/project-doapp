module.exports = {
  "globDirectory": "public/",
  "globPatterns": [
    "**/*.{html,json,css,eot,svg,ttf,woff,woff2,js}",
    // "src/images/**/*.{jpg,png}",
    "src/images/logos/*.{jpg,png}",
    "src/images/products/*.{jpg,png}",
  ],
  "swDest": "public/sw-workbox.js",
  "globIgnores": [
    "help.html"
  ]
};