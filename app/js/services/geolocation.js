(function() {
    'use strict';

    angular.module('metro.services').factory('Geolocation', Geolocation);

    Geolocation.$inject = ['$log', '$rootScope', '$q'];

    function Geolocation($log, $rootScope, $q) {
        var locationWatch;

        function setPosition(position) {
            var coords = position.coords || {};
            if(angular.isNumber(coords.latitude) && angular.isNumber(coords.longitude)) {
                $rootScope.userPosition = {
                    lat: coords.latitude,
                    lng: coords.longitude
                };
            }
            return $rootScope.userPosition;
        }
        
        return {

            getPosition: function() {
                var deferred = $q.defer();
                
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function(position) {
                        deferred.resolve(setPosition(position));
                    });
                }
                
                return deferred.promise;
            },
            
            stopLocating: function() {
                if (locationWatch) {
                    navigator.geolocation.clearWatch(locationWatch);
                }
            },

            startLocating: function() {
                if (navigator.geolocation) {
                    locationWatch = navigator.geolocation.watchPosition(function(position) {
                        setPosition(position);
                        $rootScope.$emit('map.geolocationupdate');
                    }, undefined, { timeout: 30000 });
                }
            }
        };
    }

})();