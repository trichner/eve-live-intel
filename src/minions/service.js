var dao = require('./dao');
var api = require('./crest');
var Q = require('q');
var Mapper = require('./mapper');
var sanitizer = require('sanitizer');

module.exports = {
    verifyPilot : verifyPilot,
    findPilot : findPilot,
    fetchPilotInfo : fetchPilotInfo,
    createPilot : createPilot,
    createIntelReport : createIntelReport,
    findIntelReportSince : findIntelReportSince,
    updateTracker : updateTracker,
    findLatestTracker : findLatestTracker,
    getIntel : getIntel
};

function fetchPilotInfo(characterID){
    return api.getCharacter(characterID);
}

function verifyPilot(key,verificationCode,id){
    return api.getCharacter(key,verificationCode,id)
        .then(function (character) {
            return dao.findOrCreatePilot(character)
        })
        .then(function (pilot) {
            if(pilot){
                return true;
            }else{
                return Q.reject();
            }
        })
}

function createPilot(accessToken){
    return api.getCharacterId(accessToken)
        .then(function (pilotId) {
            return api.getCharacter(pilotId)
        })
        .then(function (character) {
            return dao.findOrCreatePilot(character)
        })
        .then(function (pilot) {
            if(pilot){
                return pilot;
            }else{
                return new Error('Cannot create pilot.');
            }
        })
}

function findPilot(pilotId){
    return dao.findPilotById(pilotId)
        .then(function (pilot) {
            return Mapper.mapPilotDBVO(pilot);
        });
}

function createIntelReport(pilotId,timestamp,state){
    return dao.findPilotById(pilotId)
        .then(function (pilot) {
            return dao.findLatestTracker(pilot)
                .then(function (tracker) {
                    var systemId = tracker.systemId;
                    if(systemId){
                        if(!timestamp){
                            timestamp = new Date();
                        }
                        console.log("Status:  " + state)
                        console.log("StatusJ: " + JSON.stringify(state))
                        return dao.createIntelReport(pilot,systemId,new Date(timestamp),state);
                    }else{
                        return new Error('No system set.')
                    }
                })
        })
}

function findIntelReportSince(pilot,timestamp){
    if(!timestamp){
        timestamp = new Date(0);
    }
    return dao.findIntelReportSince(new Date(timestamp))
}

function updateTracker(pilotId,eveheaders){
    return dao.findPilotById(pilotId)
        .then(function (pilot) {
            return dao.createTracker(pilot,eveheaders.solarsystem.id,eveheaders.region.id,eveheaders.station.id);
        })
}

function findLatestTracker(pilot){
    return dao.findLatestTracker(pilot)
}

function getIntel(pilotId,timestamp){
    if(!timestamp) {
        timestamp = new Date(0);
    }
    return dao.findPilotById(pilotId)
        .then(function (pilot) {
            return Q.all([findIntelReportSince(pilot,timestamp),findLatestTracker(pilot)])
        })
        .spread(function (reports,tracker) {
            return Mapper.mapIntel(tracker, reports);
        })
}