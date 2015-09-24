// Custom made iper-simple jsSHA based HS512 validateJWT
// Because jsjws is broken (tell that a correct signature is't valid)
//
// author: TheZ3ro

function JWT() {
  this.verify = function(hash, key, cb){
    var arr = hash.split(".");
    if(generate(key,arr[0],arr[1])===arr[2]){
      return cb(null,JSON.parse(b64utoutf8(arr[1])));
    }else{
      return cb(new JsonWebTokenError('invalid signature'));
    }
  }

  this.sign = function(object, key){
    var header = '{"typ":"JWT","alg":"HS512"}';
    header = utf8tob64u(header);
    var claims = JSON.stringify(object);
    claims = utf8tob64u(claims);
    return header+"."+claims+"."+generate(key,header,claims);
  }

  var generate = function(key, header, claims) {
    var hmacObj = new jsSHA("SHA-512","TEXT");
    hmacObj.setHMACKey(key,"TEXT");
    hmacObj.update(header + '.' + claims);
    var out = hmacObj.getHMAC("B64");
    return b64tob64u(out);
  }

  var JsonWebTokenError = function (message, error) {
    Error.call(this, message);
    Error.captureStackTrace(this, this.constructor);
    this.name = 'JsonWebTokenError';
    this.message = message;
    if (error) this.inner = error;
  };

  JsonWebTokenError.prototype = Object.create(Error.prototype);
  JsonWebTokenError.prototype.constructor = JsonWebTokenError;

}
