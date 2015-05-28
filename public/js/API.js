/**
 * Created by Thomas on 13.04.2015.
 */
app.factory('API', ['$q','$http',function($q,$http) {
    var API = {};
    var API_PREFIX = 'api'
    var URL = {
        VERIFY : API_PREFIX +'/auth',
        WAITLIST : API_PREFIX +'/waitlist',
        ME : API_PREFIX +'/me'
    }

    function breakPromise(){
        return $q.reject(new Error('invalid arguments'));
    }

    API.getWaitlists = function(){
        var deferred = $q.defer();
        $http.get(URL.WAITLIST).
            success(function(data, status, headers, config) {
                deferred.resolve(data)
            }).
            error(function(data, status, headers, config) {
                deferred.reject(data)
            });
        return deferred.promise;
    }

    API.getWaitlist = function(waitlistId){
        if(!waitlistId){
            return breakPromise();
        }
        var deferred = $q.defer();
        $http.get(URL.WAITLIST+'/'+waitlistId).
            success(function(data, status, headers, config) {
                deferred.resolve(data)
            }).
            error(function(data, status, headers, config) {
                deferred.reject(data)
            });
        return deferred.promise;
    }

    API.getWaitlistTxt = function(waitlistId){
        if(!waitlistId){
            return breakPromise();
        }
        var deferred = $q.defer();
        $http.get(URL.WAITLIST+'/'+waitlistId+'.txt').
            success(function(data, status, headers, config) {
                deferred.resolve(data)
            }).
            error(function(data, status, headers, config) {
                deferred.reject(data)
            });
        return deferred.promise;
    }

    API.getWaitlists = function(){
        var deferred = $q.defer();
        $http.get(URL.WAITLIST).
            success(function(data, status, headers, config) {
                deferred.resolve(data.waitlists)
            }).
            error(function(data, status, headers, config) {
                deferred.reject(data)
            });
        return deferred.promise;
    }

    API.postFit = function(waitlistId,shipString,role){
        if(!(waitlistId && shipString)){
            return breakPromise();
        }
        var deferred = $q.defer();
        $http.post(URL.WAITLIST+'/'+waitlistId,{
                shipString : shipString,
                role: role
            }).
            success(function(data, status, headers, config) {
                deferred.resolve(data)
            }).
            error(function(data, status, headers, config) {
                deferred.reject(data)
            });
        return deferred.promise;
    }

    API.makeBoss = function(waitlistId,bossId){
        if(!(waitlistId && bossId)){
            return breakPromise();
        }
        var deferred = $q.defer();
        $http.post(URL.WAITLIST+'/'+waitlistId + '/owner',{
            ownerId : bossId
        }).
            success(function(data, status, headers, config) {
                deferred.resolve(data)
            }).
            error(function(data, status, headers, config) {
                deferred.reject(data)
            });
        return deferred.promise;
    }

    API.newWaitlist = function(){
        var deferred = $q.defer();
        $http.post(URL.WAITLIST).
            success(function(data, status, headers, config) {
                console.log(JSON.stringify(data));
                deferred.resolve(data)
            }).
            error(function(data, status, headers, config) {
                deferred.reject(data)
            });
        return deferred.promise;
    }

    API.verify = function(rememberMe){
        var deferred = $q.defer();
        $http.get(URL.VERIFY).
            success(function(data, status, headers, config) {
                deferred.resolve(data)
            }).
            error(function(data, status, headers, config) {
                deferred.reject(data)
            });
        return deferred.promise;
    }

    API.logout = function(){
        var deferred = $q.defer();
        $http({
                method: 'DELETE',
                url: URL.VERIFY,
                headers: {'content-type':'application/json'}
            }).
            success(function(data, status, headers, config){
                deferred.resolve(data)
            }).
            error(function(data, status, headers, config) {
                deferred.reject(data)
            });
        return deferred.promise;
    }

    API.removeItem = function(waitlistId,itemId){
        if(!(waitlistId && itemId)){
            return breakPromise();
        }
        var deferred = $q.defer();
        $http({
            method: 'DELETE',
            url: URL.WAITLIST + '/' + waitlistId,
            data: {itemId:itemId},
            headers: {'content-type':'application/json'}
            }).
            success(function(data, status, headers, config){
                deferred.resolve(data)
            }).
            error(function(data, status, headers, config) {
                deferred.reject(data)
            });
        return deferred.promise;
    }

    API.getMe = function(){
        var deferred = $q.defer();
        $http.get(URL.ME).
            success(function(data, status, headers, config) {
                deferred.resolve(data)
            }).
            error(function(data, status, headers, config) {
                deferred.reject(status)
            });
        return deferred.promise;
    }

    return API;
}]);