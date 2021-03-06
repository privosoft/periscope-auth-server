'use strict';
var moment = require('moment');
var jwt = require('jwt-simple');
var config = require('../config');
exports.createJWT = function(user, seconds){
    var payload = {
        sub: user._id,
        iat: moment().unix(),
        exp: seconds? moment().add(seconds, 'seconds').unix() :moment().add(1, 'days').unix()
    };
    return jwt.encode(payload, config.TOKEN_SECRET);
}

exports.handleError = function (res, err) {
    return res.send(400, err);
}


exports.ensureAuthenticated = function(req, res, next) {
    if (!req.headers.authorization && req.method=="OPTIONS") {
        return res.status(200).send({});
    }

  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
  }
  var token = req.headers.authorization.split(' ')[1];

  var payload = null;
  try {
    payload = jwt.decode(token, config.TOKEN_SECRET);
  }
  catch (err) {
    return res.status(401).send({ message: err.message });
  }

  if (payload.exp <= moment().unix()) {
    return res.status(401).send({ message: 'Token has expired' });
  }
  req.user = payload.sub;
  next();
}