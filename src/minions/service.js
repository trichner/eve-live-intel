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
    findIntelReportSince : findIntelReportSince
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

function createIntelReport(pilot,systemId,timestamp,state){
    return dao.createIntelReport(pilot,systemId,new Date(timestamp),state);
}

function findIntelReportSince(pilot,timestamp){
    if(!timestamp){
        timestamp = new Date(0);
    }
    return dao.findIntelReportSince(new Date(timestamp))
        .then(function (reports) {
            mapped = {'NOT_MAPPED' : 'PLZ MAP ME NAOW'};
            return mapped;
        })
}