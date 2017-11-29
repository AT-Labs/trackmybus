(function() {
    'use strict';

    /*
     *	departure map
     */
    angular.module('metro.controllers').controller('StopDepartureCtrl', StopDepartureCtrl);

    StopDepartureCtrl.$inject = ['$rootScope', '$scope', '$interval', '$stateParams', '$log', 'appConfig', 'UserStops', 'RealtimeFeed', 'Analytics', 'Geolocation', 'GTFS', 'Map'];

    function StopDepartureCtrl($rootScope, $scope, $interval, $stateParams, $log, appConfig, UserStops, RealtimeFeed, Analytics, Geolocation, GTFS, Map) {
        var vm = this;
        
        var eventListeners = [];
        var departureUpdateInterval;

        var stopCode = parseInt($stateParams.stopCode, 10);
        var tripId = $stateParams.tripId;
        var departureTime = $stateParams.departureTime;
        vm.routeId = $stateParams.routeId;
        var currentDeparture, currentDepartureStopSequence;
        
        // Create an unique id for the map based on the trip id
        var mapId = 'stopDepartureMap-' + moment().valueOf();
        var stopDepartureMapEl = document.getElementById("stopDepartureMap");
        if(stopDepartureMapEl) {
            stopDepartureMapEl.id = mapId;
        }
        
        // Set the map as not center on initialisation
        $rootScope.centeredOnVehiculePosition = false;

        // Creation of the map
        var stopDepartureMap = Map.createMap(mapId);
        var userMarker, vehiculeMarker;
        var vehiclePosition, tripUpdate, vehicleStopSequence;
        var stop = UserStops.getStop(stopCode);
        Map.getStopDepartureMarker(stopDepartureMap, stop);
        var tripPath;
        vm.pathDrew = false;
        var noVehicleLocation = false;
        
        // Close any popup when dragging the map
        function dragstartHandler() {
            // We flag the map as centered on the vehicle to avoid being recentered afterward
            $rootScope.centeredOnVehiculePosition = true;
        }
        stopDepartureMap.on('dragstart', dragstartHandler);

        // Draw the trip path
        GTFS.getGTFSData('shapes', { id: tripId }).then(function(shape) {
            tripPath = Map.drawTripPath(stopDepartureMap, shape);
            vm.pathDrew = true;
            vm.centerOnVehicule();
        });
        
        // Get the stop info
        RealtimeFeed.getStopDepartures(stopCode)
        .then(function(stopDepartures) {
            currentDeparture = _.find(stopDepartures, {
                'trip_id': tripId,
                'departure_time': departureTime
            });
            if(currentDeparture) {
                currentDepartureStopSequence = currentDeparture.stop_sequence;
                updateBusRelativePosition();
            }
        });
        
        vm.centerOnUser = function() {
            if(vm.pathDrew && $rootScope.userPosition) {
                Map.centerOn(stopDepartureMap, $rootScope.userPosition.lat, $rootScope.userPosition.lng);
            }
        };
        
        vm.centerOnVehicule = function(force) {
            if(force || !$rootScope.centeredOnVehiculePosition) {
                if (vm.pathDrew && vehiclePosition) {
                    $rootScope.centeredOnVehiculePosition = Map.centerOn(stopDepartureMap, vehiclePosition.latitude, vehiclePosition.longitude);
                } else if(noVehicleLocation && vm.pathDrew) {
                    var tripBounds = tripPath.getBounds();
                    stopDepartureMap.fitBounds(tripBounds, { animate: true });
                }
            }
        };

        /* single departure update */
        function stopDrawingVehiculePosition() {
            if (departureUpdateInterval) {
                $interval.cancel(departureUpdateInterval);
                departureUpdateInterval = undefined;
            }
        }

        function startDrawingVehiculePosition() {
            if (!departureUpdateInterval) {
                departureUpdateInterval = $interval(drawVehiculePosition, 10 * 1000);

                drawVehiculePosition();
            }
        }

        function drawVehiculePosition() {
            RealtimeFeed.getVehiclePosition(tripId).then(function(vehicleTrip) {
                if (vehicleTrip) {
                    vehiclePosition = vehicleTrip.vehiclePosition || {};
                    tripUpdate = vehicleTrip.tripUpdate || {};

                    vm.hasGone = !!tripUpdate.departure;
                    vehicleStopSequence = tripUpdate.stop_sequence;
                    updateBusRelativePosition();

                    if (!vehiculeMarker) {
                        vehiculeMarker = Map.getVehicleIcon(stop, stopDepartureMap, vehiclePosition.latitude, vehiclePosition.longitude);
                    } else {
                        vehiculeMarker.setLatLng([vehiclePosition.latitude, vehiclePosition.longitude]).update();
                    }

                    vm.centerOnVehicule();
                }
            }, function() {
                $rootScope.$broadcast('user.notification', appConfig.notification.noTrackingInfo);
                stopDrawingVehiculePosition();
                noVehicleLocation = true;
                vm.centerOnVehicule();
            });
        }
        
        function updateBusRelativePosition() {
            if(_.isNumber(currentDepartureStopSequence) && _.isNumber(vehicleStopSequence)) {
                vm.stopsAway = currentDepartureStopSequence - vehicleStopSequence;
            }
        }
        
        function updateUserMarker() {
            if($rootScope.userPosition) {
                var lat = $rootScope.userPosition.lat;
                var lng = $rootScope.userPosition.lng;
                if(!userMarker) {
                    userMarker = Map.getUserIcon(stopDepartureMap, lat, lng);
                } else {
                    userMarker.setLatLng([lat, lng]).update();
                }
            }
        }

        function startListening() {
            // Display the User marker
            eventListeners.push($rootScope.$on('map.geolocationupdate', updateUserMarker));
            
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
            updateUserMarker();
            Geolocation.startLocating();
            
            startDrawingVehiculePosition();
            
            // Hack to avoid unstable map after navigation
            ionic.trigger('resize');
        }
        function stopActivity() {
            Geolocation.stopLocating();
            stopDrawingVehiculePosition();
            
            // Remove notification if any
            $rootScope.$broadcast('user.notification', appConfig.notification.empty);
        }

        $scope.$on('$ionicView.beforeEnter', function() {
            Analytics.screen('stop realtime map');
            Analytics.event('stop', 'view realtime map', tripId, 0);
            startActivity();
            startListening();
        });
        $scope.$on('$ionicView.beforeLeave', function() {
            stopActivity();
            stopListening();
        });
    }

})();