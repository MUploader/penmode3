var crypto = require('crypto');
var shasum = crypto.createHash('sha512');

var gh = function(login){
  shasum.update(login.user,'utf8');
  shasum.update(login.pass,'utf8');
  return shasum.digest('base64')
}

module.exports = gh;
