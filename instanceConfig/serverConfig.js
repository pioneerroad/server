// app/config/serverConfig.js
// Exposes connection settings (SSL certificate files and ports) for the Node server
var fs = require('fs');

var settings = {
    options: {
        key : fs.readFileSync('./instanceConfig/SSLCertificate/key.pem'),
        cert: fs.readFileSync('./instanceConfig/SSLCertificate/cert.pem')
    },
    ports: {
        SSLPort: 8090,
        noSSLPort: 8080
    }   
}

module.exports = settings;