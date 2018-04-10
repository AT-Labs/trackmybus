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

                if (window.FirebasePlugin && typeof window.device !== 'undefined') {
                    window.FirebasePlugin.setUserId(window.device.uuid);
                }
            },
            screen: function(name) {
                if (!name) {
                    return;
                }

                if (typeof analytics !== 'undefined') {
                    window.analytics.trackView(name);
                }

                if (window.FirebasePlugin) {
                    window.FirebasePlugin.setScreenName(name);
                }
            },
            event: function(category, action, label, value) {
                if (!category || !action) {
                    return;
                }

                if (typeof analytics !== 'undefined') {
                    window.analytics.trackEvent(category, action, label, value);
                }

                if (window.FirebasePlugin) {
                    var params = value ? { 'item_id': value } : {};
                    window.FirebasePlugin.logEvent(action, params);
                }
            }
        };
    }

})();