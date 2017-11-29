(function() {
    'use strict';

    angular.module('metro.services').factory('RealtimeFeed', RealtimeFeed);

    RealtimeFeed.$inject = ['$http', '$q', '$log', 'appConfig', 'envConfig', 'Authorize'];

    function RealtimeFeed($http, $q, $log, appConfig, envConfig, Authorize) {
        var instance = {};

        var apiRoot = envConfig.api.root;
        var vehiclePositionUrl = apiRoot + appConfig.api.realTimeRoutes.realtime;
        var stopDeparturesUrl = apiRoot + appConfig.api.gtfsRoutes.stopInfo;
        var tripUpdatesUrl = apiRoot + appConfig.api.realTimeRoutes.tripUpdates;

        instance.getVehiclePosition = function(tripId) {
            var deferred = $q.defer();
            
            //get vehicle position and trip update
            $http.get(vehiclePositionUrl + Authorize.getAuthorization(), {
                params: { tripid: tripId }
            }).then(function(response) {
                var data = response && response.data || {};
                var entities = data.response && data.response.entity || [];

                if (entities.length) {
                    var vehicleData = _.reduce(entities, function(result, entity) {
                        if(entity.vehicle && entity.vehicle.position) {
                            result.vehiclePosition = entity.vehicle.position;
                        }
                        if(entity.trip_update && entity.trip_update.stop_time_update) {
                            result.tripUpdate = entity.trip_update.stop_time_update;
                        }
                        return result;
                    }, {});
                    deferred.resolve(vehicleData);
                } else {
                    deferred.reject();
                }
            }, function() {
                deferred.reject();
            });

            return deferred.promise;
        };
        
        instance.getStopDepartures = function(stopCode) {
            var deferred = $q.defer();
            
            $http.get(stopDeparturesUrl + stopCode + Authorize.getAuthorization())
            .then(function(result) {
                var stopDepartures = result.data && result.data.response || [];
                deferred.resolve(stopDepartures);
            }, function() {
                deferred.reject();
            });
            
            return deferred.promise;
        };


        /* get multiple departures */
        // StopCode is the GTFS stop code for this stop.
        // Routes is an array of routes we're interested in.
        instance.getDepartures = function(stopCode, routes) {
            var deferred = $q.defer();
            
            instance.getStopDepartures(stopCode)
            .then(function(stopDepartures) {
                var checkedRoutes = _.filter(routes, 'checked');

                // departures
                var routesDepartures = _(stopDepartures)
                .filter(function(departure) {
                    return _.some(checkedRoutes, function(route) {
                        return route.code === departure.route_short_name;
                    });
                })
                .map(function(departure) {
                    var departureTime = moment(departure.departure_time, 'HH:mm:ss');
                    return {
                        available: true,
                        departureTime: departure.departure_time,
                        sched: departureTime.format('hh:mm a'),
                        timeSched: departureTime,
                        stopSeq: departure.stop_sequence,
                        stopsAway: null,
                        dest: departure.trip_headsign,
                        route: departure.route_short_name,
                        tripId: departure.trip_id,
                        message: null
                    };
                })
                .valueOf();

                var tripIds = _.map(routesDepartures, 'tripId');

                var departures = [];
                if(!routesDepartures.length) {
                    departures.push({
                        available: false,
                        dest: null,
                        route: null,
                        tripId: null,
                        message: stopDepartures.length ? 'No departures for your selected routes in the next two hours' : 'No service for the next two hours'
                    });
                    deferred.resolve(departures);
                } else {
                    /*
                     *	get stop sequence from GTFS realtime to determine how many 'stops away' from current stop the bus is
                     */
                    $http.get(tripUpdatesUrl + Authorize.getAuthorization(), {
                        params: { tripid: tripIds.join(',') }
                    }).then(function(result) {

                        var entities = result.data && result.data.response && result.data.response.entity || [];
                        var tripUpdates = _.reduce(entities, function(result, entity) {
                            var tripUpdate = entity.trip_update;
                            result[tripUpdate.trip.trip_id] = tripUpdate.stop_time_update;
                            return result;
                        }, []);
                        var now = moment();

                        _.forEach(routesDepartures, function(departure) {
                            var tripId = departure.tripId;
                            var tripUpdate = tripUpdates[tripId];

                            // first check if we have realtime info around this trip
                            if (tripUpdate) {
                                // how many stops away
                                departure.stopsAway = departure.stopSeq - tripUpdate.stop_sequence;

                                // we only want departures that are yet to arrive and departures that are not too far away
                                if (departure.stopsAway >= -1) {
                                    departure.hasGone = !!tripUpdate.departure;
                                    departure.isScheduled = departure.sched && ( (!departure.stopsAway && departure.stopsAway !== 0) || departure.stopsAway > 10 );
                                    departure.isFewStopsAway = departure.stopsAway && departure.stopsAway > 0 && departure.stopsAway < 11;
                                    departure.isDepartedOrArrived = (departure.stopsAway || departure.stopsAway === 0) && departure.stopsAway < 1;
                                    departure.departedOrArrivedLabel = (departure.stopsAway === 0 && !departure.hasGone) ? 'ARRIVED' : 'DEPARTED';
                                    departures.push(departure);
                                }
                            } else if (now.isBefore(departure.timeSched)) {
                                // if not, let's check if the departure time is in the future
                                
                                departure.isScheduled = true;
                                departures.push(departure);
                            }
                        });
                        deferred.resolve(departures);
                        
                    }, function() {
                        deferred.reject();
                    });
                }
                
            }, function() {
                deferred.reject();
            });
            
            return deferred.promise;
        };
        
        return instance;
    }

})();