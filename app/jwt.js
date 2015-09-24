// Custom made iper-simple node.js crypto based HS512 validateJWT
// Because node-jsonwebtoken is broken (tell that a correct signature is't valid)
//
// author: TheZ3ro
var crypto = require('crypto');

var generate = function(key, header, claims) {
  var hmac = crypto.createHmac('sha512', key);
  hmac.update(header + '.' + claims);
  var out = hmac.digest('base64');
  return b64tob64u(out);
}

var verify = function(hash, key, cb){
  var arr = hash.split(".");
  if(generate(key,arr[0],arr[1])===arr[2]){
    return cb(null,JSON.parse(b64utoutf8(arr[1])));
  }else{
    return cb(new JsonWebTokenError('invalid signature'));
  }
}

var sign = function(object, key){
  var header = '{"typ":"JWT","alg":"HS512"}';
  header = utf8tob64url(header);
  var claims = JSON.stringify(object);
  claims = utf8tob64u(claims);
  return header+"."+claims+"."+generate(key,header,claims);
}

module.exports = {
  "verify": verify,
  "sign": sign
};

var JsonWebTokenError = function (message, error) {
  Error.call(this, message);
  Error.captureStackTrace(this, this.constructor);
  this.name = 'JsonWebTokenError';
  this.message = message;
  if (error) this.inner = error;
};

JsonWebTokenError.prototype = Object.create(Error.prototype);
JsonWebTokenError.prototype.constructor = JsonWebTokenError;

var utf8tob64u = function(s){
  return b64tob64u(new Buffer(s, 'utf8').toString('base64'));
}

var b64utoutf8 = function(s){
  return new Buffer(b64utob64(s), 'base64').toString('utf8');
}

// ==== base64 / base64url ================================
/**
 * convert a Base64 encoded string to a Base64URL encoded string.<br/>
 * Example: "ab+c3f/==" &rarr; "ab-c3f_"
 * @param {String} s Base64 encoded string
 * @return {String} Base64URL encoded string
 */
function b64tob64u(s) {
    s = s.replace(/\=/g, "");
    s = s.replace(/\+/g, "-");
    s = s.replace(/\//g, "_");
    return s;
}

/**
 * convert a Base64URL encoded string to a Base64 encoded string.<br/>
 * Example: "ab-c3f_" &rarr; "ab+c3f/=="
 * @param {String} s Base64URL encoded string
 * @return {String} Base64 encoded string
 */
function b64utob64(s) {
    if (s.length % 4 == 2) s = s + "==";
    else if (s.length % 4 == 3) s = s + "=";
    s = s.replace(/-/g, "+");
    s = s.replace(/_/g, "/");
    return s;
}
