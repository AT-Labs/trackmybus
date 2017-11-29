(function() {
    'use strict';

    /*
     * returns GTFS data, in the following order from:
     *	1) main memory
     *	3) API
     */
    angular.module('metro.services').factory('GTFS', GTFS);

    GTFS.$inject = ['$rootScope', '$http', '$q', '$log', '$timeout', 'appConfig', 'envConfig', 'Authorize', 'Routes', 'Shapes', 'Stops', 'UserStops', 'Version'];


    function GTFS($rootScope, $http, $q, $log, $timeout, appConfig, envConfig, Authorize, Routes, Shapes, Stops, UserStops, Version) {
        var apiRoot = envConfig.api.root;

        /*
         *	resource config returns url and handler by key
         */
        var resourceConfig = function(key, params) {
            if (!params) {
                params = { id: null };
            }

            var resources = {
                versions: {
                    url: apiRoot + appConfig.api.gtfsRoutes.versions + Authorize.getAuthorization(),
                    handler: function(versions) {
                        return versions;
                    }
                },
                stops: {
                    url: apiRoot + appConfig.api.gtfsRoutes.stops + Authorize.getAuthorization(),
                    handler: function(stops) {
                        return Stops.addStops(stops);
                    }
                },
                updateStops: {
                    url: apiRoot + appConfig.api.gtfsRoutes.updateStops + Authorize.getAuthorization(),
                    handler: function(updatedStops) {
                        var stops = Stops.updateStops(updatedStops);
                        UserStops.updateStops(stops);
                        return stops;
                    }
                },
                shapes: {
                    // param is tripId
                    url: apiRoot + appConfig.api.gtfsRoutes.shapeByTripId + params.id + Authorize.getAuthorization(),
                    handler: function(shape) {
                        return Shapes.saveShape(params.id, shape);
                    }
                },
                routes: {
                    // param is stopId
                    url: apiRoot + appConfig.api.gtfsRoutes.routesByStopId + params.id + Authorize.getAuthorization(),
                    handler: function(routes) {
                        return Routes.saveRoutes(params.id, routes);
                    }
                }
            };

            return resources[key];
        };


        /*
         *	get GTFS data from API
         */
        var getRemoteData = function(url, handler) {
            var deferred = $q.defer();

            $http.get(url, {
                headers: { Accept: 'application/json' }
            }).then(function(result) {
                var data = result && result.data && result.data.response;
                deferred.resolve(handler(data));
            }, deferred.reject);

            return deferred.promise;
        };

        /*
         *	get GTFS data from API sending data through POST
         */
        var postRemoteData = function(url, params, handler) {
            var deferred = $q.defer();

            params = JSON.stringify(params);

            $http.post(url, params, {
                headers: { Accept: 'application/json' }
            }).then(function(result) {
                var data = result && result.data && result.data.response;
                deferred.resolve(handler(data));
                Version.setLastUpdate(getCurrentDate());
            }, deferred.reject);
            return deferred.promise;
        };


        /*
         *	check and return data from cache or API
         */
        function getStoredData(key, url, handler, params) {
            var deferred = $q.defer();
            var id = params && params.id || null; 

            var cachedData;
            if(key === 'routes') {
                cachedData = Routes.getRoutes(id);
            } else if(key === 'shapes') {
                cachedData = Shapes.getShape(id);
            } else if(key === 'stops') {
                if(!Stops.isEmpty()) {
                    Stops.checkAndRemoveNullStops();
                    cachedData = Stops.getStops();
                }
            } else if(key === 'updateStops') {
                if (!Stops.isEmpty()) {
                    Stops.checkAndRemoveNullStops();
                    cachedData = Stops.getStops();
                }
            }
            
            if(cachedData) {
                deferred.resolve(cachedData);
            } else if(key === 'updateStops') {
                postRemoteData(url, params, handler).then(deferred.resolve, deferred.reject);
            } else {
                getRemoteData(url, handler).then(deferred.resolve, deferred.reject);
            }

            return deferred.promise;
        }

        /*
         * Succeed if there is no need to fetch new data
         * Fails otherwise
         */
        function checkVersion() {
            var deferred = $q.defer();

            // If the GTFS version is less than one hour old then use it
            if(!Version.needToCheckVersion()) {
                deferred.resolve();
            } else {
                var versionsResource = resourceConfig('versions', null);

                getRemoteData(versionsResource.url, versionsResource.handler)
                .then(function(versions) {
                    var version = _.isArray(versions) && !_.isEmpty(versions) && versions[0].version;
                    if(version) {
                        return version;
                    } else {
                        deferred.reject();
                    }
                }, function() {
                    deferred.reject();
                })
                .then(function(version) {
                    var cachedVersion = Version.getVersion();
                    if (version === cachedVersion) {
                        deferred.resolve();
                    } else {
                        deferred.reject();
                    }
                    Version.setVersion(version);
                });
                
            }

            return deferred.promise;
        }
        
        function clearGtfsData() {
            $log.info('Ths GTFS version has changed. Clearing the data stored...');
            Routes.clear();
        }

        function getCurrentDate() {
            var date = new Date();
            var dd = date.getDate();
            var mm = date.getMonth()+1;
            var yyyy = date.getFullYear();
            if(dd<10) { dd='0'+dd; }
            if(mm<10) { mm='0'+mm; }
            var currentDate = yyyy.toString()+mm.toString()+dd.toString();

            return currentDate;
        }

        /*
         *	GTFS request is wrapped in meta data validation
         *	checks and returns either cached or remote data by key
         */
        var instance = {
            getGTFSData: function(key, params) {
                var dataResource = resourceConfig(key, params);

                return checkVersion().then(function() {
                    return getStoredData(key, dataResource.url, dataResource.handler, params);
                }, function() {
                    clearGtfsData();
                    if(key === 'updateStops') {
                        return postRemoteData(dataResource.url, params, dataResource.handler);
                    }
                    return getRemoteData(dataResource.url, dataResource.handler);
                });
            }
        };

        return instance;
    }

})();