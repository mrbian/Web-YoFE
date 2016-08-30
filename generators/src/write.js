/**
 * copy文件和文件夹逻辑
 *
 * @author bian
 * @createDate 2016.8.30
 */
var path = require("path");
var mockPaths = require("./mock-paths");
var chalk = require("chalk");

module.exports = function (Generator) {

    Generator.prototype.createProject = function () {
        var join = path.join;
        this.sourceRoot(join(__dirname,"../templates"));

        var copy = function(dest){
            this.log(`copy ${dest}`);
            this.bulkCopy(this.templatePath(dest),join(process.cwd(),dest));
        }.bind(this);

        var template = function (src,dest,data) {           // 使用ejs模板创建文件和文件夹
            this.log(`template copy ${dest} from ${src}`);
            this.template(this.templatePath(src),join(process.cwd(),dest),data);
        }.bind(this);

        var answers = this.props.answers;
        var version = answers.version;
        var author = answers.name;
        var project = answers.project;
        var frame = answers.frame;
        var css = answers.css;
        var date = new Date();
        date = `${date.getFullYear()}.${date.getUTCMonth()}.${date.getUTCDay()}`;

        var paths = mockPaths.paths;
        try{
            copy("gulpfile.js");
            Object.keys(paths).forEach((name) => {
                template(name,paths[name],{
                    author : author,
                    version : version,
                    project : project,
                    date : date,
                    frame : frame,
                    css : css
                });
            });
        }catch(err){
            this.log(err);
        }

        this.log("file template copy is over");
    };
};