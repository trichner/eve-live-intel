/**
 * Created by Thomas on 16.04.2015.
 */
/**
 * Created by Thomas on 11.04.2015.
 */
var neow = require('neow');
var Q    = require('q');
var unirest = require('unirest');

/*
 {
 name: 'Thomion',
 characterID: '698922015',
 corporationName: 'Deep Core Mining Inc.',
 corporationID: '1000006',
 allianceID: '0',
 allianceName: '',
 factionID: '0',
 factionName: '' }

 */
var client = new neow.EveClient();

module.exports = {
    getCharacter : function(characterID){
        return client.fetch('eve:CharacterInfo',{characterID:characterID});
    },
    getCharacterId : getCharacterId,
    extractShip:extractFit
}

function getCharacterId(accessToken){
    var deferred = Q.defer();
    unirest.get('https://login.eveonline.com/oauth/verify')
        .header('Accept', 'application/json')
        .header('Authorization', 'Bearer ' + accessToken)
        .end(function (res){
            console.log('Verify Body' + JSON.stringify(res.body))
            deferred.resolve(res.body.CharacterID);
        });
    return deferred.promise;
}

var fittingPattern  = /.*<url=fitting:([0-9:;]*)>(.*)<\/url>.*/i;
var shipTypePattern = /.*fitting:([0-9]*):.*/i;
function extractFit(str){
    var matches = fittingPattern.exec(str);
    var shipDNA,shipName,shipType;
    if(matches){
        shipDNA  = matches[1];
        shipName = matches[2];
    }
    var matches = shipTypePattern.exec(str);
    if(matches){
        shipType  = matches[1];
    }
    return {
        dna : shipDNA,
        name: shipName,
        type: shipType
    }
}


var characterPattern  = /.*<url=showinfo:[0-9]*\/\/([0-9]*)>(.*)<\/url>.*/i;
function extractCharacter(str){
    var matches = characterPattern.exec(str);
    var id,name;
    if(matches){
        id  = matches[1];
        name = matches[2];
    }
    return {
        id : id,
        name: name
    }
}
