(function() {
    'use strict';

    /*
     *	'first-time' landing view
     */
    angular.module('metro.controllers').controller('IntroCtrl', IntroCtrl);

    IntroCtrl.$inject = ['$ionicHistory', '$ionicModal', '$log', '$rootScope', '$scope', '$state', 'appConfig', 'Analytics', 'UserPreferences', 'UserStops'];

    function IntroCtrl($ionicHistory, $ionicModal, $log, $rootScope, $scope, $state, appConfig, Analytics, UserPreferences, UserStops) {

        var atMobileInfoModal, tutorialModal;
        
        var platform = ionic.Platform.platform();
        $scope.platform = platform;
        var atMobileSplashData = platform === 'android' ? appConfig.atMobileSplash.android : appConfig.atMobileSplash.ios;
        $scope.atMobileSplash = angular.extend(atMobileSplashData, {
            isDecommisioned: atMobileSplashData.decommissioningDate && atMobileSplashData.decommissioningDate.isBefore(moment()),
            decommissioningDate: atMobileSplashData.decommissioningDate && atMobileSplashData.decommissioningDate.format('D MMMM YYYY')
        });

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

        $scope.closeTutorial = function() {
            if (tutorialModal && tutorialModal.isShown()) {
                tutorialModal.hide().then(function() {
                    return tutorialModal.remove();
                }).then(function() {
                    tutorialModal = undefined;
                });
            }
        };

        $scope.$on('$ionicView.beforeEnter', function() {
            if (!UserStops.isEmpty()) {
                $ionicHistory.nextViewOptions({
                    disableAnimate: true,
                    disableBack: true
                });
                $state.go('stops', null, { location: 'replace' });
            } else {
                Analytics.screen('intro');
                
                $ionicHistory.clearHistory();
            }
        });
        
        $scope.$on('$ionicView.afterEnter', function() {
            if(UserPreferences.displayAtMobileInfo()) {
                $log.info('Displaying the AT Mobile presentation page');
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
            } else if(UserPreferences.displayIntro()) {
                $log.info('Displaying the application tutorial');
                $ionicModal.fromTemplateUrl('templates/tutorial.html', {
                    scope: $scope,
                    animation: 'none'
                }).then(function(modal) {
                    tutorialModal = modal;
                    return modal.show();
                }).then(function() {
                    $rootScope.hideSplashscreen();
                });
                
                UserPreferences.saveIntroDisplayed();
            } else {
                $rootScope.hideSplashscreen();
            }
        });
        
    }

})();