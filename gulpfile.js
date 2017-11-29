var args = require('yargs').argv;
var bower = require('bower');
var chmod = require('gulp-chmod');
var clean = require('gulp-clean');
var cleancss = require('gulp-clean-css');
var concat = require('gulp-concat');
var env = require('gulp-env');
var gulp = require('gulp');
var gutil = require('gulp-util');
var gulpif = require('gulp-if');
var html2js = require('gulp-html2js');
var htmlmin = require('gulp-htmlmin');
var preprocess = require('gulp-preprocess');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var templateCache = require('gulp-angular-templatecache');
var runSequence = require('run-sequence');
var sh = require('shelljs');
var uglify = require('gulp-uglify');
var eslint = require('gulp-eslint');

var paths = {
    hooks: ['hooks/**/*.js'],
    sass: ['app/scss/**/*.scss'],
    js: ['app/js/**/*.js'],
    html: {
        index: 'app/index.html',
        tpls: 'app/templates/**/*.html'
    },
    assets: [
        'app/img/**',
        'app/fonts/**'
    ],
    lib: {
        css: [
            'app/lib/ionic/css/ionic.css',
            'app/lib/leaflet/dist/leaflet.css',
            'app/lib/angular-loading-bar/build/loading-bar.css',
            'app/lib/leaflet.markercluster/dist/MarkerCluster.css',
            'app/lib/leaflet.markercluster/dist/MarkerCluster.Default.css'
        ],
        js: [
            'app/lib/angular/angular.js',
            'app/lib/angular-animate/angular-animate.js',
            'app/lib/angular-sanitize/angular-sanitize.js',
            'app/lib/angular-ui-router/release/angular-ui-router.js',
            'app/lib/ionic/js/ionic.js',
            'app/lib/ionic/js/ionic-angular.js',
            'app/lib/lokijs/src/lokijs.js',
            'app/lib/lokijs/src/loki-angular.js',
            'app/lib/loki-cordova-fs-adapter/bin/loki-cordova-fs-adapter.js',
            'app/lib/lodash/dist/lodash.js',
            'app/lib/moment/moment.js',
            'app/lib/leaflet/dist/leaflet-src.js',
            'app/lib/angular-loading-bar/build/loading-bar.js',
            'app/lib/leaflet.markercluster/dist/leaflet.markercluster-src.js'
        ],
        jsmin: [
            'app/lib/angular/angular.min.js',
            'app/lib/angular-animate/angular-animate.min.js',
            'app/lib/angular-sanitize/angular-sanitize.min.js',
            'app/lib/angular-ui-router/release/angular-ui-router.min.js',
            'app/lib/ionic/js/ionic.min.js',
            'app/lib/ionic/js/ionic-angular.min.js',
            'app/lib/lokijs/build/lokijs.min.js',
            'app/lib/lokijs/src/loki-angular.js',
            'app/lib/loki-cordova-fs-adapter/bin/loki-cordova-fs-adapter.js',
            'app/lib/lodash/dist/lodash.min.js',
            'app/lib/moment/min/moment.min.js',
            'app/lib/leaflet/dist/leaflet.js',
            'app/lib/angular-loading-bar/build/loading-bar.min.js',
            'app/lib/leaflet.markercluster/dist/leaflet.markercluster.js'
        ],
        fonts: [
            'app/lib/ionic/fonts/**'
        ]
    }
};

var isDebug = false;

/*
 *	make hooks *.js files executable
 */
gulp.task('set-hook-permissions', function(done) {
    gulp.src(paths.hooks)
        .pipe(chmod(755))
        .pipe(gulp.dest('hooks'))
        .on('end', done);
});

/*
 *	copy lib scripts and css to www
 */
