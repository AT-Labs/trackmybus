(function() {
    'use strict';

    angular.module('metro.services').factory('Map', Map);

    Map.$inject = ['$log', '$q', '$timeout', 'cfpLoadingBar', 'appConfig', 'UserStops'];

    function Map($log, $q, $timeout, cfpLoadingBar, appConfig, UserStops) {

        // Creation of the icons
        var defaultIcon = {
            type: 'div',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [92, -10],
            className: 'ride-stop'
        };
        var defaultDepartureIcon = {
            shadowUrl: null,
            iconSize: [23, 20],
            iconAnchor: [0, 15],
            divSize: [110, 30],
            extraClass: 'arrive-stop',
            textClass: 'text'
        };
        var defaultVehicleIcon = {
            shadowUrl: null,
            divSize: [40, 40],
            iconSize: [37, 37],
            iconAnchor: [20, 20],
            extraClass: 'ride',
            textClass: 'radiator'
        };
        var icons = {
            bus: angular.extend(angular.copy(defaultIcon), { html: '<i class="ATicon-bus"></i>' }),
            busDeparture: angular.extend(angular.copy(defaultDepartureIcon), { iconClass: 'ATicon-bus' }),
            busVehicle: angular.extend(angular.copy(defaultVehicleIcon), { iconClass: 'ATicon-bus' }),
            ferry: angular.extend(angular.copy(defaultIcon), { html: '<i class="ATicon-ferry"></i>' }),
            ferryDeparture: angular.extend(angular.copy(defaultDepartureIcon), { iconClass: 'ATicon-ferry' }),
            ferryVehicle: angular.extend(angular.copy(defaultVehicleIcon), { iconClass: 'ATicon-ferry' }),
            train: angular.extend(angular.copy(defaultIcon), { html: '<i class="ATicon-train"></i>' }),
            trainDeparture: angular.extend(angular.copy(defaultDepartureIcon), { iconClass: 'ATicon-train' }),
            trainVehicle: angular.extend(angular.copy(defaultVehicleIcon), { iconClass: 'ATicon-train' }),
            user: {
                shadowUrl: null,
                divSize: [40, 40],
                iconSize: [37, 37],
                iconAnchor: [20, 20],
                extraClass: 'geolocate',
                iconClass: 'ATicon-user',
                textClass: 'radiator'
            },
            location: {
                type: 'div',
                iconSize: [24, 60],
                iconAnchor: [12, 40],
                className: 'location-pin',
                html: '<i class="ion-ios-location"></i>'
            }
        };
        
        var centerOn = function(map, lat, lng, zoom) {
            var zoomLevel = angular.isNumber(zoom) ? zoom : appConfig.map.centerAuckland.zoom;
            // Closing all popups before centering
            map.closePopup();
            try {
                map.setView(L.latLng(lat, lng), zoomLevel);
                return true;
            } catch(e) { return false; }
        };
        
        var createMap = function(target, center) {
            // Creation of the map
            var mapConfig = appConfig.map;
            var mapCenter = _.assign(_.clone(mapConfig.centerAuckland), center);
            var boundsAuckland = L.latLngBounds(
                L.latLng(mapConfig.boundsAuckland.southWest.lat, mapConfig.boundsAuckland.southWest.lng), 
                L.latLng(mapConfig.boundsAuckland.northEast.lat, mapConfig.boundsAuckland.northEast.lng));
            var mapOptions = angular.extend({
                center: [mapCenter.lat,mapCenter.lng],
                zoom: mapCenter.zoom,
                maxBounds: boundsAuckland
            }, mapConfig.defaults);
            var map = L.map(target, mapOptions);

            // Creation of the tile layer
            var baseLayer = mapConfig.baselayers.smartrak;
            L.tileLayer(baseLayer.url, {
                attribution: mapConfig.attribution,
                noWrap: true
            }).addTo(map);
            
            return map;
        };
        
        var createMarkerCluster = function(map) {
            var markerCluster = L.markerClusterGroup({
                animate: false,
                chunkedLoading: true,
                chunkInterval: 100,
                chunkProgress: function(processed, total) {
                    if(processed > 0 && processed === total) {
                        cfpLoadingBar.complete();
                    } else {
                        cfpLoadingBar.set(processed/total);
                    }
                },
                disableClusteringAtZoom: 18,
                showCoverageOnHover: false,
                spiderfyDistanceMultiplier: 2
            });
            
            if(angular.isDefined(map) && angular.isFunction(map.addLayer)) {
                map.addLayer(markerCluster);
            }
            
            return markerCluster;
        };
        
        var drawTripPath = function(map, shape) {
            var points = _.map(shape, function(x) {
                return L.latLng(x.shape_pt_lat, x.shape_pt_lon);
            });
            var path = L.polyline(points, {
                color: '#ba7def',
                opacity: 0.8,
                weight: 4,
                clickable: false,
                dashArray: [10, 10]
            });

            if(angular.isDefined(map)) {
                path.addTo(map);
            }
            
            return path;
        };
        
        var getSearchLocationIcon = function(map, lat, lng) {
            var marker = L.marker([lat, lng], {
                icon: L.divIcon(icons.location),
                interactive: false,
                zIndexOffset: 1000
            });
            
            if(angular.isDefined(map)) {
                marker.addTo(map);
            }
            
            return marker;
        };
        
        var getStopDepartureMarker = function(map, stop) {
            var iconData = icons[stop.type + 'Departure'];
            var icon = new L.ImgTextIcon(angular.extend({ text: 'Stop ' + stop.code }, iconData));
            var marker = L.marker([stop.lat, stop.lng], {
                icon: icon,
                interactive: false
            });

            if(angular.isDefined(map)) {
                marker.addTo(map);
            }
            
            return marker;
        };
        
        var getStopIcon = function(stopType, saved, active) {
            var icon = angular.copy(icons[stopType]);
            
            if(saved) {
                icon.className += ' saved';
            }
            if(active) {
                icon.className += ' active';
            }
            return L.divIcon(icon);
        };

        var getUserIcon = function(map, lat, lng) {
            var icon = new L.ImgTextIcon(icons.user);
            var marker = L.marker([lat, lng], {
                icon: icon,
                interactive: false
            });
            
            if(angular.isDefined(map)) {
                marker.addTo(map);
            }
            
            return marker;
        };
        
        var getVehicleIcon = function(stop, map, lat, lng) {
            var iconData = icons[stop.type + 'Vehicle'];
            var icon = new L.ImgTextIcon(iconData);
            var marker = L.marker([lat, lng], {
                icon: icon,
                interactive: false
            });
            
            if(angular.isDefined(map)) {
                marker.addTo(map);
            }
            
            return marker;
        };
        
        function processStops(stops) {
            return _.reduce(stops, function(result, stop) {
                var stopCode = stop.code;
                var stopName = stop.name;
                var stopType = stop.type;
                var isSavedStop = UserStops.isSaved(stopCode);
                var marker = L.marker(L.latLng(stop.lat, stop.lng), {
                    icon: getStopIcon(stopType, isSavedStop),
                    keyboard: false,
                    isSaved: isSavedStop
                });
                var popupContent = '<a href="#/addroute/' + stopCode + '"><span class="stop">Stop ' + stopCode + '</span><span class="name">' + stopName + '</span><div class="icon ATicon-right-arrow"></div></a>';
                marker.bindPopup(popupContent, {
                    closeButton: false,
                    className: isSavedStop ? 'stop saved' : 'stop',
                    stopCode: stopCode,
                    stopType: stopType
                });
                
                result.stopMarkers[stopCode] = marker;
                result.markerArray.push(marker);
                return result;
            }, {
                stopMarkers: {},
                markerArray: []
            });
        }

        var loadStops = function(stops, markerCluster, bounds) {
            var deferred = $q.defer();
            var stopMarkers = {};
            // Slightly increase the bounds to load more stops on the first step
            var southWestLat = bounds._southWest.lat - 0.03;
            var southWestLng = bounds._southWest.lng - 0.03;
            var northEastLat = bounds._northEast.lat + 0.03;
            var northEastLng = bounds._northEast.lng + 0.03;
            
            // Divide the stops in two sets
            var twoPassStops = _.reduce(stops, function(result, stop) {
                if(stop.lng >= southWestLng && stop.lng <= northEastLng && stop.lat <= northEastLat && stop.lat >= southWestLat) {
                    result.firstPass.push(stop);
                } else {
                    result.secondPass.push(stop);
                }
                return result;
            }, {
                firstPass: [],
                secondPass: []
            });
            
            // Remove all stops from the cluster
            markerCluster.clearLayers();
            
            var firstPassStops = processStops(twoPassStops.firstPass);
            _.assign(stopMarkers, firstPassStops.stopMarkers);
            markerCluster.addLayers(firstPassStops.markerArray);

            $timeout(function() {
                var secondPassStops = processStops(twoPassStops.secondPass);
                _.assign(stopMarkers, secondPassStops.stopMarkers);
                cfpLoadingBar.start();
                markerCluster.addLayers(secondPassStops.markerArray);
                
                deferred.resolve(stopMarkers);
            }, 1000);
            
            return deferred.promise;
        };
        
        var setStopIcon = function(marker, stopCode, stopeType, active) {
            var isSavedStop = UserStops.isSaved(stopCode);
            var icon = getStopIcon(stopeType, isSavedStop, active);
            marker.setIcon(icon);
        };
        
        return {
            centerOn: centerOn,
            createMap: createMap,
            createMarkerCluster: createMarkerCluster,
            drawTripPath: drawTripPath,
            getSearchLocationIcon: getSearchLocationIcon,
            getStopDepartureMarker: getStopDepartureMarker,
            getStopIcon: getStopIcon,
            getUserIcon: getUserIcon,
            getVehicleIcon: getVehicleIcon,
            loadStops: loadStops,
            setStopIcon: setStopIcon
        };
    }

})();