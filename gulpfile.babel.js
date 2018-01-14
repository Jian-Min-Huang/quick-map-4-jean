'use strict';

import gulp from "gulp";
import fs from "fs";
import fileinclude from "gulp-file-include";
import concat from "gulp-concat";
import babel from "gulp-babel";
import uglify from "gulp-uglify";
import rename from "gulp-rename";
import minifyCSS from "gulp-csso";

const SRC = "./src";
const DEST = "./build";

const JsFileDependencies = [
    "./vendors/jquery/jquery.min.js",
    "./vendors/jquery-ui-1.12.1/jquery-ui.js",
    "./src/js/main.js"
];

const MobileCssFileDependencies = [
    "./vendors/jquery-ui-1.12.1/jquery-ui.css",
    "./src/css/main_m.css"
];

const DesktopCssFileDependencies = [
    "./vendors/jquery-ui-1.12.1/jquery-ui.css",
    "./src/css/main.css"
];

gulp.task("versioning", function () {
    fs.writeFileSync("./src/html/version.html", new Date().toLocaleString(), "");
});

gulp.task("html", ["versioning"], function () {
    gulp.src(SRC + "/html/*.html")
        .pipe(fileinclude({
            prefix: "@@",
            basepath: "@file"
        }))
        .pipe(gulp.dest(DEST));
});

gulp.task("js", function () {
    gulp.src(JsFileDependencies)
        .pipe(concat("bundle.js"))
        // .pipe(uglify())
        // .pipe(rename(function (path) {
        //     path.basename += ".min";
        //     path.extname = ".js";
        // }))
        .pipe(gulp.dest(DEST));
});

gulp.task("css_m", function () {
    gulp.src(MobileCssFileDependencies)
        .pipe(concat("bundle_m.css"))
        .pipe(minifyCSS())
        .pipe(rename(function (path) {
            path.basename += ".min";
            path.extname = ".css";
        }))
        .pipe(gulp.dest(DEST + "/css"));
});

gulp.task("css", function () {
    gulp.src(DesktopCssFileDependencies)
        .pipe(concat("bundle.css"))
        .pipe(minifyCSS())
        .pipe(rename(function (path) {
            path.basename += ".min";
            path.extname = ".css";
        }))
        .pipe(gulp.dest(DEST + "/css"));
});

gulp.task("default", ["html", "js", "css_m", "css"]);

gulp.task("watch", function () {
    gulp.watch("src/**", ["default"]);
});