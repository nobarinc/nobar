var App = angular.module('App', ['ngRoute' , 'ngAnimate' , 'pubnub.angular.service']);

App.config(
    function($routeProvider, $locationProvider, $provide, $httpProvider) {
        
        $routeProvider
        
        //home page
        .when('/', {
            title: 'Nobar',
            templateUrl: 'partials/home.html',
            controller: 'homeCtrl'
        })
        
        //live page
        .when('/live', {
            title: 'Live',
            templateUrl: 'partials/live.html',
            controller: 'liveCtrl',
            activetab: 'live'
        })
        
        //highlight page
        .when('/highlight', {
            title: 'Highlight',
            templateUrl: 'partials/highlight.html',
            controller: 'highlightCtrl',
            activetab: 'highlight'
        })
        
        //comming soon page
        .when('/comsoon', {
            title: 'Upcoming',
            templateUrl: 'partials/comsoon.html',
            controller: 'comsoonCtrl',
            activetab: 'comsoon'
        })
        
        //watch page
        .when('/watch/:id/:server', {
            title: 'Watch',
            templateUrl: 'partials/watch.html',
            controller: 'watchCtrl'
        })
        
        .otherwise({
          redirectTo: '/'
        });
        
        // use the HTML5 History API
        //$locationProvider.html5Mode(true);
        
        //initialize get if not there
        /*
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};    
        }    
        $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
        $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
        $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
        */
        //API match
        $provide.value("apiMatch", "https://d23de2bd771bf67c2ab71ee0655bcfd51f30f374.googledrive.com/host/0B2xjQ4obRNG9SkU4MnNPWFNaZGM/json/match.json");
        
        //images team base
        $provide.value("imageTeamBase", "https://d23de2bd771bf67c2ab71ee0655bcfd51f30f374.googledrive.com/host/0B2xjQ4obRNG9SkU4MnNPWFNaZGM/images/team/");
    
    
    }
);

App.run(['$location', '$rootScope', 'imageTeamBase', 'clock', function($location, $rootScope, imageTeamBase, clock) {
        
    $rootScope
    
        .$on('$routeChangeSuccess', function (event, current, previous) {

            if (current.hasOwnProperty('$$route')) {
                $rootScope.title = current.$$route.title;
                $rootScope.activetab = current.$$route.activetab;
                $rootScope.imageTeamBase = imageTeamBase;
                $rootScope.queryMatchs = '';
            }

        });
    
    new clock($rootScope);
        
}]);

App.directive('backButton', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('click', goBack);

            function goBack() {
                history.back();
                scope.$apply();
            }
        }
    };
});

App.directive('includeReplace', function () {
    return {
        require: 'ngInclude',
        restrict: 'A',
        link: function (scope, el, attrs) {
            el.replaceWith(el.children());
        }
    };
});

App.directive('whenScrolled', function() {
    return function(scope, elm, attr) {
        var raw = elm[0];

        elm.bind('scroll', function() {
            if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                scope.$apply(attr.whenScrolled);
            }
        });
    };
});

//-- CLOCK

App.factory("clock", function($timeout){
    
    function clock(scope) {
        scope.clock = "loading clock..."; // initialise the time variable
        scope.tickInterval = 1000; //ms

        var tick = function() {
            scope.clock = Date.now(); // get the current time
            $timeout(tick, scope.tickInterval); // reset the timer
        };

        // Start the timer
        $timeout(tick, scope.tickInterval);
        
        
    }
    
    return (clock);
    
});

//-- MATCHS

App.factory("dataMatch", function ($http, apiMatch, $rootScope) {
    
    var dataMatch = function(scope,type){
        
        scope.loadloop = 0;
        
        scope.load = function(){
            scope.loaded = false;
            scope.error = false;
            $http
                .get(apiMatch,{ headers: { 'Cache-Control' : 'no-cache' } , cache : false })
                .success(function(response) {
                    
                    scope.np = 0;
                    scope.matchsTemporary = [];
                    scope.matchs = [];
                    
                    for (var i=0; i<response.length; i++) {
                        var d = ( new Date() - new Date(response[i]['msd'].toString().replace(/-/g,'/')) );
                        
                        if ( d<=7000000 && d>=0 && type=='live' ) {

                            response[i]['msd'] = new Date(response[i]['msd']);
                            scope.matchsTemporary.push(response[i]);

                        } else if ( d<0 && type=='comsoon' ) {

                            response[i]['msd'] = new Date(response[i]['msd']);
                            scope.matchsTemporary.push(response[i]);

                        } else if ( d>7000000 && type=='highlight' ) {

                            response[i]['msd'] = new Date(response[i]['msd']);
                            scope.matchsTemporary.push(response[i]);

                        }
                    }

                    scope.loadMatchs = function(n){
                        scope.loaded = false;
                        
                        if ( n>=0 ) {
                            for(var i=n; i<(n+15) && i<scope.matchsTemporary.length; i++){
                                
                                scope.matchsTemporary[i]['msd'] = new Date(scope.matchsTemporary[i]['msd']);
                                scope.matchs.push(scope.matchsTemporary[i]);

                            }

                            if (n<scope.matchsTemporary.length)
                                scope.np = scope.matchs.length;
                            else
                                scope.np = -1;
                                
                        } else {
                            console.log("ALL DATA LOADED");
                        }

                        scope.loaded = true;

                    };

                    if (scope.np==0)
                        scope.loadMatchs(0);

                })
                .error(function(data, status){
                    scope.loadloop++;
                    if (scope.loadloop<=5) {
                        scope.reload();
                    } else {
                        scope.error = data || "Request failed ";
                        scope.errorstatus = status;
                    }
                })
                .finally(function () {
                    
                });
        };
        scope.load();
        scope.type = type;
        scope.reload = function(){
            scope.load();
        };
        
        scope.loadSearch = function(){
            
            if (!$rootScope.queryMatchs){
                scope.matchs = [];
                scope.loadMatchs(0);
                console.log($rootScope.queryMatchs + 'QUERY MATCHS');
            } else {
                scope.matchs = '';
                scope.np = -1;
                scope.matchs = scope.matchsTemporary;
            }
        } 
        
    };
    
    return (dataMatch);
    
});

