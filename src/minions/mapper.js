var Q = require('q');

module.exports = {
    mapPilotDBVO : mapPilotDBVO,
    mapIntelReportDBVO : mapIntelReportDBVO,
    mapIntel : mapIntel
}

// Response:
/*
 {
 "error": false,
 "serverTime": "2015-05-28 21:39:59",
 "system_id": 30002074,
 "intels": [
 {
 "seen_at": "2015-05-28 20:41:41",
 "status": 1,
 "system_id": 30002074
 },
 {
 "seen_at": "2015-05-28 21:38:58",
 "status": 0,
 "system_id": 30002074
 }
 ],
 "trackers": []
 }
 */
/*
 var IntelReport = sequelize.define('intel_report', {
 systemId: {
 type: Sequelize.STRING
 },
 timestamp: {
 type: Sequelize.DATE
 },
 status: {
 type: Sequelize.ENUM('CLEAR','HOSTILE')
 }
 }, {});
 */

function mapIntel(tracker,reports){
    var mapped = {};
    var preports = reports.map(function (report) {
        return mapIntelReportDBVO(report);
    });
    return Q.all(preports)
        .then(function (mreports) {
            mapped.intels = mreports;
            mapped.system_id = tracker.systemId;
            return mapped;
        })
}

function mapIntelReportDBVO(report){
    var mapped = {};
    mapped.status       = mapIntelReportState(report.status);
    mapped.seen_at      = report.timestamp.getTime();
    mapped.system_id    = report.systemId;
    return report.getReporter()
        .then(function (pilot) {
            mapped.reporter = pilot.name;
            return mapped;
        });
}

function mapIntelReportState(status){
    switch (status) {
        case "CLEAR":
            return 0;
            break;
        case "HOSTILE":
            return 1;
            break;
        default:
            console.warn("NOT MAPPED!!!")
            break;
    }
    return -1;
}

function mapPilotDBVO(pilot){
    var mapped = {};
    mapped.characterId  = pilot.id;
    mapped.characterName    = pilot.name;
    return pilot.getCorp()
        .then(function (corp) {
            mapped.corporationId    = corp.id;
            mapped.corporationName  = corp.name;
            return corp.getAlliance();
        })
        .then(function (alliance) {
            if(alliance){
                mapped.allianceId   = alliance.id;
                mapped.allianceName = alliance.name;
            }
            return mapped;
        })
}