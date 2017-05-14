'use strict'

var del = require('del'),
    gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    prefixer = require('autoprefixer'),
    sequence = require('run-sequence');

var prefixerOpts = {
    browsers: ['> 1%', 'last 10 versions', 'Firefox ESR', 'Opera 12.1']
};

/* Task: Compile SASS
--------------------------------------------------------------------------------- */
gulp.task('styles', function() {
	var options = {
		outputStyle: 'expanded',
        precison: 3,
        errLogToConsole: true
	};

	return gulp
		.src([
			'resources/sass/**/*.scss'
		])
		.pipe(plugins.newer('storage/app/styles'))
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.sass(options).on('error', plugins.sass.logError))
        .pipe(plugins.postcss([
            prefixer(prefixerOpts)
        ]))
        .pipe(gulp.dest('app/styles'))
        .pipe(gulp.dest('storage/app/styles'));
});

/* Task: Clean & Clean Cache
--------------------------------------------------------------------------------- */
gulp.task('clean', () => del(['storage/app/*', '!storage/app/.gitignore'], { dot: true }));

/* Task: Clean Cache
--------------------------------------------------------------------------------- */
gulp.task('clean:cache', () => del(['storage/app/*', '!storage/app/.gitignore'], { dot: true }));

/* Task: Default - Build Production Files
--------------------------------------------------------------------------------- */
gulp.task('default', ['clean'], cb =>
    sequence(
        'styles',
        cb
    )
);
