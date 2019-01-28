const gulp = require("gulp");
const env = process.env.NODE_ENV;
const browserSync = require("browser-sync").create();
const reload = browserSync.reload;
const $webpack = require("webpack-stream");
const webpack = require("webpack");
const del = require("del");
const plumber = require("gulp-plumber");
const sourcemaps = require("gulp-sourcemaps");
const postcss = require("gulp-postcss");
const rename = require("gulp-rename");
const $if = require("gulp-if");
const pug = require("gulp-pug");
const svgmin = require("gulp-svgmin");
const cheerio = require("gulp-cheerio");
const replace = require("gulp-replace");
const svgSprite = require("gulp-svg-sprite");

const paths =  {
  src: "./src",              // paths.src
  dist: "./dist"           // paths.dist
};

// стили
gulp.task("styles", () => {
  return gulp
    .src(`${paths.src}/assets/styles/main.scss`)
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(postcss(require("./postcss.config")))
    .pipe(rename("main.min.css"))
    .pipe($if(env === "development", sourcemaps.write()))
    .pipe(gulp.dest(`${paths.dist}`))
    .pipe(reload({ stream: true }));
});

// переносим шрифты
gulp.task("fonts", () => {
  return gulp
    .src(`${paths.src}/assets/fonts/**`)
    .pipe(gulp.dest(`${paths.dist}/assets/fonts/`));
});

// очистка
gulp.task("clean", () => {
  return del(`${paths.dist}`);
});

// собираем скрипты webpack
gulp.task("scripts", () => {
  return gulp
    .src(`${paths.src}/assets/scripts/*.js`)
    .pipe(plumber())
    .pipe(
      $webpack(
        {
          ...require("./webpack.config"),
          mode: env
        },
        webpack
      )
    )
    .pipe(gulp.dest(`${paths.dist}`))
    .pipe(reload({ stream: true }));
});

//рендерим странички
gulp.task("pug", () => {
  return gulp
    .src(`${paths.src}/views/pages/*.pug`)
    .pipe(plumber())
    .pipe(pug({pretty:true}))
    .pipe(gulp.dest(`${paths.dist}`))
    .pipe(reload({ stream: true }));
});

// dev сервер + livereload (встроенный)
gulp.task("server", () => {
  browserSync.init({
    server: {
      baseDir: `${paths.dist}`
    },
    open: true
  });
});

// спрайт иконок
gulp.task("svg", done => {
  return gulp
    .src(`${paths.src}/assets/images/icons/*.svg`)
    .pipe(
      svgmin({
        js2svg: {
          pretty: true
        },
        plugins: [

        ]
      })
    )
    .pipe(
      cheerio({
        run($) {
          $("[fill], [stroke], [style], [width], [height]")
            .removeAttr("fill")
            .removeAttr("stroke")
            .removeAttr("style");
        },
        parserOptions: { xmlMode: true }
      })
    )
    .pipe(replace("&gt;", ">"))
    .pipe(
      svgSprite({
        mode: {
          symbol: {
            sprite: "../sprite.svg"
          }
        }
      })
    )
    .pipe(gulp.dest(`${paths.dist}/assets/images/icons`));
});

// просто переносим картинки
gulp.task("images", () => {
  return gulp
    .src([
      `${paths.src}/assets/images/**/*.*`,
      `!${paths.src}/assets/images/icons/*.*`
    ])
    .pipe(gulp.dest(`${paths.dist}/assets/images/`));
});

// галповский вотчер
gulp.task("watch", () => {
  gulp.watch(`${paths.src}/assets/styles/**/*.scss`, gulp.series("styles"));
  gulp.watch(`${paths.src}/assets/images/**/*.*`, gulp.series("images"));
  gulp.watch(`${paths.src}/assets/scripts/**/*.js`, gulp.series("scripts"));
  gulp.watch(`${paths.src}/assets/fonts/*`, gulp.series("fonts"));
  gulp.watch(`${paths.src}/views/**/*.pug`, gulp.series("pug"));
});

// GULP:DEV
gulp.task(
  "default",
  gulp.series(
    "clean",
    "svg",
    gulp.parallel("styles", "pug", "images", "fonts", "scripts"),
    gulp.parallel("watch", "server")
  )
);

// GULP:build
gulp.task(
  "build",
  gulp.series(
    "clean",
    "svg",
    gulp.parallel("styles", "pug", "images", "fonts", "scripts")
  )
);



