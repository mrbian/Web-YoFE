/**
 * 主路由文件
 *
 * @author  <%= author %>
 * @createDate <%= date %>
 */

// library module
const Router = require("koa-router");
const proxy = require("koa-proxy");

// local module
const fs = require("fs");
const path = require("path");
const util = require("util");

// my module
var render = require("./../instances/render.js");
var context = require("../instances/context");

var config = require("../proxy.json");
var env = process.argv[2] || process.env.NODE_ENV;
var debug = "production" !== env;

var router = new Router();

/**
 * save context
 */
router.use(function *(next) {
    context.set(this);
    yield next;
});

/**
 * uncomment this to proxy static file
 */
// router.use(proxy({
//     host:  config.host,
//     match: /^\/public\//
// }));


var loadDir = (dir) => {
    fs
        .readdirSync(dir)
        .forEach( (file) => {
            var nextPath = path.join(dir, file);
            var stat = fs.statSync(nextPath);
            if (stat.isDirectory()) {
                loadDir(nextPath);
            } else if (stat.isFile() && file.indexOf(".") !== 0 && file !== "index.js") {
                require(nextPath)(router);
            }
        });
};

loadDir(__dirname);

module.exports = () => router.routes();