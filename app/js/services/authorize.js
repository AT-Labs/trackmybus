(function() {
    'use strict';

    /*
     *	Authorize request with HMAC
     */
    angular.module('metro.services').factory('Authorize', Authorize);

    Authorize.$inject = ['$q', '$http', '$log', 'envConfig'];

    function Authorize($q, $http, $log, envConfig) {
        var instance = {
            getAuthorization: function() {
                return '?subscription-key=' + envConfig.api.subscription;
            },
        };

        return instance;
    }

})();