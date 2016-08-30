/**
 * 存储上下文
 *
 * @author <%= author %>
 * @createDate <%= date %>
 */
var ctx;
module.exports = {
    get : () => {
        return ctx;
    },
    set : (context) => {
        ctx = context;
    }
};