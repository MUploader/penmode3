// Custom made iper-simple jsSHA based HS512 validateJWT
// Because jsjws is broken (tell that a correct signature is't valid)
//
// author: TheZ3ro

var WebJWT = {};

(function () {
  WebJWT.base64ToBase64url = function (b64) {
    b64 = b64.replace(/\=/g, '');
    b64 = b64.replace(/\+/g, '-');
    b64 = b64.replace(/\//g, '_');
    return b64;
  };

  WebJWT.base64urlToBase64 = function (b64u) {
    if (b64u.length % 4 == 2) {
      b64u = b64u + '==';
    } else if (b64u.length % 4 == 3) {
      b64u = b64u + '=';
    }
    b64u = b64u.replace(/-/g, '+');
    b64u = b64u.replace(/_/g, '/');
    return b64u;
  };

  WebJWT.utf8ToBase64url = function (s) {
    return WebJWT.base64ToBase64url(window.btoa(s));
  };

  WebJWT.base64urlToUtf8 = function (b64u) {
    return window.atob(WebJWT.base64urlToBase64(b64u));
  };

  WebJWT.verify = function (hash, key, cb) {
    var arr = hash.split('.');
    if (generate(key, arr[0], arr[1]) === arr[2]) {
      return cb(null, JSON.parse(WebJWT.base64urlToUtf8(arr[1])));
    } else {
      return cb(new JsonWebTokenError('invalid signature'));
    }
  };

  WebJWT.sign = function (object, key) {
    var header = '{"alg":"HS512","typ":"JWT"}';
    header = WebJWT.utf8ToBase64url(header);
    var claims = JSON.stringify(object);
    claims = WebJWT.utf8ToBase64url(claims);
    return header + '.' + claims + '.' + generate(key, header, claims);
  };

  var generate = function (key, header, claims) {
    var hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA512, key);
    hmac.update(header + '.' + claims);
    var hash = hmac.finalize();
    hash = hash.toString(CryptoJS.enc.Base64);
    return WebJWT.base64ToBase64url(hash);
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
})();
