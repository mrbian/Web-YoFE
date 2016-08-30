/**
 * 路由demo文件
 *
 * @author <%= author %>
 * @createDate <%= date %>
 */
var render = require("../instances/render");

module.exports = (router) => {
   router.get("/home",function *(){
       var ctx = this;
       ctx.body = yield render("example.html");
   });
};