(function() {
    'use strict';

    /*
     *	API config
     */
    angular.module('envConfig', [])
        .constant('envConfig', {
            api: {
                root: 'https://api.at.govt.nz/v2/',
                subscription: 'API_SUBSCRIPTION_ID'
            }
        });
})();