(function() {
    'use strict';

    /*
     *	user saved stops
     */
    // Note: Inject GTFS service here to start pre-loading of stops.
    angular.module('metro.controllers').controller('StopsCtrl', StopsCtrl);

    StopsCtrl.$inject = ['$ionicHistory', '$ionicListDelegate', '$ionicModal', '$rootScope', '$scope', '$state', '$log', '$timeout', 'appConfig', 'UserPreferences', 'UserStops', 'GTFS', 'Analytics'];

    function StopsCtrl($ionicHistory, $ionicListDelegate, $ionicModal, $rootScope, $scope, $state, $log, $timeout, appConfig, UserPreferences, UserStops, GTFS, Analytics) {
        var eventListeners = [];

        function loadStops() {
            var stops = UserStops.getStops();

            if (!_.isArray(stops) || !stops.length) {
                $scope.stops = [];
                $ionicHistory.nextViewOptions({
                    disableAnimate: true,
                    disableBack: true
                });
                $state.go('addstop', null, { location: 'replace' });
            } else {
                $scope.stops = stops.reduce(function(result, stop) {
                    var className = stop.label.indexOf('Stop ') !== 0 ? 'labelledstop' : '';
                    var icon = 'ATicon-' + stop.type;
                    return result.concat(_.assign(stop, {
                        className: className,
                        icon: icon
                    }));
                }, []);
            }
        }

        function startListening() {
            eventListeners.push($rootScope.$on('stopsUpdated', loadStops));
        }

        function stopListening() {
            angular.forEach(eventListeners, function(eventListener) {
                eventListener();
            });
            eventListeners = [];
        }

        $scope.data = {
            showReorder: false
        };

        var enableRowSwipe;

        $scope.delete = function(stop) {
            UserStops.removeStop(stop);
            loadStops();

            // TODO: this is a bit hacky but a refactor of UserData to return a promise would be required in order to do it properly
            // this disables swipe on any subsequent row
            $scope.data.showDelete = true;

            if (enableRowSwipe) {
                $timeout.cancel(enableRowSwipe);
            }

            // re-enable after delay
            enableRowSwipe = $timeout(function() {
                $scope.data.showDelete = false;
            }, 100);

        };

        $scope.toggleReorder = function() {
            $scope.data.showReorder = !$scope.data.showReorder;
        };

        $scope.moveStop = function(stop, $fromIndex, $toIndex) {
            UserStops.reorderStop($fromIndex, $toIndex);
            loadStops();
        };

        $scope.$on('$ionicView.beforeEnter', function() {
            loadStops();

            // if 0 saved stops route to addstop view
            if (_.isArray($scope.stops) && $scope.stops.length) {
                Analytics.screen('favourite stops');

                $ionicListDelegate.closeOptionButtons();
                $ionicHistory.clearHistory();
                
                if(UserPreferences.displayAtMobileInfo()) {
                    $log.info('Displaying the AT Mobile presentation page');
                    var atMobileInfoModal;
                    
                    var platform = ionic.Platform.platform();
                    $scope.platform = platform;
                    var atMobileSplashData = platform === 'android' ? appConfig.atMobileSplash.android : appConfig.atMobileSplash.ios;
                    $scope.atMobileSplash = atMobileSplashData;

                    $scope.openAtMobile = function() {
                        if (window.cordova) {
                            cordova.InAppBrowser.open(atMobileSplashData.atMobileLink, '_system');
                        }
                    };
                    
                    $scope.closeAtMobileInfo = function() {
                        if (atMobileInfoModal.isShown()) {
                            atMobileInfoModal.hide().then(function() {
                                return atMobileInfoModal.remove();
                            }).then(function() {
                                atMobileInfoModal = undefined;
                            });
                        }
                    };
                    
                    $ionicModal.fromTemplateUrl('templates/at-mobile-info.html', {
                        scope: $scope,
                        animation: 'none'
                    }).then(function(modal) {
                        atMobileInfoModal = modal;
                        return modal.show();
                    }).then(function() {
                        $rootScope.hideSplashscreen();
                    });
                    
                    UserPreferences.saveAtMobileInfoDisplayed();
                } else {
                    $rootScope.hideSplashscreen();
                }
            }

            startListening();
        });

        $scope.$on('$ionicView.beforeLeave', stopListening);

    }

})();