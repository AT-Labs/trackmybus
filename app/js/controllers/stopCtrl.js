(function() {
    'use strict';

    /*
     *	stop departures
     */
    angular.module('metro.controllers').controller('StopCtrl', StopCtrl);

    StopCtrl.$inject = ['$ionicHistory', '$rootScope', '$scope', '$interval', '$stateParams', '$state', '$log', 'UserStops', 'RealtimeFeed', 'Analytics'];

    function StopCtrl($ionicHistory, $rootScope, $scope, $interval, $stateParams, $state, $log, UserStops, RealtimeFeed, Analytics) {

        var eventListeners = [];

        $scope.stopCode = parseInt($stateParams.stopCode, 10);
        $scope.stop = UserStops.getStop($scope.stopCode);

        $scope.departures = [];

        /* multiple departures update */
        var departuresUpdateInterval;

        function reload() {
            RealtimeFeed.getDepartures($scope.stopCode, $scope.stop.routes).then(function(departures) {
                $scope.departures = _.reduce(departures, function(result, departure) {
                    departure.className = '';
                    if(departure.due === '') {
                        departure.className += ' scheduleditem';
                    }
                    if(departure.available) {
                        departure.className += ' item-icon-right';
                    }
                    if($scope.stop.type !== 'train' && !_.isNumber(departure.stopsAway)) {
                        departure.className += ' disabled';
                    } else {
                        departure.iconClassName = 'ATicon-page-right';
                    }

                    return result.concat(departure);
                }, []);
            }).finally(function() {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
        }

        $scope.refresh = function() {
            $scope.departures = [];
            reload();
        };

        $scope.viewArrival = function(departure) {
            // only allow click through to map if 'stopsAway'
            // TODO: re-enable for disabled state
            if (_.isNumber(departure.stopsAway) || ($scope.stop.type === 'train')) {
                $state.go('stop-departure', {
                    stopCode: $scope.stopCode,
                    routeId: departure.route,
                    tripId: departure.tripId,
                    departureTime: departure.departureTime
                });
            }
        };

        function startListening() {
            // listen for broadcast for pause and resume
            eventListeners.push($rootScope.$on('onResume', startActivity));
            eventListeners.push($rootScope.$on('onPause', stopActivity));
            eventListeners.push($rootScope.$on('onResign', stopActivity));
        }

        function stopListening() {
            angular.forEach(eventListeners, function(eventListener) {
                eventListener();
            });
            eventListeners = [];
        }

        function startActivity() {
            if (!departuresUpdateInterval) {
                departuresUpdateInterval = $interval(reload, 60 * 1000);
                
                reload();
            }
        }
        function stopActivity() {
            if(departuresUpdateInterval) {
                $interval.cancel(departuresUpdateInterval);
                departuresUpdateInterval = undefined;
            }
        }

        $scope.$on('$ionicView.beforeEnter', function() {
            Analytics.screen('stop departures');
            Analytics.event('stop', 'view departures', $scope.stopCode, $scope.stopCode);
            startActivity();
            startListening();
        });
        $scope.$on('$ionicView.beforeLeave', function() {
            stopActivity();
            stopListening();
        });
        
    }

})();