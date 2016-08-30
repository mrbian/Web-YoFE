/**
 * 主应用文件
 *
 * @author <%= author %>
 * @createDate <%= date %>
 */
"use strict";

// load native modules
var http = require("http");
var path = require("path");
var util = require("util");

// load 3rd modules
var koa = require("koa");
var router = require("koa-router")();
var serve = require("koa-static");
var colors = require("colors");
var open = require("open");

// load local modules
var pkg = require("../package.json");
var env = process.argv[2] || process.env.NODE_ENV;
var debug = "production" !== env;
var viewDir = debug ? "src" : "assets";
var staticDir = path.resolve(__dirname, "../" + "assets");

// load routes
var routes = require("./routes/index.js");

// init framework
var app = koa();

colors.setTheme({
    silly: "rainbow",
    input: "grey",
    verbose: "cyan",
    prompt: "grey",
    info: "green",
    data: "grey",
    help: "cyan",
    warn: "yellow",
    debug: "blue",
    error: "red"
});

// basic settings
app.keys = [pkg.name, pkg.description];
app.proxy = true;

// global events listen
app.on("error", (err, ctx) => {
    err.url = err.url || ctx.request.url;
    console.error(err, ctx);
});

// handle favicon.ico
app.use(function*(next) {
    if (this.url.match(/favicon\.ico$/)) this.body = "";
    yield next;
});

// logger
app.use(function*(next) {
    console.log(this.method.info, this.url)
    yield next
});

// use routes
app.use(routes());

if(debug) {
    var webpackDevMiddleware = require("koa-webpack-dev-middleware");
    var webpack = require("webpack");
    var webpackConf = require("../webpack-dev.config");
    var compiler = webpack(webpackConf);

    // 为使用Koa做服务器配置koa-webpack-dev-middleware
    app.use(webpackDevMiddleware(compiler, webpackConf.devServer));

    // 为实现HMR配置webpack-hot-middleware
    var hotMiddleware = require("webpack-hot-middleware")(compiler);
    // Koa对webpack-hot-middleware做适配
    app.use(function* (next) {
        yield hotMiddleware.bind(null, this.req, this.res);
        yield next;
    });
}

// handle static files
app.use(serve(staticDir, {
    maxage: 0
}));

app = http.createServer(app.callback());

app.listen(pkg.localServer.port, "127.0.0.1", () => {
    var url = util.format("http://%s:%d", "localhost", pkg.localServer.port);

    console.log("Listening at %s", url);

    // open(url);
});

module.exports = app;