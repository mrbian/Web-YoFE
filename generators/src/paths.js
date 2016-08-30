/**
 * 配置整个工程内所有文件和文件夹的路径
 *
 * @author bian
 * @createDate 2016.8.30
 */

var paths = require("./mock-paths");
module.exports = function(Generator){

    Generator.prototype.getOptions = function(){
        this.props.paths = paths;
    };
};