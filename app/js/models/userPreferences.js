(function() {
    'use strict';

    angular.module('metro.models').factory('UserPreferences', UserPreferences);

    UserPreferences.$inject = ['$log', 'appConfig', 'Database'];

    function UserPreferences($log, appConfig, Database) {

        function getPreference(key) {
            var preference = Database.collections.userPreferences.findOne({ 'key': key });
            if(preference) {
                return preference.value;
            }
        }

        function savePreference(key, value) {
            var savedPreference = Database.collections.userPreferences.findOne({ 'key': key });
            
            if(savedPreference) {
                savedPreference.value = value;
                Database.collections.userPreferences.update(savedPreference);
            } else {
                Database.collections.userPreferences.insert({
                    key: key,
                    value: value
                });
            }
        }

        function displayIntro() {
            var tutorialDisplayed = getPreference('tutorialDisplayed');
            return tutorialDisplayed !== true;
        }

        function saveIntroDisplayed() {
            savePreference('tutorialDisplayed', true);
        }

        function displayAtMobileInfo() {
            var isAndroid = ionic.Platform.platform() === 'android';
            var version = ionic.Platform.version();
            // Do not display the splash screen for android 4.x devices
            if (isAndroid && version < 5) {
                return false;
            }

            var atMobileInfoDisplayed = getPreference('atMobileInfoDisplayed');
            var displayDate = moment(atMobileInfoDisplayed);
            if (_.isString(atMobileInfoDisplayed) && displayDate.isValid()) {
                return moment().subtract(7, 'days').isAfter(displayDate);
            }
            return true;
        }

        function saveAtMobileInfoDisplayed() {
            savePreference('atMobileInfoDisplayed', moment().toISOString());
        }

        return {
            displayIntro: displayIntro,
            saveIntroDisplayed: saveIntroDisplayed,
            displayAtMobileInfo: displayAtMobileInfo,
            saveAtMobileInfoDisplayed: saveAtMobileInfoDisplayed
        };
    }

})();