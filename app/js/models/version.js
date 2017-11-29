(function() {
    'use strict';

    angular.module('metro.models').factory('Version', Version);

    Version.$inject = ['Database'];

    function Version(Database) {

        var lastSaveTime;

        function getVersion() {
            var storedVersions = Database.collections.versions.find();
            return storedVersions.length && storedVersions[0].current;
        }

        function needToCheckVersion() {
            var oneHourAgo = moment().subtract(1, 'hour');

            if(!lastSaveTime) {
                return true;
            }
            return moment.isMoment(lastSaveTime) && lastSaveTime.isBefore(oneHourAgo);
        }
        
        function setVersion(data) {
            var storedVersions = Database.collections.versions.find();
            var storedVersion = storedVersions.length && storedVersions[0];
            
            if(storedVersion) {
                storedVersion.current = data;
                Database.collections.versions.update(storedVersion);
            } else {
                Database.collections.versions.insert({ current: data });
            }
            
            lastSaveTime = moment();
        }

        function getLastUpdate() {
            var lastUpdate = Database.collections.versions.find('lastUpdate');

            return (lastUpdate.length && lastUpdate[0].lastUpdate) || '20160101';
        }

        function setLastUpdate(date) {
            var storedLastUpdate = Database.collections.versions.findOne('lastUpdate');

            if(storedLastUpdate) {
                storedLastUpdate.lastUpdate = date;
                Database.collections.versions.update(storedLastUpdate);
            } else {
                Database.collections.versions.insert({ lastUpdate: date });
            }
        }

        return {
            getVersion: getVersion,
            needToCheckVersion: needToCheckVersion,
            setVersion: setVersion,
            getLastUpdate: getLastUpdate,
            setLastUpdate: setLastUpdate
        };
    }

})();