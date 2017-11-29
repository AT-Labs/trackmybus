(function() {
    'use strict';
    
    // AT Metro APP
    angular.module('metro', ['ionic', 'ngAnimate', 'lokijs', 'angular-loading-bar', 'envConfig', 'metro.controllers', 'metro.models', 'metro.services', 'metro.directives'])

    .constant('appConfig', {
        site: {
            root: 'https://at.govt.nz'
        },
        atMobileSplash: {
            android: {
                atMobileLink: 'https://play.google.com/store/apps/details?id=nz.govt.at.atmobile',
                atMobileImg: 'img/at-tmb-android.png',
                atMobileImgResp: 'img/at-tmb-android.png 1x, img/at-tmb-android@2x.png 2x, img/at-tmb-android@3x.png 3x'
            },
            ios: {
                decommissioningDate: moment('2018-02-01', 'YYYY-MM-DD'),
                atMobileLink: 'https://itunes.apple.com/nz/app/at-mobile/id1207704356',
                atMobileImg: 'img/at-tmb-ios.png',
                atMobileImgResp: 'img/at-tmb-ios.png 1x, img/at-tmb-ios@2x.png 2x, img/at-tmb-ios@3x.png 3x'
            }
        },
        api: {
            gtfsRoutes: {
                stops: 'gtfs/stops',
                updateStops: 'gtfs-restricted/getUpdatedStops',
                stopInfo: 'gtfs/stops/stopinfo/',
                routesByStopId: 'gtfs/routes/stopid/',
                shapeByTripId: 'gtfs/shapes/tripId/',
                versions: 'gtfs/versions'
            },
            realTimeRoutes: {
                realtime: 'public-restricted/realtime/',
                tripUpdates: 'public-restricted/realtime/tripUpdates/'
            },
            geocodeRoutes: {
                forwards: 'public-restricted/geocode/forward/'
            }
        },
        map: {
            centerAuckland: {
                lat: -36.849150,
                lng: 174.766216,
                zoom: 16
            },
            baselayers: {
                smartrak: {
                    name: 'smartrak',
                    type: 'xyz',
                    url: 'https://{s}.smartrak.co.nz/tile.py/osm-nz-light-alt/{z}/{x}/{y}.png?key=1104A4AE7B0A4603A30A894C817EF30E',
                }
            },
            boundsAuckland: {
                northEast: {
                    lat: -36.0,
                    lng: 176.0
                },
                southWest: {
                    lat: -37.9,
                    lng: 173.5
                }
            },
            defaults: {
                // Control Options
                zoomControl: false,
                // Interaction Options
                boxZoom: false,
                trackResize: false,
                bounceAtZoomLimits: false,
                // Keyboard Navigation Options
                keyboard: false,
                // Mousewheel Options
                scrollWheelZoom: false
            },
            attribution: '&copy; <a href="#" onclick="window.open(\'http://www.openstreetmap.org/copyright\', \'_system\', \'location=yes\'); return false;">OpenStreetMap</a> contributors',
            localStopsRadius: 500
        },
        http: {
            timeout: 20000
        },
        
        notification: {
            loadingError: {
                message: 'Oops! We were unable to load the stops info. Please check your connection and try again.',
                uiClass: 'error', // error, warning, info
                autoRemove: true
            },
            noTrackingInfo: {
                message: 'Sorry, no tracking data is available for this ride.',
                uiClass: 'error',
                autoRemove: true
            },
            offline: {
                message: 'Oops! It looks like you\'re offline. Some functionlity won\'t work!',
                uiClass: 'error' // error, warning, info
            },
            empty: {
                message: null,
                uiClass: ''
            }
        }
    });

})();