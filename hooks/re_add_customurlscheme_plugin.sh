#!/bin/bash

# Manually add cordova-plugin-customurlscheme again with the correct variable
# This will correctly set the variable in ./plugins/fetch.json,
# which may have been removed when CI tools run `cordova plugin add cordova-plugin-customurlscheme` incorrectly without the variable flag

echo "re_add_customurlscheme_plugin.sh: re-running \"plugin add cordova-plugin-customurlscheme\", and set variable: URL_SCHEME=attrackmyride"
echo ""
cordova plugin add cordova-plugin-customurlscheme --variable URL_SCHEME=attrackmyride