//-- HOME

App.controller('homeCtrl', function($scope, $http, apiMatch) {
    
    
});

//-- LIVE

App.controller('liveCtrl', function($scope, $http, dataMatch) { //d<=6000000 && d>=0
    
    new dataMatch($scope,'live');
    
    $scope.iconlive = true;
    
});

//-- COMING SOON

App.controller('comsoonCtrl', function($scope, $http, dataMatch) { //d<0
    
    new dataMatch($scope,'comsoon');
    
});

//-- HIGHLIGHT

App.controller('highlightCtrl', function($scope, $http, dataMatch) { //d>6000000
    
    new dataMatch($scope,'highlight');
    
});

//-- WATCH

App.controller('watchCtrl', function($scope, $routeParams, $http, apiMatch, $window) {
    
    $scope.loadloop = 0;
    
    $scope.load = function(){
        $scope.loaded = false;
        $scope.error = false;
        
        $http
            .get(apiMatch)
            .success(function(response) { 
                for(var i=0; i<response.length; i++){
                    if (response[i]["mid"] == $routeParams.id){
                        $scope.match = response[i];
                        $scope.urls = response[i]["url"];
                        $scope.goBackWatch(response[i]['msd']);
                    }
                }
                angular.element(document.querySelector('#playerarea')).ready(function () {
                    $scope.loadServer($scope.match.url[($routeParams.server-1)].urlk, $scope.match.url[($routeParams.server-1)].urwd, $scope.match.url[($routeParams.server-1)].urhg);
                });
            })
            .error(function(data,status){
                $scope.loadloop++;
                if ($scope.loadloop<=5) {
                    $scope.load();
                } else {
                    $scope.error = data || "Request failed ";
                    $scope.errorstatus = status;
                }
            })
            .finally(function(){
                $scope.loaded = true;
            });
    };
    
    $scope.load();
        
    $scope.loadServer = function(url,width,height){
        angular.element(document.querySelector('#playerarea'))
            .attr('src',url)
            .css('width',width+'px')
            .css('height',height+'px');
    };
    
    $scope.server = $routeParams.server;
    
    $scope.goBackWatch = function(msd){
        var d = (new Date() - new Date(msd.replace(/-/g,'/')));
        if (d>6000000){
            $scope.watchback = '#highlight'; 
        } else if (d<=6000000 && d>=0){
            $scope.watchback = '#live'; 
        } else if (d<0) {
            $scope.watchback = '#comsoon'; 
            $scope.layer = true;
        } else {
            $scope.watchback = '#/'; 
        }
    };
    
    var screenWidth = $window.innerWidth;
    if (screenWidth < 1030)
        $scope.watchSidebar = false;
    else
        $scope.watchSidebar = true;
    
    $scope.watchSidebarShow = function(){
        $scope.watchSidebar == true ? $scope.watchSidebar = false : $scope.watchSidebar = true;
    };
    
});

//-- PUBNUB CHAT

App.directive('scrollBottom', function () {
  return {
    scope: {
      scrollBottom: "="
    },
    link: function (scope, element) {
        scope.$watchCollection('scrollBottom', function() {
            var e = angular.element(element);
            var scrollHeight = e.prop('scrollHeight');
            e.prop('scrollTop',scrollHeight);
        });
    }
  };
});

App.controller('chatCtrl', ['$scope', 'Pubnub', '$routeParams', function($scope, Pubnub, $routeParams) {
    $scope.messages = [];
    $scope.channel = $routeParams.id;
    $scope.messageContent = '';
    $scope.myteam = false;
    
    $scope.uuid = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
        function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    };
    $scope.uuid = $scope.uuid();
 
    Pubnub.init({
        publish_key: 'pub-c-7f934b4e-8557-4d19-8820-44592024e34e',
        subscribe_key: 'sub-c-ecf35586-5f38-11e6-bf96-0619f8945a4f',
        ssl: true,
        uuid: $scope.uuid
    });

    $scope.sendMessage = function() { 
        if (!$scope.messageContent || $scope.messageContent === '') {
            return;
        }
        Pubnub.publish({
            channel: $scope.channel,
            message: {
                content: $scope.messageContent,
                sender_uuid: $scope.uuid,
                date: new Date(),
                myteam : $scope.myteam
            },
            callback: function(m) {
                console.log(m);
            }
        });
        $scope.messageContent = '';

    };

    // Subscribe to messages channel
    Pubnub.subscribe({
        channel: $scope.channel,
        triggerEvents: ['callback']
    });
    
    $scope.$on(Pubnub.getMessageEventNameFor($scope.channel), function(ngEvent, m) {
        $scope.$apply(function() {
            $scope.messages.push(m);
        });
    });
    
    // Populate message history using jsapi (optional)
    Pubnub.history({
        channel: $scope.channel,
        count: 500,
        callback: function(payload) {
            payload[0].forEach(function(message) {
                $scope.messages.push(message);
            });
            $scope.$apply();
        }
    });
    
    
    $scope.myteamLoad = function(id,th,ta){
        var r;
        if (!th || !ta) return;
        if (id == th.tid)
            r = th.tlg;
        else
            r = ta.tlg;
        
        return r;
    };


}]);

