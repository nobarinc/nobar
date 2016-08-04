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
            controller: 'liveCtrl'
        })
        
        //highlight page
        .when('/highlight', {
            title: 'Highlight',
            templateUrl: 'partials/highlight.html',
            controller: 'highlightCtrl'
        })
        
        //comming soon page
        .when('/comsoon', {
            title: 'Segera Tayang',
            templateUrl: 'partials/comsoon.html',
            controller: 'comsoonCtrl'
        })
        
        //watch page
        .when('/watch/:id', {
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
                var d = Math.abs(new Date() - new Date(response.data[i]['msd'].replace(/-/g,'/')));
                if (d>=-6000000 && d<=0){
                    $scope.matchs[i] = response.data[i];
                    $scope.matchs[i]['msd'] = new Date(response.data[i]['msd']);
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
                var d = Math.abs(new Date() - new Date(response.data[i]['msd'].replace(/-/g,'/')));
                 if (d<=6000000 && d>=0){
                    $scope.matchs[i] = response.data[i];
                    $scope.matchs[i]['msd'] = new Date(response.data[i]['msd']);
                    $scope.matchs[i]['d']
                }
            }
        });
    
});

//-- HIGHLIGHT

App.controller('highlightCtrl', function($scope, $http, apiMatch) {
    $http
        .get(apiMatch)
        .then(function(response) {
            $scope.matchs = response.data;
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
                }
            }
            angular.element(document.querySelector('#playerarea')).ready(function () {
                $scope.loadServer($scope.match.url[0].urlk, $scope.match.url[0].urwd, $scope.match.url[0].urhg);
            });
        });
        
    $scope.loadServer = function(url,width,height){
        angular.element(document.querySelector('#playerarea'))
            .attr('src',url)
            .css('width',width+'px')
            .css('height',height+'px');
    };
    
});


