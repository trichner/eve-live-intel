/**
 * Created by Thomas on 13.04.2015.
 */
app.factory('EveIGB', function() {

    function notimplemented(){
        console.log('NOT IMPLEMENTED')
    }

    function nop(){}
    // stubs for all methods
    var EveIGB = {
        openEveMail : nop,
        showInfo : nop,
        showPreview : notimplemented,
        showRouteTo : notimplemented,
        showMap :     nop,
        showFitting : nop,
        showContract : notimplemented,
        showMarketDetails : notimplemented,
        requestTrust : nop,
        setDestination : notimplemented,
        addWaypoint : notimplemented,
        joinChannel : notimplemented,
        joinMailingList : notimplemented,
        createContract :  notimplemented,
        buyType : notimplemented,
        findInContracts : notimplemented,
        addToMarketQuickBar : notimplemented,
        addContact : notimplemented,
        removeContact : notimplemented,
        addCorpContact : notimplemented,
        removeCorpContact : notimplemented,
        block : notimplemented,
        addBounty : notimplemented,
        inviteToFleet : nop,
        startConversation : nop,
        showContracts : notimplemented,
        showOnMap : notimplemented,
        editMember : notimplemented,
        awardDecoration : notimplemented,
        sendMail : nop,
        showContents : notimplemented,
        bookmark : notimplemented
    };
    // If it is the IGB, attach the real methods
    if(typeof CCPEVE !== 'undefined'){
        // We need a lambda function because CCPEVE functions are native
        EveIGB.openEveMail = function(){CCPEVE.openEveMail()};
        EveIGB.showInfo = function(a,b){CCPEVE.showInfo(a,b)};
        EveIGB.showFitting = function(fit){CCPEVE.showFitting(fit)};
        EveIGB.requestTrust = function(url){CCPEVE.requestTrust(url)};
        EveIGB.inviteToFleet = function(characterId){CCPEVE.inviteToFleet(characterId)};
        EveIGB.sendMail = function(characterId,subject,body){CCPEVE.sendMail(characterId,subject,body)};
        EveIGB.startConversation = function (characterId) {CCPEVE.startConversation(characterId)}
    }
    return EveIGB;
});