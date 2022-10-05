const gulp = require("gulp");
const sourcemaps = require("gulp-sourcemaps");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const rename = require("gulp-rename");
const del = require("del");
const browserSync = require("browser-sync").create();

/* HTML */
const htmlMin = require("gulp-htmlmin");

/* CSS */
const sass = require("gulp-sass")(require("sass"));
const autoprefixer = require("gulp-autoprefixer");
const cleanCSS = require("gulp-clean-css");
const gcmq = require("gulp-group-css-media-queries");

/* JS */
const uglify = require("gulp-uglify");

/* Img */
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const webp = require("gulp-webp");
const svgSprite = require("gulp-svg-sprite");

/* Fonts */
const fonter = require("gulp-fonter");
const ttf2woff2 = require("gulp-ttf2woff2");



/***** Paths *****/
const srcPath = "src/";
const buildPath = "dist/";

const path = {
    build: {
        html:   buildPath,
        css:    buildPath + "assets/css/",
        js:     buildPath + "assets/js/",
        images: buildPath + "assets/images/",
        svgsprite: buildPath + "/assets/images/sprite/*.svg",
        fonts:  buildPath + "assets/fonts/"
    },
    src: {
        html:   srcPath + "*.html",
        css:    srcPath + "assets/scss/*.scss",
        js:     srcPath + "assets/js/*.js",
        images: srcPath + "assets/images/**/*.{jpg,jpeg,png,svg,gif,ico,webp}",
        svisprite: srcPath + "assets/images/sprite/*.svg",
        fonts:  srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    watch: {
        html:   srcPath + "**/*.html",
        css:    srcPath + "assets/scss/**/*.scss",
        js:     srcPath + "assets/js/**/*.js",
        images: srcPath + "assets/images/**/*.{jpg,jpeg,png,svg,gif,ico,webp}",
        svgsprite: srcPath + "assets/images/sprite/*.svg",
        fonts:  srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    clean: "./" + buildPath
};


/***** Tasks *****/
function html() {
    return gulp.src(path.src.html, {base: srcPath})
        .pipe(plumber({
            errorHandler : function(err) {
                notify.onError({
                    title:    "HTML Error",
                    message:  "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(plumber())
        .pipe(htmlMin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest(path.build.html))
        .pipe(browserSync.stream());
}

function css() {
    return gulp.src(path.src.css, {base: srcPath + "assets/scss/"})
        .pipe(plumber({
            errorHandler : function(err) {
                notify.onError({
                    title:    "CSS Error",
                    message:  "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            cascade: true
        }))
        .pipe(gcmq())
        .pipe(gulp.dest(path.build.css))
        .pipe(cleanCSS({
            level: {
                1: {
                    specialComments: 0,
                }
            }
        }))
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.build.css))
        .pipe(browserSync.stream());
}

function js() {
    return gulp.src(path.src.js, {base: srcPath + 'assets/js/'})
        .pipe(plumber({
            errorHandler : function(err) {
                notify.onError({
                    title:    "JS Error",
                    message:  "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({
            suffix: ".min",
            extname: ".js"
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.stream());
}

function images() {
    return gulp.src([path.src.images, "!src/assets/images/sprite/*.svg"])
        .pipe(plumber({
            errorHandler : function(err) {
                notify.onError({
                    title:    "IMAGES Error",
                    message:  "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(newer(path.build.images))
        .pipe(webp())
        .pipe(gulp.dest(path.build.images))
        .pipe(gulp.src([path.src.images, "!src/assets/images/sprite/*.svg"]))
        .pipe(newer(path.build.images))
        .pipe(imagemin())
        .pipe(gulp.dest(path.build.images))
        .pipe(browserSync.stream());
}

function svgsprite() {
    return gulp.src(path.src.svisprite)
        .pipe(plumber({
            errorHandler : function(err) {
                notify.onError({
                    title:    "SVG Error",
                    message:  "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(newer(path.build.svgsprite))
        .pipe(svgSprite({
            shape: {
                transform: [{
                    "svgo": {
                        "plugins": [
                            { removeViewBox: false },
                            { removeUnusedNS: false },
                            { removeUselessStrokeAndFill: true },
                            { cleanupIDs: false },
                            { removeComments: true },
                            { removeEmptyAttrs: true },
                            { removeEmptyText: true },
                            { collapseGroups: true },
                            { removeAttrs: { attrs: '(fill|stroke|style)' } }
                        ]
                    }
                }]
            },
            mode: {
                symbol: {
                    sprite: "../sprite/sprite.svg"
                }
            },
        }))
        .pipe(gulp.dest(path.build.images))
        .pipe(browserSync.stream());
}

function fonts() {
    return gulp.src(path.src.fonts)
        .pipe(plumber({
            errorHandler : function(err) {
                notify.onError({
                    title:    "FONTS Error",
                    message:  "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(newer(path.build.fonts))
        .pipe(fonter({
            formats: ['woff', 'ttf', 'eot']
        }))
        .pipe(gulp.dest(path.build.fonts))
        .pipe(ttf2woff2())
        .pipe(gulp.dest(path.build.fonts))
        .pipe(browserSync.stream());
}

function server() {
    browserSync.init({
        server: {
            baseDir: "./" + buildPath,
        },
        notify: false,
        port: 3000,
        // tunnel: true,
    });
}

function clean() {
    return del(path.clean);
}

function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.images], images);
    gulp.watch([path.watch.svgsprite], svgsprite);
    gulp.watch([path.watch.fonts], fonts);
}

const build = gulp.series(clean, gulp.parallel(html, css, js, images, svgsprite, fonts));
const watch = gulp.parallel(build, watchFiles, server);


/***** Exports Tasks *****/
exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.svgsprite = svgsprite;
exports.fonts = fonts;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;
