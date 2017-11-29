(function() {
    'use strict';

    /*
     *	generic UI notifications
     *	TODO: make this truly generic as it currnetly only works for connectivity
     */
    angular.module('metro.directives').directive('notifyUser', NotifyUser);

    NotifyUser.$inject = [];

    function NotifyUser() {

        return {
            restrict: 'E',
            templateUrl: 'templates/notification.html'
        };

    }

})();