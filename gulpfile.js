const gulp = require("gulp");
const ts = require("gulp-typescript");

const libs = {
  tsCompiler: ts.createProject("tsconfig.json"),
  sass: require("gulp-sass")
};

gulp.task(
  "scripts",
  gulp.series(() => {
    return gulp
      .src("src/**/*.ts")
      .pipe(libs.tsCompiler())
      .pipe(gulp.dest("build"));
  })
);

gulp.task(
  "sass",
  gulp.series(() => {
    return gulp
      .src("src/scss/main.scss")
      .pipe(libs.sass().on("error", libs.sass.logError))
      .pipe(gulp.dest("build"));
  })
);

gulp.task(
  "html",
  gulp.series(() => {
    return gulp.src("src/public/*.html").pipe(gulp.dest("build"));
  })
);

gulp.task(
  "config",
  gulp.series(() => {
    return gulp.src("src/config.json").pipe(gulp.dest("build"));
  })
);
gulp.task(
  "package",
  gulp.series(() => {
    return gulp.src("package.json").pipe(gulp.dest("build"));
  })
);

gulp.task(
  "default",
  gulp.parallel("scripts", "html", "sass", "config", "package")
);
