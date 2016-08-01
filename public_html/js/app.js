var App = angular.module('App', ['ngRoute', 'ngAnimate']);

App.config(
    function($routeProvider,$locationProvider) {
        
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
        
        .otherwise({
          redirectTo: '/'
        });
        
        // use the HTML5 History API
        $locationProvider.html5Mode(true);
        
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

App.controller('homeCtrl', function($scope) {
    
});

//-- LIVE

App.controller('liveCtrl', function($scope) {
    
});

//-- HIGHLIGHT

App.controller('highlightCtrl', function($scope) {
    
});


