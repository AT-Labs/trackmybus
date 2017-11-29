#!/bin/bash

PLIST=platforms/ios/*/*-Info.plist

cat << EOF |
Add :UIRequiresFullScreen bool YES
Add :NSAppTransportSecurity dict
Add :NSAppTransportSecurity:NSExceptionDomains dict
Add :NSAppTransportSecurity:NSExceptionDomains:at.govt.nz dict
Add :NSAppTransportSecurity:NSExceptionDomains:at.govt.nz:NSIncludesSubdomains bool YES
Add :NSAppTransportSecurity:NSExceptionDomains:at.govt.nz:NSTemporaryExceptionAllowsInsecureHTTPLoads bool YES
Add :UISupportedInterfaceOrientations array
Add :UISupportedInterfaceOrientations:0 string UIInterfaceOrientationPortrait
Add :UISupportedInterfaceOrientations:1 string UIInterfaceOrientationPortraitUpsideDown
Add :UISupportedInterfaceOrientations:2 string UIInterfaceOrientationLandscapeLeft
Add :UISupportedInterfaceOrientations:3 string UIInterfaceOrientationLandscapeRight
Set :CFBundleIdentifier nz.govt.at.track-my-ride-test
Add :ITSAppUsesNonExemptEncryption bool NO
EOF
while read line
do
    /usr/libexec/PlistBuddy -c "$line" $PLIST
done

true
