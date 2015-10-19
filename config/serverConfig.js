// app/config/serverConfig.js
// Exposes connection settings (SSL certificate files and ports) for the Node server
var fs = require('fs');

var settings = {
    options: {
        key : fs.readFileSync(__dirname+'/SSLCertificate/key.pem'),
        cert: fs.readFileSync(__dirname+'/SSLCertificate/cert.pem')
    },
    ports: {
        SSLPort: 443,
        noSSLPort: 80
    }
}

module.exports = settings;