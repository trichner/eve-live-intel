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

app.post('/intel', function(req, res, next) {
    var systemId   = req.eve.solarsystem.id;
    var timestamp  = req.query.timestamp;
    var state      = req.query.state;
    service.createIntelReport(pilot, systemId, timestamp, state)
        .then(function () {
            res.status(200);
        })
        .catch(function (e) {
            next(e);
        })
});

app.get('/intel', function(req, res, next) {
    var timestamp   = req.query.last_update;
    var pilot = req.session.passport.user;
    service.findIntelReportSince(pilot,timestamp)
        .then(function (reports) {
            reports.eve = req.eve;
            res.json(reports);
        })
        .catch(function (e) {
            next(e);
        })
});


module.exports = app;
