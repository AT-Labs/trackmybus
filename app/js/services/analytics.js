(function() {
    'use strict';

    angular.module('metro.services').factory('Analytics', Analytics);

    Analytics.$inject = [];

    function Analytics() {
        return {
            startTracking: function() {
                if (typeof analytics !== 'undefined') {
                    window.analytics.startTrackerWithId('UA-54472828-1');
                }
            },
            debugMode: function() {
                if (typeof analytics !== 'undefined') {
                    window.analytics.debugMode();
                }
            },
            screen: function(name) {
                if (!name)
                    return;

                if (typeof analytics !== 'undefined') {
                    window.analytics.trackView(name);
                }
            },
            event: function(category, action, label, value) {
                if (!category || !action)
                    return;

                if (typeof analytics !== 'undefined') {
                    window.analytics.trackEvent(category, action, label, value);
                }
            }
        };
    }

})();