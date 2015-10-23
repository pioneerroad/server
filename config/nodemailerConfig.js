var signer = require('nodemailer-dkim').signer;
var fs = require('fs');
var nodemailer = require('nodemailer');

 var options = {
        service: 'gmail',
        auth: {
          user: 'no-reply@pioneerroad.com.au',
          pass: '>2rmP5qa'
        }
  };

  var SMTPTransporter = nodemailer.createTransport(options);

  SMTPTransporter.use('stream', signer({
    domainName: 'pioneerroad.com.au',
    keySelector: 'google',
    privateKey: fs.readFileSync(__dirname+'/SSLCertificate/dkim-private.pem')
  }));

module.exports = SMTPTransporter;
