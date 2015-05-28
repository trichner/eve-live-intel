var app = angular.module('evewt', ['ui-notification','ngCookies']);
app.controller('wt-list',[ '$scope','$http','$location','$interval','$window','API','EveIGB','Notification','Minions','$cookieStore',function ($scope,$http,$location,$interval,$window,API,EveIGB,Notification,Minions,$cookieStore) {

    //=== Vars
    $scope.waitlistVO = null;
    $scope.waitlists = {waitlists:[]};
    $scope.shipDNA = '';
    $scope.apiKey = '';
    $scope.apiVCode = '';
    $scope.remeberMe = true;

    $scope.asciiHead = '-== VG Fleet ==-';
    $scope.asciiFoot = '-==          ==-';
    $scope.waitlistTxt = '';

    $scope.stats = '';

    var RoleID = {
        DD : 'DD',
        L4 : 'L4',
        L5 : 'L5',
        S : 'S',
        P : 'P',
        SH : 'SH',
        OGB : 'OGB'
    }

    var eveMail = {
        "subject" : "Bad Fitting",
        "body" : "Your fit is bad and you should feel bad!"
    };

    $scope.roles = [
        {name: 'DD',     type: 'Damage Dealer', id:RoleID.DD},
        {name: 'Logi4',  type: 'Logistics' , id:RoleID.L4},
        {name: 'Logi5',  type: 'Logistics' , id:RoleID.L5},
        {name: 'Scout/Hacker',    type: 'Off-grid', id:RoleID.SH},
        {name: 'Scout',  type: 'Off-grid', id:RoleID.S},
        {name: 'Picket', type: 'Off-grid', id:RoleID.P},
        {name: 'OGB',    type: 'Off-grid', id:RoleID.OGB}
    ]

    $scope.mRole = $scope.roles[0]

    $scope.authenticated = false;
    $scope.isIGB = (typeof CCPEVE !== 'undefined');
    console.log('You are' + ($scope.isIGB ? '' : ' not') + ' in Eve IGB')
    $scope.window = $window;

    $scope.getWaitlistId = function () {
        var waitlistId = Minions.getQueryParam('waitlistId');
        if(waitlistId){
            $cookieStore.put('waitlistId',waitlistId);
        }else{
            waitlistId = $cookieStore.get('waitlistId');
        }
        return waitlistId;
    }

    $scope.isOwner = function () {
        return $scope.waitlistVO.ownerId == $scope.me.characterId;
    }

    $scope.forwardMe = function(){
        
    }

    $scope.isItemOwner = function(item) {
        return $scope.waitlistVO.ownerId == item.characterId;
    }

    $scope.postFit = function(){
        API.postFit($scope.waitlistVO.waitlistId,$scope.shipDNA,$scope.mRole.id)
            .then(function (data) {
                $scope.refreshWL();
                Notification.success("Successfully x-ed up")
                $scope.shipDNA = '';
            }, function () {
                Notification.error("Cannot x up, logged in? on waitlist?")
            })
    };

    $scope.newWaitlist = function () {
        return API.newWaitlist()
            .then(function (waitlist) {
                $scope.updateWL(waitlist);
                Notification.success("Successfully created waitlist")
            }, function () {
                Notification.error("Cannot create waitlist, logged in?")
            })
    };

    $scope.leaveWaitlist = function () {
        $cookieStore.remove('waitlistId');
        var url = location.protocol + "//" + location.host + '/nemesis/home.html';
        window.open(url,'_self');
    };

    function stripQueryFromUrl(url){
        return url.substring(0,url.indexOf('?'))
    }

    //=== Functions
    $scope.updateWL = function(waitlistVO){
        $scope.waitlistVO = waitlistVO;
        // add ascii list
        $scope.waitlistTxt = Minions.waitlist2ascii(waitlistVO,$scope.asciiHead,$scope.asciiFoot);
        $scope.stats = Minions.waitlistStatsTxt(waitlistVO);
    };

    $scope.refreshWL = function(){
        API.getWaitlist($scope.waitlistVO.waitlistId)
            .then(function (data) {
                $scope.updateWL(data);
            })
    };

    $scope.showCharInfo = function(item){
        EveIGB.showInfo(1377, item.characterId);
    };

    $scope.showFitting = function(item){
        EveIGB.showFitting(item.shipDNA);
    };

    $scope.showCorporation = function(item){
        EveIGB.showInfo(2,item.corporationId);
    };
    $scope.showAlliance = function(item){
        EveIGB.showInfo(16159,item.allianceId);
    };

    $scope.fleetInvite = function(item){
        EveIGB.inviteToFleet(item.characterId)
        Notification.success("Invited " + item.characterName + " to fleet")
    };

    $scope.startConversation = function(item){
        EveIGB.startConversation(item.characterId)
        Notification.success("Invited " + item.characterName + " to conversation")
    };

    $scope.sendMail = function(item){
        EveIGB.sendMail(item.characterId,eveMail.subject,eveMail.body)
        Notification.success("Sent " + item.characterName + " an email")
    };

    $scope.makeBoss = function(item){
        API.makeBoss($scope.waitlistVO.waitlistId,item.characterId)
            .then(function () {
                Notification.success("Made " + item.characterName + " waitlist manager")
            }, function () {
                Notification.error('Failed to make ' + item.characterName + ' boss');
            })
    };

    $scope.removeItem = function(item){
        API.removeItem($scope.waitlistVO.waitlistId,item.itemId)
            .then(function () {
                $scope.refreshWL();
                Notification.success("Removed " + item.characterName + " from the waitlist")
            })
            .then(null,function () {
                Notification.error('failed to remove item :(');
            })
    };

    $scope.logout = function () {
        API.logout()
            .then(function () {
                Notification.success("Logged out")
            })
            .then(null,function () {
                Notification.error('failed to logout :(');
            })
    }

    $scope.canRemove = function (characterId) {
        return ($scope.isOwner() || characterId==$scope.me.characterId);
    }

    $scope.getWaitlistUrl = function () {
        var waitlistId = $scope.getWaitlistId();
        var url;
        if(waitlistId && waitlistId.length){
            url = location.protocol + "//" + location.host + location.pathname + '?waitlistId=' + waitlistId;
        }else{
            url = '';
        }
        return url;
    }

    $scope.createTimer = function(item){
        Minions.createTimer(this, new Date());
    }

    //=== Fetch data
    // fetch it so the link is stored even if we are not logged in
    $scope.getWaitlistId();

    API.getMe()
        .then(function (data) {
            $scope.me = data;
            var waitlistId = $scope.getWaitlistId();
            $scope.authenticated = true;
            if(waitlistId && waitlistId.length>0){
                return API.getWaitlist(waitlistId)
                    .then(function (waitlist) {
                        $scope.updateWL(waitlist);
                        Notification.success('Joined waitlist');
                    })
                    .then(null,function () {
                        Notification.error('Failed to fetch waitlist :(');
                    })
            }else{
                // Stay on home, need waitlist firs
            }
        })
        .then(null,function (status) {
            if(status==401){
                $scope.authenticated = false;
                Notification.error('Please login first');
            }
        })

    API.getWaitlists()
        .then(function (waitlists) {
            $scope.waitlists = waitlists;
        })

    //update every 10s, veeery inefficient
    $interval(function(){
        $scope.refreshWL();
    }, 10000);
    //
}]);