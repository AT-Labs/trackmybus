Track My Bus
=====================

## Suported platforms

* IOS >= 6
* Android >= 4.0

## Dependencies

* Node js
* Cordova
* Ionic
* IOS & Android dev tools (Xcode, JDK, Ant etc...)


## Initial installation for build and development

* Clone the repo
* Install libs with npm, gulp, and restore ios/android platforms, plugins for cordova. (Refer to package.json)

```bash
$ cd /path/to/at_metro_app
$ npm install
```

Project development directory is named 'app' - do all your work in here. Assets are copied from 'app' to 'www' directory by gulp watch task.

## Running the build

```npm start``` will build the app and run it in a web server. If you want to do specific builds you also have:

```bash
$ gulp build
$ ionic resources
$ ionic build <ios/android>
```

To build for a specific environment edit the placeholder values in all caps in `app/js/config.js`

```
angular.module('envConfig', [])
.constant('envConfig', {
        api: {
                root: 'https://api.at.govt.nz/v2/',
                subscription: 'API_SUBSCRIPTION_ID'
        }
});
```

To turn on debugging (displays any content wrapped in a debug element)
This section of gulp is currently commented out for safety.

```bash
$ gulp setdebug --debug <true/false>
```

## Testing

Testing in web browser

```bash
$ ionic serve
```

Testing in device or emulator

```bash
$ ionic run <ios/android>
```

Testing in emulator

```bash
$ ionic emulate <ios/android>
```

## Using Sass (optional)

This project uses Sass (the SCSS syntax). This enables you to override styles from Ionic, and benefit from Sass's great features.

Just update the `./scss/ionic.app.scss` file, and run `gulp` or `gulp watch` to rebuild the CSS files for Ionic.

Note: if you choose to use the Sass method, make sure to remove the included `ionic.css` file in `index.html`, and then uncomment
the include to your `ionic.app.css` file which now contains all your Sass code and Ionic itself:

```html
<!-- IF using Sass (run gulp sass first), then remove the CSS include above
<link href="css/ionic.app.css" rel="stylesheet">
-->
```

More info on this can be found on the Ionic [Getting Started](http://ionicframework.com/getting-started) page.

## Updating Ionic

To update to a new version of Ionic, open bower.json and change the version listed there.

For example, to update from version `1.0.0-beta.4` to `1.0.0-beta.5`, open bower.json and change this:

```
"ionic": "driftyco/ionic-bower#1.0.0-beta.4"
```

To this:

```
"ionic": "driftyco/ionic-bower#1.0.0-beta.5"
```

After saving the update to bower.json file, run `gulp install`.

Alternatively, install bower globally with `npm install -g bower` and run `bower install`.

#### Using the Nightly Builds of Ionic

If you feel daring and want use the bleeding edge 'Nightly' version of Ionic, change the version of Ionic in your bower.json to this:

```
"ionic": "driftyco/ionic-bower#master"
```

Warning: the nightly version is not stable.


## Issues
Issues have been disabled on this repo, if you do find an issue or have a question consider posting it on the [Ionic Forum](http://forum.ionicframework.com/).  Or else if there is truly an error, follow our guidelines for [submitting an issue](http://ionicframework.com/contribute/#issues) to the main Ionic repository. On the other hand, pull requests are welcome here!


if issues with cordova build or cordova prepare with message:
	cordova execvp(): Permission denied

Known issues with hokks permissions:
execute from git folder:

```bash
$sudo chmod -R 777 at_metro_app
$sudo chown -Rv <username> at_metro_app
```
