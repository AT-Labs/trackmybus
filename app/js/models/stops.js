(function() {
    'use strict';

    angular.module('metro.models').factory('Stops', Stops);

    Stops.$inject = ['Database'];

    function Stops(Database) {

        var notTrainStation = [2716, 5975, 6514, 6519];
        var notFerryTerminal = [4708];

        function mapApiStops(stop) {
            var normalizedStop = {
                code: parseInt(stop.stop_code, 10),
                id: stop.stop_id,
                name: stop.stop_name || '',
                lat: stop.stop_lat,
                lng: stop.stop_lon,
                locType: stop.location_type
            };
            
            normalizedStop.type = getStopType(normalizedStop);

            return normalizedStop;
        }

        function isAPhysicalStructure(stop) {
            // locType is alias for the GTFS "location_type" field where
            // 0 or blank indicates a stop (A location where passengers
            // board or disembark from a transit vehicle) and 1 indicates
            // a physical structure / station. For train stops location_type
            // is 0 however the name contains "Train Station"
            return stop.locType === 1;
        }

        function isATrainStation(stop) {
            // Hack: The stops type are induced by the name of the stop minus a some exceptions
            return stop.name.indexOf('Train Station') !== -1 && notTrainStation.indexOf(stop.code) === -1;
        }

        function isAFerryTerminal(stop) {
            // Hack: The stops type are induced by the name of the stop minus a some exceptions
            return stop.name.indexOf('Ferry Terminal') !== -1 && notFerryTerminal.indexOf(stop.code) === -1;
        }
        
        function getStopType(stop) {
            if (isAPhysicalStructure(stop) || isATrainStation(stop) || isAFerryTerminal(stop)) {
                return undefined;
            }

            return 'bus';
        }

        function addStops(data) {
            return _(data).map(mapApiStops).filter('type');
        }

        function updateStops(updatedStops) {
            if(updatedStops) {
                angular.forEach(updatedStops.deleted, function (deletedStop) {
                    removeStop(deletedStop);
                });

                var newStops = [].concat([], updatedStops.added, updatedStops.moved);

                _(newStops).map(mapApiStops).filter('type').each(saveStop);
            }

            return getStops();
        }
        
        function clear() {
            Database.collections.stops.clear();
        }

        function getStop(code) {
            return Database.collections.stops.findOne({ 'code': code });
        }
        
        function getStops() {
            return Database.collections.stops.find();
        }
        
        function isEmpty() {
            return Database.collections.stops.count() === 0;
        }
        
        function saveStop(stop) {
            var savedStop = getStop(stop.code);
            
            if(savedStop) {
                Database.collections.stops.update(_.assign(savedStop, stop));
            } else {
                Database.collections.stops.insert(stop);
            }
        }

        function removeStop(code) {
            var deletedStop = getStop(Number(code));

            if(deletedStop) {
                Database.collections.stops.remove(deletedStop);
            }
        }

        function checkAndRemoveNullStops() {
            var stops = getStops();

            angular.forEach(stops, function(stop) {
                if(!stop.code) {
                    Database.collections.stops.remove(stop);
                }
            });
        }

        return {
            addStops: addStops,
            updateStops: updateStops,
            clear: clear,
            getStop: getStop,
            getStops: getStops,
            isEmpty: isEmpty,
            saveStop: saveStop,
            checkAndRemoveNullStops: checkAndRemoveNullStops
        };
    }

})();