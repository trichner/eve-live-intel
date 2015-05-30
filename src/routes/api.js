var service = require('./../minions/service');
var apiConfig = require('./api-config');
var Q = require('q');
var express = require('express');

var app = express();

apiConfig.setupMiddleware(app);

app.use(function(req, res, next) {
    if(req.eve.solarsystem.id){
        var pilotId = req.session.passport.user;
        service.updateTracker(pilotId, req.eve);
    }
    next();
})

/* GET get self*/
app.get('/me', function(req, res, next) {
    var pilotId = req.session.passport.user;
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

app.post('/intel', function(req, res, next) {
    var systemId   = req.eve.solarsystem.id;
    var timestamp  = req.query.timestamp;
    var state      = req.query.state;
    var pilotId = req.session.passport.user;
    service.updateTracker(pilotId, req.eve);
    service.createIntelReport(pilotId, systemId, timestamp, state)
        .then(function () {
            res.status(200);
        })
        .catch(function (e) {
            next(e);
        })
});

app.get('/intel', function(req, res, next) {
    var timestamp   = req.query.last_update;
    var pilotId = req.session.passport.user;
    service.getIntel(pilotId,timestamp)
        .then(function (intel) {
            res.json(intel);
        })
        .catch(function (e) {
            next(e);
        })
});


module.exports = app;
