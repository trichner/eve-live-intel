var app = angular.module('evewt', ['ui-notification','ngCookies']);
app.controller('home',[ '$scope','$http','$location','$interval','$window','API','EveIGB','Notification','Minions','$cookieStore',function ($scope,$http,$location,$interval,$window,API,EveIGB,Notification,Minions,$cookieStore) {

    //=== Vars
    $scope.waitlists = {waitlists:[]};

    $scope.me = null;
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

    $scope.newWaitlist = function () {
        return API.newWaitlist()
            .then(function (waitlist) {
                $scope.updateWL(waitlist);
                Notification.success("Successfully created waitlist")
            }, function () {
                Notification.error("Cannot create waitlist, logged in?")
            })
    };

    $scope.showCharInfo = function(item){
        EveIGB.showInfo(1377, item.characterId);
    };

    $scope.showCorporation = function(item){
        EveIGB.showInfo(2,item.corporationId);
    };
    $scope.showAlliance = function(item){
        EveIGB.showInfo(16159,item.allianceId);
    };

    $scope.startConversation = function(item){
        EveIGB.startConversation(item.characterId)
        Notification.success("Invited " + item.characterName + " to conversation")
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

    $scope.getWaitlistUrl = function (list) {
        var url = location.protocol + "//" + location.host + '/nemesis/?waitlistId=' + list.waitlistId;
        return url;
    }


    //=== Fetch data
    // fetch it so the link is stored even if we are not logged in
    $scope.getWaitlistId();

    API.getMe()
        .then(function (data) {
            $scope.me = data;
            $scope.authenticated = true;
        })
        .then(null,function (status) {
            if(status==401){
                $scope.authenticated = false;
                Notification.error('Please login first');
            }
        })

    API.getWaitlists()
        .then(function (waitlists) {
            waitlists = waitlists.sort(function (listA, listB) {
                return listB.createdAt - listA.createdAt;
            })
            $scope.waitlists = waitlists;
        })

}]);