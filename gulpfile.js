const gulp = require("gulp");
const sourcemaps = require("gulp-sourcemaps");
const plumber = require("gulp-plumber");
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

/* Fonts */
const fonter = require("gulp-fonter");
const ttf2woff2 = require("gulp-ttf2woff2");



/***** Paths *****/
const srcPath = "src/"
const buildPath = "dist/"

const path = {
    build: {
        html:   buildPath,
        css:    buildPath + "assets/css/",
        js:     buildPath + "assets/js/",
        images: buildPath + "assets/images/",
        fonts:  buildPath + "assets/fonts/"
    },
    src: {
        html:   srcPath + "*.html",
        css:    srcPath + "assets/scss/*.scss",
        js:     srcPath + "assets/js/*.js",
        images: srcPath + "assets/images/**/*.{jpg,jpeg,png,svg,gif,ico,webp}",
        fonts:  srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    watch: {
        html:   srcPath + "**/*.html",
        css:    srcPath + "assets/scss/**/*.scss",
        js:     srcPath + "assets/js/**/*.js",
        images: srcPath + "assets/images/**/*.{jpg,jpeg,png,svg,gif,ico,webp}",
        fonts:  srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    clean: "./" + buildPath
}


/***** Tasks *****/
function html() {
    return gulp.src(path.src.html, {base: srcPath})
        .pipe(plumber())
        .pipe(htmlMin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest(path.build.html))
        .pipe(browserSync.stream())
}

function css() {
    return gulp.src(path.src.css, {base: srcPath + "assets/scss/"})
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            cascade: true
        }))
        .pipe(gcmq())
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
        .pipe(browserSync.stream())
}

function js() {
    return gulp.src(path.src.js, {base: srcPath + 'assets/js/'})
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({
            suffix: ".min",
            extname: ".js"
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.stream())
}

function images() {
    return gulp.src(path.src.images)
        .pipe(plumber())
        .pipe(newer(path.build.images))
        .pipe(webp())
        .pipe(gulp.dest(path.build.images))
        .pipe(gulp.src(path.src.images))
        .pipe(newer(path.build.images))
        .pipe(imagemin())
        .pipe(gulp.dest(path.build.images))
        .pipe(browserSync.stream())
}

function fonts() {
    return gulp.src(path.src.fonts)
        .pipe(plumber())
        .pipe(newer(path.build.fonts))
        .pipe(fonter({
            formats: ['woff', 'ttf']
        }))
        .pipe(gulp.dest(path.build.fonts))
        .pipe(ttf2woff2())
        .pipe(gulp.dest(path.build.fonts))
        .pipe(browserSync.stream())
}

function server() {
    browserSync.init({
        server: {
            baseDir: "./" + buildPath,
        },
        notify: false,
        port: 3000,
        // tunnel: true,
    })
}

function clean() {
    return del(path.clean);
}

function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.images], images);
    gulp.watch([path.watch.fonts], fonts);
}

const build = gulp.series(clean, gulp.parallel(html, css, js, images, fonts));
const watch = gulp.parallel(build, watchFiles, server);


/***** Exports Tasks *****/
exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.fonts = fonts;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;