(function() {
    'use strict';

    /*
     *	Add routes
     */
    angular.module('metro.controllers').controller('AddRoutesCtrl', AddRoutesCtrl);

    AddRoutesCtrl.$inject = ['$ionicHistory', '$scope', '$state', '$stateParams', '$log', 'GTFS', 'Stops', 'UserStops', 'Analytics'];

    function AddRoutesCtrl($ionicHistory, $scope, $state, $stateParams, $log, GTFS, Stops, UserStops, Analytics) {

        function checkAndFixLabel(stop) {
            if (stop && (!stop.label || !stop.label.length)) { 
                stop.label = 'Stop ' + stop.code; 
            }
        }
        
        function retrieveStop(stopCode) {
            var stop = _.clone(UserStops.getStop($scope.stopCode));

            if(!stop) { 
                stop = Stops.getStop(stopCode); 
            } 
            checkAndFixLabel(stop);
            
            return stop;
        }

        $scope.swipeUpOrDown = function() {
            if(window.cordova && window.cordova.plugins.Keyboard) {
                var stopLabelInput = document.getElementById("stopLabelInput");
                if(stopLabelInput) {
                    stopLabelInput.blur();
                }
                window.cordova.plugins.Keyboard.close();
            }
        };
        
        $scope.save = function() {
            Analytics.event('stop', 'save', $scope.stop, 0);
            $scope.stop.routes = _.clone($scope.data.routes);
            $scope.stop.label = _.clone($scope.data.stopLabel);
            checkAndFixLabel($scope.stop);
            UserStops.saveStop($scope.stop);

            var backView = $ionicHistory.backView() || {};
            if(backView.stateName === 'findstop') {
                // Go to the stop view if coming from the map
                $state.go('stops', null, { location: 'replace' });
            } else {
                // Just go back otherwise
                $ionicHistory.goBack();
            }
        };
        
        $scope.$on('$ionicView.beforeEnter', function() {
            Analytics.screen('add routes');
            
            $scope.stopCode = parseInt($stateParams.stopCode, 10);
            $scope.stop = retrieveStop($scope.stopCode);
            
            // If the stop is not found then go back
            if(!$scope.stop) {
                $ionicHistory.goBack();
            } else {
                $scope.data = {
                    stopLabel: angular.copy($scope.stop.label),
                    routes: {}
                };
                
                // Load the GTFS routes from the stop-code so that we always
                // have up to date routes.  Then, check the ones the user has
                // saved previously.
                GTFS.getGTFSData('routes', {
                    id: $scope.stop.id
                }).then(function(routes) {

                    $scope.data.routes = _.chain(routes)
                        .clone()
                        .sortBy('code')
                        .map(function(route) {
                            return _.assign(route, {
                                checked: UserStops.isRouteSelected($scope.stopCode, route.code)
                            });
                        })
                        .valueOf();
                });
            }
        });

    }

})();