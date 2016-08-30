/**
 * 和后台数据交互的路由
 *
 * @author <%= author %>
 * @createDate <%= date %>
 */
const proxy = require("koa-proxy");
const config = require("../proxy.json");

module.exports = (router) => {
    router.get("/api/example",proxy({
        host: config.host
    }));
};