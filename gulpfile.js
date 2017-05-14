'use strict';

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
    path = require('path'),
    plugins = require('gulp-load-plugins')(),
    sequence = require('run-sequence'),
    syncBrowser = require('browser-sync');

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

/* Task: Compile Views by using Pug
--------------------------------------------------------------------------------- */
gulp.task('views', () => {
    var options = {
        pretty: true,
    };

    return gulp
        .src([
            'resources/views/**/*.pug',
            '!resources/views/layouts/*.pug',
            '!resources/views/partials/*.pug'
        ])
        .pipe(plugins.pug(options))
        .pipe(gulp.dest('app'))
});

/* Task: HTML Formatter
--------------------------------------------------------------------------------- */
gulp.task('views:prettify', () => {
    var options = {
        indent_size: 4,
        indent_inner_html: true,
        unformatted: ['pre', 'code']
    };

    return gulp
        .src([
            'app/**/*.html'
        ])
        .pipe(plugins.prettify(options))
        .pipe(gulp.dest('./'))
});

/* Task: Lint Javascript
--------------------------------------------------------------------------------- */
gulp.task('lint', () =>
    gulp.src(['app/scripts/**/*.js','!node_modules/**'])
        .pipe(plugins.eslint())
        .pipe(plugins.eslint.format())
        .pipe(plugins.if(!syncBrowser.active, plugins.eslint.failAfterError()))
);

/* Task: Serve Browser Sync & Watch from App
--------------------------------------------------------------------------------- */
gulp.task('serve', ['scripts', 'styles'], () => {
    syncBrowser({
        notify: false,
        logPrefix: 'WSK',
        scrollElementMapping: ['main'],
        server: ['storage/app', 'app'],
        port: 3000
    });

    gulp.watch(['app/**/*.html'], reload);
    gulp.watch(['app/styles/**/*.{scss,css}'], ['styles', reload]);
    gulp.watch(['app/scripts/**/*.js'], ['lint', 'scripts', reload]);
    gulp.watch(['app/images/**/*'], reload);
});

/* Task: Serve Browser Sync from Dist
--------------------------------------------------------------------------------- */
gulp.task('serve:dist', ['default'], () =>
    browserSync({
        notify: false,
        logPrefix: 'WSK',
        scrollElementMapping: ['main'],
        server: '.dist',
        port: 3001
    })
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
gulp.task('clean:app', () => del(['app/images/*', 'app/scripts/*', 'app/styles/*', 'app/*', '!app/*.ico'], { dot: true }));

/* Task: Default - Build Production Files
--------------------------------------------------------------------------------- */
gulp.task('default', ['clean'], cb =>
    sequence(
        'styles',
        ['lint', 'scripts', 'images', 'views', 'views:prettify', 'copy'],
        cb
    )
);