gulp.task('libs:css', function(done) {
    gulp.src(paths.lib.css)
    .pipe(gulpif(!isDebug, concat('vendor.css')))
    .pipe(gulpif(!isDebug, cleancss({ keepSpecialComments: 0 })))
        .pipe(gulp.dest('www/lib/'))
        .on('end', done);
});
gulp.task('libs:scripts', function(done) {
    var libPath = isDebug ? paths.lib.js : paths.lib.jsmin;
    gulp.src(libPath)
        .pipe(gulpif(!isDebug, concat('vendor.js')))
        .pipe(gulpif(!isDebug, uglify({ mangle: false })))
        .pipe(gulp.dest('www/lib/'))
        .on('end', done);
});
gulp.task('libs:fonts', function(done) {
    gulp.src(paths.lib.fonts)
        .pipe(gulp.dest('www/fonts/'))
        .on('end', done);
});

/*
 *	Lint, concat, minify scripts and output to www
 */
gulp.task('scripts:lint', function() {
    return gulp.src(paths.js)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('scripts:mobile', function(done) {
    gulp.src(paths.js)
        .pipe(preprocess({ context: { debug: isDebug } }))
        .pipe(gulpif(!isDebug, concat('dist.js')))
        .pipe(gulpif(!isDebug, uglify({ mangle: false })))
        .pipe(gulp.dest('www/js/'))
        .on('end', done);
});

/*
 *	SCSS minify and output to www
 */
gulp.task('sass', function(done) {
    gulp.src('app/scss/ionic.app.scss')
        .pipe(sass({
            errLogToConsole: true,
            sourceComments: 'normal'
        }))
        .pipe(gulpif(!isDebug, cleancss({
            keepSpecialComments: 0
        })))
        .pipe(gulpif(!isDebug, rename({
            extname: '.min.css'
        })))
        .pipe(gulp.dest('www/css/'))
        .on('end', done);
});

/*
 *	HTML outputs to www
 */
gulp.task('html:index', function(done) {
    gulp.src(paths.html.index, { base: 'app/' })
        .pipe(preprocess({ context: { debug: isDebug } }))
        .pipe(gulp.dest('www'))
        .on('end', done);
});

gulp.task('html:tpls', function(done) {
    var dest = isDebug ? 'www/' : 'www/js/';
    gulp.src(paths.html.tpls, { base: 'app/' })
        .pipe(preprocess({ context: { debug: isDebug } }))
        .pipe(gulpif(!isDebug, templateCache('tpls.js', {
            module: 'metro',
            base: __dirname + '/app/',
            transformUrl: function(file) {
                return file.substring(file.indexOf('templates'));
            }
        })))
        .pipe(gulp.dest(dest))
        .on('end', done);
});

/*
 *	Watches
 */
gulp.task('watch', function() {
    isDebug = true;
    
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.js, ['scripts']);
    gulp.watch(paths.html.index, ['html:index']);
    gulp.watch(paths.html.tpls, ['html:tpls']);
});

gulp.task('assets', function(callback) {
    gulp.src(paths.assets, { base: 'app/' })
        .pipe(gulp.dest('www/'))
        .on('end', callback);
});

gulp.task('scripts', function(callback) {
    runSequence('scripts:lint', 'scripts:mobile', callback);
});

gulp.task('htmls', function(callback) {
    runSequence('html:index', 'html:tpls', callback);
});
gulp.task('libs', function(callback) {
    runSequence('libs:scripts', 'libs:css', 'libs:fonts', callback);
});

/*
 *	Build task
 */
gulp.task('assemble', ['set-hook-permissions', 'htmls', 'sass', 'scripts', 'libs', 'assets']);

/**
 *	Clean the director before build.
 */
gulp.task('build', function(callback) {
    runSequence('clean', 'assemble', callback);
});


/*
 *	Default task
 */
gulp.task('default', ['watch', 'assemble']);

//Clean build and production directories.
gulp.task('clean', function(callback) {
    return gulp.src('www', {
            read: false,
            force: true
        })
        .pipe(clean());
});
