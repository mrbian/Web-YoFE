/**
 * 从prompts.json获取默认的用户回答
 *
 * @author bian
 * @createDate 2016.8.30
 */

var prompts = require("../prompts.json");

var answers = {
    name : [],
    answer : {}
};

prompts.forEach(function(question){
    answers.name.push(question.name);
    answers.answer[question.name] = null;
});

module.exports = answers;
