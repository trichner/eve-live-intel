var service = require('./../minions/service');
var apiConfig = require('./api-config');
var Q = require('q');
var express = require('express');

var app = express();

apiConfig.setupMiddleware(app);

/* GET get self*/
app.get('/me', function(req, res, next) {
    var pilotId = req.session.pilotId;
    console.log('Session: ' + JSON.stringify(req.session))
    service.findPilot(pilotId)
        .then(function (pilot) {
            pilot.eve = req.eve;    //add request headers
            res.json(pilot);
        })
        .catch(function (e) {
            next(e);
        })
});

/* POST verify pilots with API keys*/
app.post('/verify', function(req, res, next) {
  var key   = req.body.key;
  var vCode = req.body.vCode;
  var rememberMe = req.body.rememberMe;
  var pilotId = req.eve.char.id;
  if(key && vCode && pilotId){
    service.verifyPilot(key,vCode,pilotId)
        .then(function (isVerified) {
            if(isVerified){
                req.session.verified = true;
                req.session.pilotId = pilotId; // implicitly authenticated
                var maxAge = 3600000*12; // half day
                if(rememberMe){
                    maxAge *= 730; // one year
                }
                req.session.cookie.maxAge = maxAge;
                res.status(204).end();
                return Q.fulfill();
            }else{
                return Q.reject();
            }
        })
        .catch(function (e) {
            var err = new Error('Not Authorized')
            err.status = 401;
            next(err);
        });
  }else{
    var err = new Error('Bad Request')
    err.status = 400;
    next(err);
  }

});


module.exports = app;
