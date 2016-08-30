/**
 * 部署用webpack.config.js
 *
 * @author <%= author %>
 * @createDate <%= date %>
 */
"use strict";

var genConf = require("./make-webpack.config");
module.exports = genConf({debug: false});
