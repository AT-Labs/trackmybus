(function() {
    'use strict';

    angular.module('metro.directives').directive('debugPanel', DebugPanel);

    DebugPanel.$inject = [];

    function DebugPanel() {

        return {
            restrict: 'EA',
            scope: {
                minimized: '=minimized' // boolean
            },
            link: function(scope, element) {
                element.find('a').on('click', function() {
                    if (scope.minimized) {
                        element.removeClass('minimized');
                        scope.minimized = false;
                    } else {
                        element.addClass('minimized');
                        scope.minimized = true;
                    }
                });
            }
        };

    }

})();