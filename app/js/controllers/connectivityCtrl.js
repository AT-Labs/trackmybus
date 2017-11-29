(function() {
    'use strict';

    /*
     *	device network connectivity
     */
    angular.module('metro.controllers').controller('ConnectivityCtrl', ConnectivityCtrl);

    ConnectivityCtrl.$inject = ['$rootScope', '$scope', '$log', '$timeout', 'appConfig'];

    function ConnectivityCtrl($rootScope, $scope, $log, $timeout, appConfig) {
        var eventListeners = [];

        $scope.notification = {};

        if (window.cordova && window.Connection) {
            // initial runtime / view change check
            if (navigator.connection.type.toLowerCase() === 'none') {
                $scope.notification = appConfig.notification.offline;
            } else {
                $scope.notification = appConfig.notification.empty;
            }
        }

        // listen for broadcast event for notification
        eventListeners.push($scope.$on('user.notification', function(e, notification) {
            $timeout(function() {
                $scope.notification = notification;
            });
            if(notification.autoRemove) {
                $timeout(function() {
                    $scope.notification = {};
                }, 5000);
            }
        }));

        $scope.$on('$destroy', function() {
            angular.forEach(eventListeners, function(eventListener) {
                eventListener();
            });
        });

    }

})();