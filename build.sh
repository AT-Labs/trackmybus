#========================
# Prepare android sdk tools
# =======================
Download android-tools-25.zip to ~/Downloads
mv ~/Library/Android/sdk/tools ~/Library/Android/sdk/tools-backup
unzip ~/Downloads/android-tools-25.zip -d ~/Library/Android/sdk/
mv ~/Library/Android/sdk/android-tools-25 ~/Library/Android/sdk/tools

#========================
# setup node 6
# =======================
nvm install 6.14.3
nvm use v6

#========================
# setup auckland transport api key
# =======================
# please remember to replace place holder with the api key before running this script

API_SUBSCRIPTION_ID=XXXXXXXXXXXXXXXXXXXX
sed -ia "s|API_SUBSCRIPTION_ID|$API_SUBSCRIPTION_ID|g" ~/git/trackmybus/app/js/config.js

#========================
# clear all
# =======================
rm -fr app/lib platforms plugins www

#========================
# install packages
# =======================
npm install

#========================
# reinstall cordova plugins
# =======================

./node_modules/.bin/cordova plugin rm cordova-plugin-customurlscheme
sleep 5s
./node_modules/.bin/cordova plugin rm cordova-plugin-device
sleep 5s
./node_modules/.bin/cordova plugin rm cordova-plugin-geolocation
sleep 5s
./node_modules/.bin/cordova plugin rm cordova-plugin-file
sleep 5s
./node_modules/.bin/cordova plugin rm cordova-plugin-statusbar
sleep 5s
./node_modules/.bin/cordova plugin rm cordova-plugin-firebase
sleep 5s
./node_modules/.bin/cordova plugin rm cordova-plugin-google-analytics
sleep 5s
./node_modules/.bin/cordova plugin rm cordova-plugin-splashscreen
sleep 5s
./node_modules/.bin/cordova plugin rm ionic-plugin-keyboard
sleep 5s
./node_modules/.bin/cordova plugin rm cordova-plugin-whitelist
sleep 5s
./node_modules/.bin/cordova plugin rm cordova-plugin-network-information
sleep 5s
./node_modules/.bin/cordova plugin rm cordova-plugin-inappbrowser
sleep 5s

./node_modules/.bin/cordova plugin add cordova-plugin-device@2.0.1 -s
sleep 15s
./node_modules/.bin/cordova plugin add cordova-plugin-geolocation@2.4.3 -s
sleep 15s
./node_modules/.bin/cordova plugin add cordova-plugin-file@4.3.3 -s
sleep 15s
./node_modules/.bin/cordova plugin add cordova-plugin-statusbar@2.2.3 -s
sleep 15s
./node_modules/.bin/cordova plugin add cordova-plugin-firebase@0.1.25 -s
sleep 15s
./node_modules/.bin/cordova plugin add cordova-plugin-google-analytics@0.8.1 -s
sleep 15s
./node_modules/.bin/cordova plugin add cordova-plugin-splashscreen@4.0.3 -s
sleep 15s
./node_modules/.bin/cordova plugin add ionic-plugin-keyboard@2.2.1 -s
sleep 15s
./node_modules/.bin/cordova plugin add cordova-plugin-whitelist@1.3.3 -s
sleep 15s
./node_modules/.bin/cordova plugin add cordova-plugin-network-information@1.3.4 -s
sleep 15s
./node_modules/.bin/cordova plugin add cordova-plugin-inappbrowser@1.7.2 -s
sleep 15s
./node_modules/.bin/cordova plugin add cordova-plugin-customurlscheme --variable URL_SCHEME=attrackmyride -s

cp ~/Downloads/GoogleService-Info.plist ~/git/trackmybus/platforms/ios/Track\ My\ Bus/Resources

# ========================
# build for iOS
# =======================
# 
# open xcode
# set the Bundle Identifier in xcode: Targets > Track My Bus > General > Identity
# set the Version and Build in xcode: Targets > Track My Bus > General > Identity
# set design_resources/icon-1024.png as the 1024 x 1024 app icon in xcode: Targets > Track My Bus > General 
# achive in xcode

# ========================
# build for android
# =======================

# cordova build --release android
# mv platforms/android/build/outputs/apk/android-release.apk platforms/android/build/outputs/apk/android-release-signed.apk

