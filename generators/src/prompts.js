/**
 * 与用户交互配置工程名，依赖的框架等
 *
 * @author bian
 * @createDate 2016.8.30
 */
var answers = require("./mock-prompts");
var questions = require("../prompts.json");
module.exports = function(Generator){
    
    Generator.prototype.getAnswers = function(){
        this.props.answers = answers;
        var done = this.async();
        this.prompt(questions,function(data){

            this.props.answers = data;

            done();
        }.bind(this));
    };
};