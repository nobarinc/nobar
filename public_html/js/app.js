var App = angular.module('App', ['ngRoute', 'ngAnimate']);

App.config(
    function($routeProvider, $locationProvider, $provide) {
        
        $routeProvider
        
        //home page
        .when('/', {
            title: 'Home',
            templateUrl: 'partials/home.html',
            controller: 'HomeCtrl'
        })
        
        //live page
        .when('/live', {
            title: 'Live',
            templateUrl: 'partials/live.html',
            controller: 'LiveCtrl'
        })
        
        //highlight page
        .when('/highlight', {
            title: 'Highlight',
            templateUrl: 'partials/highlight.html',
            controller: 'HighlightCtrl'
        })
        
        .otherwise({
          redirectTo: '/'
        });
        
        // use the HTML5 History API
        $locationProvider.html5Mode(true);
        
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

//-- HOME

App.controller('HomeCtrl', function($scope, $http, apiRoot) {
    
    $http
        .jsonp(apiRoot+"aHR0cDovL2xvY2FsaG9zdC9ub2Jhci9tb2RlbHMvYWpheC1nZXQucGhwP2E9bWF0Y2gmYj1s&callback=JSON_CALLBACK")
        .then(function(response) {
            $scope.matchs = response.data;
            console.log(response.data);
        });
    
});

//-- LIVE

App.controller('LiveCtrl', function($scope) {
    
});

//-- HIGHLIGHT

App.controller('HighlightCtrl', function($scope) {
    
});


