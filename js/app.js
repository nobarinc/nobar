var App = angular.module('App', 
    ['ngRoute' , 'ngAnimate' , 'pubnub.angular.service', 'angularMoment']
);

App.config(
    function($routeProvider, $locationProvider, $provide, $httpProvider) {
        
        $routeProvider
        
        //home page
        .when('/', {
            title: 'Nobar - Live & Highlight Football',
            description: 'Awesome live & highlight football streaming website',
            canonicalUrl: '/',
            templateUrl: 'partials/home.html',
            controller: 'homeCtrl'
        })
        
        //live page
        .when('/live', {
            title: 'Live',
            description: 'Watch live streaming football',
            canonicalUrl: '#!/live',
            templateUrl: 'partials/live.html',
            controller: 'liveCtrl',
            activetab: 'live'
        })
        
        //highlight page
        .when('/highlight', {
            title: 'Highlight',
            description: 'Watch the latest football highlights',
            canonicalUrl: '#!/highlight',
            templateUrl: 'partials/highlight.html',
            controller: 'highlightCtrl',
            activetab: 'highlight'
        })
        
        //comming soon page
        .when('/upcoming', {
            title: 'Upcoming',
            description: 'Upcoming matchs football',
            canonicalUrl: '#!/upcoming',
            templateUrl: 'partials/upcoming.html',
            controller: 'upcomingCtrl',
            activetab: 'upcoming'
        })
        
        //watch page
        .when('/watch/:id/:server', {
           // title: '', // on controller
           // description: '', // on controller
            templateUrl: 'partials/watch.html',
            controller: 'watchCtrl'
        })
        
        //privacy page
        .when('/privacy', {
            title: 'Privacy',
            description: 'Privacy',
            canonicalUrl: '#!/privacy',
            templateUrl: 'partials/privacy.html',
            activetab : 'privacy'
        })
        
        //policy & safety page
        .when('/policyandsafety', {
            title: 'Policy and Safety',
            description: 'Policy and Safety',
            canonicalUrl: '#!/policyandsafety',
            templateUrl: 'partials/policyandsafety.html',
            activetab : 'policyandsafety'
        })
        
        //contact us page
        .when('/contactus', {
            title: 'Contact us',
            description: 'We welcome problem reports, feature ideas and general comments',
            canonicalUrl: '#!/contactus',
            templateUrl: 'partials/contactus.html',
            activetab : 'contactus'
        })
        
        .otherwise({
          redirectTo: '/'
        });
        
        // use the HTML5 History API
        $locationProvider.html5Mode(false);
        $locationProvider.hashPrefix('!');
        
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
        $provide.value("apiMatch", "json/match.json");
        
        //images team base
        $provide.value("imageTeamBase", "images/team/");
    
        $provide.value("androidApk", "http://cdn.nobar.co/mobile_app_installer/NobarInc.apk");
    
    }
);

App.run(['$location', '$rootScope', 'imageTeamBase', 'clock', 'androidApk', '$window', 'metaDescription', 'metaTitle',
    function($location, $rootScope, imageTeamBase, clock, androidApk, $window, metaDescription, metaTitle) {
        /*
        $rootScope.$on('$routeChangeStart', function(event, current, previous){
                
            //here when route start event
            
        });
        */    
        $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {

            if (current.hasOwnProperty('$$route')) {
                $rootScope.title = current.$$route.title;
                $rootScope.description = current.$$route.description;
                $rootScope.canonicalUrl = current.$$route.canonicalUrl;
                new metaTitle(current.$$route.title);
                new metaDescription(current.$$route.description);
                $rootScope.activetab = current.$$route.activetab;
                $rootScope.imageTeamBase = imageTeamBase;
                $rootScope.queryMatchs = '';
                $rootScope.modalMenu = false;
                $rootScope.androidApk = androidApk;
                $window.ga('send', 'pageview', $location.path()); //google analytics
            }

        });

        new clock($rootScope);
        
        $window.ga('create', 'UA-82746355-1', 'auto'); //google analytics

    }
]);

App.factory('metaDescription',function(){
    return function(value){
        var meta = document.getElementsByTagName("meta");
        for (var i=0; i<meta.length; i++) {
            var n = meta[i].name.toLowerCase();
            if ( n == "description" || n == "twitter:description" || n == "og:description" ) {
                meta[i].content = value;
            }
        }
    };
});

App.factory('metaTitle',function(){
    return function(value){
        var meta = document.getElementsByTagName("meta");
        for (var i=0; i<meta.length; i++) {
            var n = meta[i].name.toLowerCase();
            if ( n == "twitter:title" || n == "og:title" ) {
                meta[i].content = value;
            }
        }
    };
});

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

App.factory("dataMatch", function ($http, apiMatch, $rootScope, moment, $filter) {
    
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
                        //var d = ( new Date() - new Date(response[i]['msd'].toString().replace(/-/g,'/')) );
                        var fmt  = 'YYYY-MM-DD HH:mm:ss';
                        var msdWib = moment.tz(response[i]['msd'], "Asia/Jakarta");
                        var msdL = msdWib.clone().local();
                        var now  = moment(new moment(),fmt);
                        var then = moment(msdL,fmt);
                        var d    = moment.duration(now.diff(then)).asMinutes();
                        
                        //console.log(' > '+ now.format(fmt) +' - '+ then.format(fmt) +' = '+d+' > '+response[i]['mth']['tnm']+' v '+ response[i]['mta']['tnm']);
                        
                        //console.log(msdWib.format(fmt) + ' -- '+ msdL.format(fmt));
                        
                        response[i]['msd'] = new moment(msdL);
                        response[i]['msdRT'] = new moment(msdL).fromNow();
                        
                        if ( d<=120 && d>=0 && type=='live' ) {

                            scope.matchsTemporary.push(response[i]);
                            scope.matchorderby = 'msd';

                        } else if ( d<0 && type=='upcoming' ) {

                            scope.matchsTemporary.push(response[i]);
                            scope.matchorderby = 'msd';

                        } else if ( d>120 && type=='highlight' && response[i]["url"][0]["urlk"]!="unavailable" && response[i]["url"][0]["urlk"]!="0" && response[i]["url"][0]["urlk"]!="" ) {

                            scope.matchsTemporary.push(response[i]);
                            scope.matchorderby = '-msd';
                            scope.matchsTemporary = $filter('orderBy')(scope.matchsTemporary, '-msd');

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

//-- UPCOMING

App.controller('upcomingCtrl', function($scope, $http, dataMatch) { //d<0
    
    new dataMatch($scope,'upcoming');
    
});

//-- HIGHLIGHT

App.controller('highlightCtrl', function($scope, $http, dataMatch) { //d>6000000
    
    new dataMatch($scope,'highlight');
    
});

//-- WATCH

App.controller('watchCtrl', function($scope, $routeParams, $http, apiMatch, $window, $rootScope, metaDescription) {
    
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
                        var wt = 'Watch '+ response[i]['mth']['tnm'] +' v '+ response[i]['mta']['tnm']+' '+ response[i]['msd'];
                        
                        $rootScope.title = wt;
                        $rootScope.description = wt;
                        new metaDescription(wt);
                        $rootScope.canonicalUrl = "#!/watch/"+response[i]['mid']+"/1";
                        
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
            $scope.watchback = '#!/highlight'; 
        } else if (d<=6000000 && d>=0){
            $scope.watchback = '#!/live'; 
        } else if (d<0) {
            $scope.watchback = '#!/upcoming'; 
            $scope.layer = true;
        } else {
            $scope.watchback = '#!/'; 
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

