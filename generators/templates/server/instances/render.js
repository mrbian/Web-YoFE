/**
 * 渲染实例
 *
 * @author <%= author %>
 * @createDate <%= date %>
 */
var coViews = require("co-views");
var path = require("path");

var root = path.join(__dirname,"../../");
var viewPath = path.join(root,"./server/views");
var render = coViews(viewPath, {
    map: {
        html: "ect"
    },
    locals: {
        root: viewPath,
        ext: ".html"
    }
});

module.exports = render;