(function() {
    'use strict';

    angular.module('metro.models').factory('Database', Database);

    Database.$inject = ['$ionicPlatform', '$log', '$q', '$window', 'Loki'];

    function Database($ionicPlatform, $log, $q, $window, Loki) {

        var collectionNames = ['routes', 'stops', 'userPreferences', 'userStops', 'versions'];
        var collections = [];
        var instance, initializationPromise;
        
        function getCollection(name) {
            return getInstance().then(function(db) {
                var collection = db.getCollection(name);
                if(!collection) {
                    $log.info('Track My Bus ' + name + ' collection created');
                    collection = db.addCollection(name);
                } else {
                    $log.info('Track My Bus ' + name + ' collection loaded');
                }
                return collection;
            });
        }
        
        function getInstance() {
            var deferred = $q.defer();

            $ionicPlatform.ready(function() {
                if(instance) {
                    deferred.resolve(instance);
                } else if(initializationPromise) {
                    initializationPromise.then(deferred.resolve, deferred.reject);
                } else {
                    initialize().then(deferred.resolve, deferred.reject);
                }
            });

            return deferred.promise;
        }
        
        function initialize() {
            var deferred = $q.defer();
            initializationPromise = deferred.promise;

            var options = {
                autosave: true,
                autosaveInterval: 1000
            };
            
            if(window.cordova) {
                $log.info('Use of the loki file storage adapter.');
                options.adapter = new LokiCordovaFSAdapter({ 'prefix': 'loki' });
            }
            var db = new Loki('at_tmr_db', options);
            
            db.loadDatabase({}, function(error) {
                if(error) {
                    $log.error('An error occured while loading Track My Bus database: ', error);
                    deferred.reject();
                    initializationPromise = undefined;
                } else {
                    $log.info('Track My Bus database loaded');
                    instance = db;
                    
                    inializeCollections().then(deferred.resolve, deferred.reject)
                    .finally(function() {
                        initializationPromise = undefined;
                    });
                    
                }
                
            });
            
            return initializationPromise;
        }
        
        // Transition from the local storage model
        function loadDataFromLocalStorage() {
            var userData = $window.localStorage.userStorage;
            var parsedData, stops;
            if(userData) {
                $log.info('User data found in local storage', userData);
                parsedData = JSON.parse(userData);
                stops = parsedData && parsedData.stops;
                if(_.isArray(stops) && !_.isEmpty(stops)) {
                    angular.forEach(stops, function(stop, index) {
                        $log.info('Inserting the stop ', stop);
                        collections.userStops.insert(_.assign(stop, {
                            order: index,
                            type: 'bus'
                        }));
                    });
                }
                $window.localStorage.removeItem('userStorage');
            }
            
            $window.localStorage.removeItem('appStorage.stops');
            $window.localStorage.removeItem('appStorage.versions');
        }
        
        function inializeCollections() {
            var initCollectionsPromises = _.map(collectionNames, function(collectionName) {
                return getCollection(collectionName).then(function(collection) {
                    collections[collectionName] = collection;
                });
            });
            return $q.all(initCollectionsPromises).then(function() {
                loadDataFromLocalStorage();
            });
        }

        return {
            collections: collections,
            getInstance: getInstance,
            initialize: initialize
        };
    }

})();