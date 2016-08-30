/**
 * 从paths.json获得默认的paths，方便测试
 *
 * @author bian
 * @createDate 2016.8.28
 */

var paths = require("../paths.json");

var mockPaths = {
    paths: {},
    type : {}
};

paths.forEach(function(path){
    mockPaths.paths[path.name] = path.default;
    mockPaths.type[path.name] = path.type;
});

module.exports = mockPaths;