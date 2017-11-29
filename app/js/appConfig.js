(function() {
    'use strict';

    angular.module('metro').config(Config);

    Config.$inject = ['$compileProvider', '$httpProvider', '$ionicConfigProvider', '$logProvider', '$provide', '$stateProvider', '$urlRouterProvider', 'cfpLoadingBarProvider'];

    function Config($compileProvider, $httpProvider, $ionicConfigProvider, $logProvider, $provide, $stateProvider, $urlRouterProvider, cfpLoadingBarProvider) {

        // @if !debug 
        $compileProvider.debugInfoEnabled(false);
        $logProvider.debugEnabled(false);
        // @endif 

        $provide.decorator('$exceptionHandler', function($log, $delegate) {
            return function(exception, cause) {
                $log.debug('Default exception handler.');
                $delegate(exception, cause);
            };
        });

        // Turn off the loading bar spinner
        cfpLoadingBarProvider.includeSpinner = false;

        // Ionic Configuration
        $ionicConfigProvider.form.checkbox("circle");
        $ionicConfigProvider.scrolling.jsScrolling(false);
        $ionicConfigProvider.views.forwardCache(true);
        $ionicConfigProvider.views.swipeBackEnabled(false);

        // Enable CORS for API access.
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        // State Configuration
        // Application routing and state.
        $stateProvider
        .state('addstop', {
            url: '/addstop',
            templateUrl: 'templates/addstop-intro.html',
            controller: 'IntroCtrl',
            resolve: {
                db: function(Database) { return Database.getInstance(); }
            }
        })
        .state('findstop', {
            url: '/findstop',
            templateUrl: 'templates/addstop-findstop.html',
            controller: 'FindStopCtrl',
            controllerAs: 'findStop',
            resolve: {
                db: function(Database) { return Database.getInstance(); }
            }
        })
        .state('addroutes', {
            url: '/addroute/{stopCode}',
            templateUrl: 'templates/addstop-addroutes.html',
            controller: 'AddRoutesCtrl',
            resolve: {
                db: function(Database) { return Database.getInstance(); }
            }
        })
        .state('stops', {
            url: '/stops',
            templateUrl: 'templates/stops.html',
            controller: 'StopsCtrl',
            resolve: {
                db: function(Database) { return Database.getInstance(); }
            }
        })
        .state('updatestops', {
            url: '/updatestops',
            templateUrl: 'templates/stops.html',
            controller: 'StopsCtrl',
            resolve: {
                db: function(Database) { return Database.getInstance(); }
            }
        })
        .state('stop', {
            url: '/stop/{stopCode}',
            templateUrl: 'templates/stop.html',
            controller: 'StopCtrl',
            resolve: {
                db: function(Database) { return Database.getInstance(); }
            }
        })
        .state('stop-departure', {
            url: '/stop/{stopCode}/departure/{routeId}/trip/{tripId}/{departureTime}',
            templateUrl: 'templates/stop-departure.html',
            controller: 'StopDepartureCtrl',
            controllerAs: 'stopDeparture',
            resolve: {
                db: function(Database) { return Database.getInstance(); }
            }
        });

        $urlRouterProvider.otherwise('stops');
    }

})();