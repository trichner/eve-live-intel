/**
 * Created by Thomas on 11.04.2015.
 */

//---- Init DB Connection
var Sequelize = require('sequelize');
var Q = require('q');
var minions = require('./Minions');

var sequelize = new Sequelize(
    'mysql://eveintel:1234@localhost:3306/eveintel', // HARDCODED for now
    {
        logging: false,
        pool: {
            // Set maxIdleTime to 10 seconds. Otherwise, it kills transactions that are open for long.
            maxIdleTime: 10000
        }
    });


var Corp = sequelize.define('corp', {
    id: {
        type: Sequelize.STRING
    },
    name: {
        type: Sequelize.STRING
    }
}, {});

var Alliance = sequelize.define('alliance', {
    id: {
        type: Sequelize.STRING
    },
    name: {
        type: Sequelize.STRING
    }
}, {});

var Pilot = sequelize.define('pilot', {
    id: {
        type: Sequelize.STRING
    },
    name: {
        type: Sequelize.STRING
    }
},{});


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


//---- Relations
Corp.belongsTo(Alliance);
Pilot.belongsTo(Corp);
IntelReport.belongsTo(Pilot, {as: 'reporter'})
sequelize.sync();

module.exports = {
    connect : connect,
    findOrCreatePilot : findOrCreatePilot,
    findAllPilots : findAllPilots,
    findPilotById : findPilotById,
    createIntelReport : createIntelReport,
    findIntelReportSince : findIntelReportSince
}

function connect(){
    return sequelize.sync();
}

function assertObject(obj){
    return obj ? Q.fulfill(obj) : Q.reject(new Error('Object not valid: ' + obj));
}

function findPilotById(id){
    return Pilot.find({ where: {id: id}, include: [{ all: true, nested: true }]})
        .then(assertObject);
}

function findAllPilots() {
    // EAGER
    return Pilot.findAll({ include: [{ all: true, nested: true }]})
}

function findOrCreatePilot(pilot){
    // not all pilots have alliances!
    var promises = [];
    promises.push(Pilot.findOrCreate({ where: {id: pilot.characterID.content} ,defaults: {name: pilot.characterName.content}}));
    promises.push(Corp.findOrCreate({ where: {id: pilot.corporationID.content} ,defaults: {name: pilot.corporation.content}}));
    if(pilot.allianceID && pilot.allianceID!='0') {
        promises.push(Alliance.findOrCreate({where: {id: pilot.allianceID.content}, defaults: {name: pilot.alliance.content}}));
    }
    return Q.all(promises).spread(function (pilot,corp,alliance) {
        var promises = [];
        pilot = pilot[0];
        corp  = corp[0];
        if(alliance){
            alliance = alliance.shift();
            promises.push(corp.setAlliance(alliance))
        }
        promises.push(pilot.setCorp(corp));
        return Q.all(promises).then(function () {
            return pilot;
        })
    })
}

function createIntelReport(pilot,systemId,timestamp,state){
    return IntelReport.create({
            systemId : systemId,
            timestamp: timestamp,
            state: state
        })
        .then(function (intelReport) {
            return intelReport.setReporter(pilot);
        })
}

function findIntelReportSince(timestamp){
    return IntelReport.find({ where: {timestamp: {$gt: timestamp}}});
}