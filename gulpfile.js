'use strict'

const AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

var del = require('del'),
    gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    sequence = require('run-sequence');

/* Task: Compile SASS
--------------------------------------------------------------------------------- */
gulp.task('styles', () => {
	var options = {
        precison: 10,
	};

	return gulp
		.src([
			'resources/sass/**/*.scss'
		])
		.pipe(plugins.newer('storage/app/styles'))
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.sass(options).on('error', plugins.sass.logError))
        .pipe(plugins.autoprefixer(AUTOPREFIXER_BROWSERS))
        .pipe(gulp.dest('storage/app/styles'))
        .pipe(plugins.if('*.css', plugins.cssnano()))
        .pipe(plugins.cleanCss())
        .pipe(plugins.rename({ suffix: '.min' }))
        .pipe(plugins.size({ title: 'styles' }))
        .pipe(gulp.dest('app/styles'))
        .pipe(plugins.sourcemaps.write('./'))
        .pipe(gulp.dest('.dist/styles'))
        .pipe(gulp.dest('storage/app/styles'));
});

/* Task: Compile Scripts
--------------------------------------------------------------------------------- */
gulp.task('scripts', () =>
    gulp.src([
            'resources/scripts/**/*.js'
        ])
        .pipe(plugins.newer('storage/app/scripts'))
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.babel())
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest('storage/app/scripts'))
        .pipe(plugins.uglify({ preserveComments: 'some' }))
        .pipe(plugins.rename({ suffix: '.min' }))
        .pipe(plugins.size({ title: 'scripts' }))
        .pipe(gulp.dest('app/scripts'))
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(gulp.dest('.dist/scripts'))
        .pipe(gulp.dest('storage/app/scripts'))
);

/* Task: Compile Images - Optimizing Images
--------------------------------------------------------------------------------- */
gulp.task('images', () =>
    gulp.src([
            'resources/images/**/*'
        ])
        .pipe(plugins.cache(plugins.imagemin({
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('app/images'))
        .pipe(gulp.dest('.dist/images'))
        .pipe(gulp.dest('storage/app/images'))
        .pipe(plugins.size({ title: 'images' }))
);

/* Task: Copy all files at the root level (app)
--------------------------------------------------------------------------------- */
gulp.task('copy', () =>
    gulp.src([
        'app/*',
        '!app/*.html',
        'node_modules/apache-server-configs/dist/.htaccess'
    ], {
        dot: true
    })
    .pipe(gulp.dest('.dist'))
    .pipe(plugins.size({title: 'copy'}))
);


/* Task: Clean & Clean Cache
--------------------------------------------------------------------------------- */
gulp.task('clean', ['clean:cache', 'clean:app']);

/* Task: Clean Cache
--------------------------------------------------------------------------------- */
gulp.task('clean:cache', () => del(['storage/app/*', '!storage/app/.gitignore', '.dist/*', '!dist/.git'], { dot: true }));

/* Task: Clean Application
--------------------------------------------------------------------------------- */
gulp.task('clean:app', () => del(['app/*'], { dot: true }));

/* Task: Default - Build Production Files
--------------------------------------------------------------------------------- */
gulp.task('default', ['clean'], cb =>
    sequence(
        'styles', ['scripts', 'images', 'copy'],
        cb
    )
);
