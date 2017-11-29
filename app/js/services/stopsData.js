(function() {
    'use strict';

    angular.module('metro.services').factory('StopsData', StopsData);

    StopsData.$inject = ['$log', '$q', '$rootScope', 'appConfig', 'GTFS', 'Database', 'Version'];

    function StopsData($log, $q, $rootScope, appConfig, GTFS, Database, Version) {
        var updateStopsPromise;
        
        var getStops = function(forceRefresh) {
            if(updateStopsPromise) {
                return updateStopsPromise;
            }
            
            if(!forceRefresh) {
                return $q.when(Database.collections.stops.find());
            }

            var existingStops = _.chain(Database.collections.stops.find())
                         .concat(Database.collections.userStops.find())
                         .map('code')
                         .compact()
                         .uniq()
                         .value();

            updateStopsPromise = GTFS.getGTFSData('updateStops', {
                lastUpdate: Version.getLastUpdate(),
                stopCodes: existingStops,
                date: moment().format('YYYYMMDD')
            }).then(function updateStopsSuccess(data) {
                return data;
            }, function updateStopsFailure() {
                $rootScope.$broadcast('user.notification', appConfig.notification.loadingError);
            })
            .finally(function() {
                updateStopsPromise = null;
            });

            return updateStopsPromise;
        };
        
        var hasLoadedStops = function() {
            return !!Database.collections.stops.find().length;
        };
        
        return {
            getStops: getStops,
            hasLoadedStops: hasLoadedStops
        };
    }

})();