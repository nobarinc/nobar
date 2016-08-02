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
        
        //API root
        $provide.value("apiRoot", "http://localhost/nobar/models/get-api.php?l=");
        
    }
);

App.run(['$location', '$rootScope', function($location, $rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {

        if (current.hasOwnProperty('$$route')) {
            $rootScope.title = current.$$route.title;
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

//-- HOME

App.controller('homeCtrl', function($scope, $http, apiRoot) {
    
    $http
        .jsonp(apiRoot+"aHR0cDovL2xvY2FsaG9zdC9ub2Jhci9tb2RlbHMvYWpheC1nZXQucGhwP2E9bWF0Y2gmYj1s&callback=JSON_CALLBACK")
        .then(function(response) {
            $scope.matchs = response.data;
            console.log(response.data);
        });
    
});

//-- LIVE

App.controller('liveCtrl', function($scope) {
    
});

//-- HIGHLIGHT

App.controller('highlightCtrl', function($scope) {
    
});

//-- WATCH

App.controller('watchCtrl', function($scope, $routeParams) {
    
    console.log($routeParams.id);
    
});


