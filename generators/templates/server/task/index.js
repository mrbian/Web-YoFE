/**
 * 完成请求API的代码，与路由层分离
 *
 * @author <%= author %>
 * @createDate <%= date %>
 */
var request = require("../instances/request");

var Task = function () {
    var self = this;
    self.cookies = [];
};

Task.prototype.login = function *() {

};

module.exports = Task;