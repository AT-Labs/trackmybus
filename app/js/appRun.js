(function() {
    'use strict';

    angular.module('metro').run(Run);
    
    Run.$inject = ['$rootScope', '$ionicPlatform', '$timeout', 'appConfig', 'Analytics', 'Database', 'Geolocation', 'StopsData'];

    function Run($rootScope, $ionicPlatform, $timeout, appConfig, Analytics, Database, Geolocation, StopsData) {

        function checkForStopsUpdates() {
            StopsData.getStops(true).then(function() {
                $rootScope.$emit('stopsUpdated');
            });
        }

        $ionicPlatform.ready(function() {

            Geolocation.getPosition();

            Database.getInstance().then(function() {
                checkForStopsUpdates();

                // listen for broadcast event for gtfs.stops update
                $rootScope.$on('gtfs.stops', function() {
                    checkForStopsUpdates();
                });
            });
            
            $rootScope.hideSplashscreen = function() {
                if(navigator.splashscreen) {
                    navigator.splashscreen.hide();
                }
            };

            if (window.StatusBar) {
                window.StatusBar.overlaysWebView(true);
                window.StatusBar.backgroundColorByHexString('#172330');
            }
            
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.disableScroll(true);
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
            }

            /*
             *	check for network connectivity
             */
            if (window.cordova && window.Connection) {

                //	bind events to handle state change
                document.addEventListener('offline', function() {
                    $rootScope.$broadcast('user.notification', appConfig.notification.offline);
                }, false);

                document.addEventListener('online', function() {
                    $rootScope.$broadcast('user.notification', appConfig.notification.empty);
                }, false);
            }


            /*
             *	bind events for when application is in background (pause) and app is back in foreground (resume)
             */
            document.addEventListener('pause', function() {
                $rootScope.$broadcast('onPause');
            }, false);

            // IOS specific when users enable the lock button
            document.addEventListener('resign', function() {
                $rootScope.$broadcast('onResign');

            }, false);

            document.addEventListener('resume', function() {
                $rootScope.$broadcast('onResume');
                checkForStopsUpdates();
                $rootScope.centeredOnUserPosition = false;
                $rootScope.centeredOnVehiculePosition = false;
            }, false);

            Analytics.startTracking();
        });

    }
    
})();