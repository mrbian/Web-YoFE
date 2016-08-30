/**
 * gulp 自动化文件
 *
 * @author <%= author %>
 * @createDate <%= date %>
 */
"use strict";

const path = require("path");
const gulp = require("gulp");
const cluster = require("cluster");
const runSequence = require("run-sequence");
const readline = require("readline");
const fs = require("fs");
const watch = require("gulp-watch");
const webpack = require("webpack");

const gutil = require("gulp-util");

var task = process.argv[2];
var debug =  task == "dev" || task == "add";
var webpackConf = debug ? require("./webpack-dev.config") : require("./webpack.config");
var src = process.cwd() + "/src";
var assets = process.cwd() + "/assets";

/**
 * 创建队列维护webpack进程
 * @constructor
 */
function Queue(){
    var self = this;
    self.length = 0;
    self.front = 0;
    self.rear = 0;
    self.elem = [];
    self.inQueue = function(ele){
        self.elem[rear] = ele;
        self.rear ++;
        self.length ++;
    };
    self.outQueue = function(){
        if(self.front == self.rear){
            return;
        }
        self.length --;
        self.front ++;
        return self.elem[self.front - 1];
    };
    self.isEmpty = function(){
        return self.front == self.rear;
    };

    /**
     * 清空队列，并对每个栈顶元素执行回调函数
     * @param callback
     */
    self.clearQueue = function(callback){
        for(var idx = self.front; idx < self.rear; idx ++){
            callback(self.outQueue());
        }
    };
}

var queue = new Queue();

var killChildProcess = function(child){
    child.kill();
};

// clean assets
gulp.task("clean", () => {
    var clean = require("gulp-clean");

    return gulp.src(assets, {read: true}).pipe(clean())
});

// run webpack pack
gulp.task("pack", ["clean"], (done) => {
    webpack(webpackConf, (err, stats) => {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({colors: true}));
        done()
    });
});

gulp.task("default",["pack"]);

// deploy assets to remote server
gulp.task("deploy", () => {
    var sftp = require("gulp-sftp");

    return gulp.src(assets + "/**")
        .pipe(sftp({
            host: "[remote server ip]",
            remotePath: "/www/app/",
            user: "foo",
            pass: "bar"
        }))
});


/**
 * 自动监听src下面的js和html文件夹下面的文件，用户创建了html或者js（这里推荐js，因为可以自动补全html）
 * 删除了一个html和js，都会让webpack重新压缩保证html存在于asserts文件夹下面
 */

gulp.task("dev",["pack"],() => {
    var htmlPath = path.join(__dirname,"./src/html/*.html");
    var jsPath = path.join(__dirname,"./src/js/*.js");
    var scssPath = path.join(__dirname, "./src/scss/*.scss");

    return watch([htmlPath,jsPath],function(obj){
        if(obj["event"] == "change"){
            return;
        }
        var filePath = obj["history"][0];
        var fileExt = filePath.substring(filePath.lastIndexOf("."));
        var filename = filePath.substring(filePath.lastIndexOf("\/") + 1, filePath.lastIndexOf("."));
        var createFileExt = fileExt == ".js" ? ".html" : ".js";
        var createFilePath = fileExt == ".js" ? path.join(__dirname,"./src/html") :
            path.join(__dirname,"./src/js");
        var createFilename = path.join(createFilePath,filename + createFileExt);

        if(obj["event"] == "add"){
            var stats;
            try{
                stats = fs.statSync(createFilename);
            }catch(err){
                console.log("File Not Exist");
            }
            if(typeof(stats) !== "undefined"){
                return;
            }else{
                fs.writeFileSync(createFilename,createFileExt == ".html" ? `<!DOCTYPE html>
                <html lang="en">
                <head>
                <% content "head" %>
                </head>
                <body>
                <% content %>
                </body>
                <% content "script" %>
                </html>` : "");
                // 重新获取webpackConf
                webpackConf = require("./make-webpack.config")();
                return runSequence("pack");
            }
        }
        if(obj["event"] == "unlink"){
            var stats;
            try{
                stats = fs.statSync(createFilename);
            }catch(err){
                console.log("File Not Exist");
            }
            if(typeof(stats) !== "undefined" && stats.isFile()){
                return fs.unlinkSync(createFilename);
            }
        }
    });
});

/**
 * 通过命令行输入文件名，自动创建src下的html和js和scss
 */
gulp.task("add",function(done){
    var htmlPath = path.join(__dirname,"./src/html");
    var jsPath = path.join(__dirname,"./src/js");
    var scssPath = path.join(__dirname, "./src/scss");

    const rl = readline.createInterface({
        input : process.stdin,
        output : process.stdout
    });
    
    rl.question("Please input the page name you want to create: \r\n",(answer) => {
        if(! answer) return;
        var filename = answer.trim();
        var jsFilename = path.join(jsPath,filename + ".js");
        var scssFilename = path.join(scssPath,filename + ".scss");
        var htmlFilename = path.join(htmlPath,filename + ".html");
        var isNotExist = false;

        try{
            var stats = fs.statSync(jsFilename);
        }catch(err){
            console.log("File not exist");
            isNotExist = true;
        }
        if(isNotExist){
            console.log("generator js file");
            fs.writeFileSync(jsFilename);
            isNotExist = false;
        }
        isNotExist = false;

        try{
            var stats = fs.statSync(htmlFilename);
        }catch(err){
            console.log("File not exist");
            isNotExist = true;
        }
        if(isNotExist){
            console.log("generator html file");
            fs.writeFileSync(htmlFilename,`<!DOCTYPE html>
                <html lang="en">
                <head>
                <% content "head" %>
                </head>
                <body>
                <% content %>
                </body>
                <% content "script" %>
                </html>`);
        }
        isNotExist = false;

        try{
            var stats = fs.statSync(scssFilename);
        }catch(err){
            console.log("File not exist");
            isNotExist = true;
        }
        if(isNotExist){
            console.log("generator scss file");
            fs.writeFileSync(scssFilename);
        }
        isNotExist = false;

        rl.close();
        // 重新获取webpackConf
        webpackConf = require("./make-webpack.config")();
        runSequence("pack");
        done();
    });
});

gulp.task("dev-build",["clean"],function(done){
    webpackConf = require("./webpack-dev.config");
    webpack(webpackConf,(err,stats) => {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({colors: true}));
        done();
    })
});
// js check 暂时不用
// gulp.task("hint", () => {
//     var jshint = require("gulp-jshint")
//     var stylish = require("jshint-stylish")
//
//     return gulp.src([
//         "!" + src + "/js/lib/**/*.js",
//         src + "/js/**/*.js"
//     ])
//         .pipe(jshint())
//         .pipe(jshint.reporter(stylish));
// });
