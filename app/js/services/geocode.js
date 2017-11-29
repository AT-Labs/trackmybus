(function() {
    'use strict';

    angular.module('metro.services').factory('Geocode', Geocode);

    Geocode.$inject = ['$http', '$q', '$log', 'appConfig', 'envConfig', 'Authorize'];

    function Geocode($http, $q, $log, appConfig, envConfig, Authorize) {
        var instance = {
            addresses: []
        };

        var apiRoot = envConfig.api.root;

        instance.search = function(query) {
            var deferred = $q.defer();

            var promise = $http.get(apiRoot + appConfig.api.geocodeRoutes.forwards + Authorize.getAuthorization() + '&query=' + query, {
                // don't display loading bar for these requests
                ignoreLoadingBar: true
            });

            promise.then(function(result) {

                instance.addresses = _.map(result.data.response.addresses, function(res) {
                    return {
                        address: res.address.split('\n')[0],
                        lat: res.lat,
                        lng: res.lng
                    };
                });

                // limit to five results
                if (instance.addresses.length > 5) {
                    instance.addresses.length = 5;
                }

                deferred.resolve(instance.addresses);
            });

            return deferred.promise;
        };
        return instance;
    }

})();