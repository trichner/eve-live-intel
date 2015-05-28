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
app.post('/intel', function(req, res, next) {
    var systemId   = req.eve.solarsystem.id;

});

/* POST verify pilots with API keys*/
app.get('/intel', function(req, res, next) {
    var key   = req.body.key;
    var vCode = req.body.vCode;

});


module.exports = app;
