var Q = require('q');

module.exports = {
    mapPilotDBVO : mapPilotDBVO
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