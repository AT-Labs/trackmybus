(function() {
    'use strict';

    angular.module('metro.models').factory('UserStops', UserStops);

    UserStops.$inject = ['Database'];

    function UserStops(Database) {

        function getStop(code) {
            return Database.collections.userStops.findOne({ 'code': code });
        }
        
        function getStops() {
            return Database.collections.userStops.chain().find().simplesort('order').data();
        }
        
        function isEmpty() {
            return Database.collections.userStops.count() === 0;
        }
        
        function isRouteSelected(code, routeCode) {
            var stop = getStop(code) || {};
            var routes = stop.routes || [];
            return _.some(routes, {
                code: routeCode,
                checked: true
            });
        }
        
        function isSaved(code) {
            return Database.collections.userStops.count({ 'code': code }) !== 0;
        }
        
        function removeStop(stop) {
            var removedStopOrder = stop.order;
            Database.collections.userStops.remove(stop);
            
            // Propagate the change to the impacted stops
            var stops = getStops();
            angular.forEach(stops, function(stop, index) {
                if(index > removedStopOrder) {
                    Database.collections.userStops.update(_.assign(stop, { order: stop.order - 1 }));
                }
            });
        }
        
        function reorderStop(fromIndex, toIndex) {
            var stops = getStops();
            var startStop = stops[fromIndex];
            
            if(fromIndex < toIndex) {
                
                // Set the target stop to the right order
                Database.collections.userStops.update(_.assign(startStop, { order: toIndex }));
                // Propagate the change to the impacted stops
                angular.forEach(stops, function(stop, index) {
                    if(index > fromIndex && index <= toIndex) {
                        Database.collections.userStops.update(_.assign(stop, { order: stop.order - 1 }));
                    }
                });
                
            } else {
                
                // Set the target stop to the right order
                Database.collections.userStops.update(_.assign(startStop, { order: toIndex }));
                // Propagate the change to the impacted stops
                angular.forEach(stops, function(stop, index) {
                    if(index >= toIndex && index < fromIndex) {
                        Database.collections.userStops.update(_.assign(stop, { order: stop.order + 1 }));
                    }
                });
            }
        }

        function saveStop(stop) {
            var dataToSave = _.omit(stop, '$loki');
            var savedStop = getStop(dataToSave.code);
            
            if(savedStop) {
                Database.collections.userStops.update(_.assign(savedStop, dataToSave));
            } else {
                Database.collections.userStops.insert(_.assign(dataToSave, { order: Database.collections.userStops.count() }));
            }
        }

        function updateStops(updatedStops) {
            if(!_.isEmpty(updatedStops)) {
                var existingStops = getStops();
                angular.forEach(existingStops, function(stop) {
                    var updatedStop = _.find(updatedStops, { 'code': stop.code });

                    if(updatedStop) {
                        saveStop(updatedStop);
                    } else {
                        removeStop(stop);
                    }
                });
            }
        }

        return {
            getStop: getStop,
            getStops: getStops,
            isEmpty: isEmpty,
            isRouteSelected: isRouteSelected,
            isSaved: isSaved,
            removeStop: removeStop,
            reorderStop: reorderStop,
            saveStop: saveStop,
            updateStops: updateStops
        };
    }

})();