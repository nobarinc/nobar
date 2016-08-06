var App = angular.module('App', ['ngRoute', 'ngAnimate']);

App.config(
    function($routeProvider, $locationProvider, $provide) {
        
        $routeProvider
        
        //home page
        .when('/', {
            title: 'Home',
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
            title: 'Comming Soon',
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
        
        //API match
        $provide.value("apiMatch", "json/match.json");
        
        //images team base
        $provide.value("imageTeamBase", "images/team/");
    }
);

App.run(['$location', '$rootScope', 'imageTeamBase', function($location, $rootScope, imageTeamBase) {
        
    $rootScope
    
        .$on('$routeChangeSuccess', function (event, current, previous) {

            if (current.hasOwnProperty('$$route')) {
                $rootScope.title = current.$$route.title;
                $rootScope.activetab = current.$$route.activetab;
                $rootScope.imageTeamBase = imageTeamBase;
            }

        });
        
    
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
    }
});

App.directive('includeReplace', function () {
    return {
        require: 'ngInclude',
        restrict: 'A', /* optional */
        link: function (scope, el, attrs) {
            el.replaceWith(el.children());
        }
    };
});

//-- HOME

App.controller('homeCtrl', function($scope, $http, apiMatch) {
    
    $http
        .get(apiMatch)
        .then(function(response) {
            $scope.matchs = response.data;
        });
    
});

//-- LIVE

App.controller('liveCtrl', function($scope, $http, apiMatch) {
    $http
        .get(apiMatch)
        .then(function(response) {
            $scope.matchs = [];
            for(var i=0; i<response.data.length; i++){
                var d = (new Date() - new Date(response.data[i]['msd'].replace(/-/g,'/')));
                console.log(d);
                if (d<=6000000 && d>=0){
                    response.data[i]['msd'] = new Date(response.data[i]['msd']);
                    $scope.matchs.push(response.data[i]);
                }
            }
        });
    
});

//-- COMING SOON

App.controller('comsoonCtrl', function($scope, $http, apiMatch) {
    $http
        .get(apiMatch)
        .then(function(response) {
            $scope.matchs = [];
            for(var i=0; i<response.data.length; i++){
                var d = (new Date() - new Date(response.data[i]['msd'].replace(/-/g,'/')));
                console.log(d);
                if (d<0){
                    response.data[i]['msd'] = new Date(response.data[i]['msd']);
                    $scope.matchs.push(response.data[i]);
                }
            }
        });
    
});

//-- HIGHLIGHT

App.controller('highlightCtrl', function($scope, $http, apiMatch) {
    $http
        .get(apiMatch)
        .then(function(response) {
            $scope.matchs = [];
            for(var i=0; i<response.data.length; i++){
                var d = (new Date() - new Date(response.data[i]['msd'].replace(/-/g,'/')));
                console.log(d);
                if (d>6000000){
                    response.data[i]['msd'] = new Date(response.data[i]['msd']);
                    $scope.matchs.push(response.data[i]);
                }
            }
        });
});

//-- WATCH

App.controller('watchCtrl', function($scope, $routeParams, $http, apiMatch) {
    
    $http
        .get(apiMatch)
        .then(function(response) { 
            for(var i=0; i<response.data.length; i++){
                if (response.data[i]["mid"] == $routeParams.id){
                    $scope.match = response.data[i];
                    $scope.urls = response.data[i]["url"];
                    $scope.goBackWatch(response.data[i]['msd']);
                }
            }
            angular.element(document.querySelector('#playerarea')).ready(function () {
                $scope.loadServer($scope.match.url[($routeParams.server-1)].urlk, $scope.match.url[($routeParams.server-1)].urwd, $scope.match.url[($routeParams.server-1)].urhg);
            });
        });
        
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
        } else {
            $scope.watchback = '#/'; 
        }
    };
    
});


