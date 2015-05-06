// app/config/serverConfig.js
// Exposes connection settings (SSL certificate files and ports) for the Node server
var fs = require('fs');

var settings = {
    options: {
        key : fs.readFileSync(__dirname+'/SSLCertificate/key.pem'),
        cert: fs.readFileSync(__dirname+'/SSLCertificate/cert.pem')
    },
    ports: {
        SSLPort: 8090,
        noSSLPort: 8081
    }
}

module.exports = settings;
