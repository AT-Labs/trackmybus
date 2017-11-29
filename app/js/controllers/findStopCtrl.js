(function() {
    'use strict';

    /*
     *	find a stop
     */
    angular.module('metro.controllers').controller('FindStopCtrl', FindStopCtrl);

    FindStopCtrl.$inject = ['$rootScope', '$scope', '$state', '$log', '$timeout', 'Geocode', 'Geolocation', 'Analytics', 'Map', 'StopsData'];

    function FindStopCtrl($rootScope, $scope, $state, $log, $timeout, Geocode, Geolocation, Analytics, Map, StopsData) {
        var vm = this;
        
        var eventListeners = [];
        var searchTimeout;
        vm.markersLoaded = false;
        
        // Set the map as not center on initialisation
        $rootScope.centeredOnUserPosition = false;
        
        // Creation of the map
        var addStopMap = Map.createMap('addStopMap', $rootScope.userPosition);
        var markerCluster = Map.createMarkerCluster(addStopMap);
        var markers = {};
        var userMarker;
        var searchLocationMarker;

        // Load the markers
        function loadStops() {
            vm.markersLoaded = false;
            StopsData.getStops().then(function(stops) {
                Map.loadStops(stops, markerCluster, addStopMap.getBounds()).then((function(data) {
                    markers = data;
                    vm.markersLoaded = true;
                }));
            });
        }

        // Close any popup when dragging the map
        function dragstartHandler() {
            // We flag the map as centered on the user to avoid being recentered afterward
            $rootScope.centeredOnUserPosition = true;
            
            $timeout(function () { vm.mapDragged = true; });
            addStopMap.closePopup();
        }
        addStopMap.on('dragstart', dragstartHandler);
        
        // Activate / Disactivate the stop icon on popup open/close
        function popupEventHandler(popup, isOpen) {
            var popupOptions = popup.options || {};
            var stopCode = popupOptions.stopCode;
            var marker = stopCode && markers[stopCode];
            if(marker) {
                Map.setStopIcon(marker, stopCode, popupOptions.stopType, isOpen);
            }
        }
        
        // Activate the stop when opening its popup
        function popupopenHandler(data) {
            popupEventHandler(data.popup || {}, true);
        }
        addStopMap.on('popupopen', popupopenHandler);
        
        // Disactivate the stop when closing its popup
        function popupcloseHandler(data) {
            popupEventHandler(data.popup || {}, false);
        }
        addStopMap.on('popupclose', popupcloseHandler);
        
        // Close all popup before zooming
        function zoomstartHandler() {
            addStopMap.closePopup();
        }
        addStopMap.on('zoomstart', zoomstartHandler);

        vm.geocoder = {
            addresses: [],
            search: ''
        };

        vm.search = function() {
            if (vm.geocoder.search.length < 3) {
                vm.geocoder.addresses = [];
            } else {
                if(searchTimeout) {
                    $timeout.cancel(searchTimeout);
                }

                searchTimeout = $timeout(function() {
                    vm.geocoder.searchInProgress = true;
                    
                    Geocode.search(vm.geocoder.search).then(function(results) {
                        vm.geocoder.addresses = results;
                    }).finally(function() {
                        vm.geocoder.searchInProgress = false;
                    });
                    searchTimeout = undefined;
                }, 1000);
            }
        };

        vm.goToLocation = function(location) {
            var wantedStop, wantedStopMarker;
            if(location.address.search(/^\d{2,5} - /) !== -1) {
                wantedStop = location.address.match(/^\d{2,5}/);
                wantedStopMarker = markers[wantedStop];
            }
            
            vm.geocoder.addresses = [];
            vm.geocoder.search = location.address;

            if(!searchLocationMarker) {
                searchLocationMarker = Map.getSearchLocationIcon(addStopMap, location.lat, location.lng);
            } else {
                searchLocationMarker.setLatLng([location.lat, location.lng]).update();
            }

            var centerSuccessful = Map.centerOn(addStopMap, location.lat, location.lng, 18);
            // We flag the map as centered on the user to avoid being recentered afterward
            if(!$rootScope.centeredOnUserPosition) {
                $rootScope.centeredOnUserPosition = centerSuccessful;
            }
            
            if(wantedStopMarker) {
                wantedStopMarker.openPopup();
            }
        };
        
        function updateUserMarker() {
            if($rootScope.userPosition) {
                var lat = $rootScope.userPosition.lat;
                var lng = $rootScope.userPosition.lng;
                if(!userMarker) {
                    userMarker = Map.getUserIcon(addStopMap, lat, lng);
                } else {
                    userMarker.setLatLng([lat, lng]).update();
                }
            }
        }
        
        vm.centerOnUser = function(force) {
            if(vm.markersLoaded && (force || !$rootScope.centeredOnUserPosition) && $rootScope.userPosition) {
                $rootScope.centeredOnUserPosition = Map.centerOn(addStopMap, $rootScope.userPosition.lat, $rootScope.userPosition.lng);
            }
        };

        function startListening() {
            // Display the User marker
            eventListeners.push($rootScope.$on('map.geolocationupdate', function() {
                updateUserMarker();
                vm.centerOnUser();
            }));
            // Load the stops
            eventListeners.push($rootScope.$on('stopsUpdated', loadStops));
            
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
        }
        function stopActivity() {
            vm.geocoder.addresses = [];
            vm.geocoder.search = '';
            vm.geocoder.searchInProgress = false;
            addStopMap.closePopup();
            
            Geolocation.stopLocating();
        }

        $scope.$on('$ionicView.beforeEnter', function() {
            if(!vm.markersLoaded) {
                loadStops();
            }
            startActivity();
            startListening();
        });
        $scope.$on('$ionicView.beforeLeave', function() {
            stopActivity();
            stopListening();
        });

    }

})();