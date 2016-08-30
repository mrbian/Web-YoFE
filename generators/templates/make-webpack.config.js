/**
 * 配置webpack.config.js
 *
 * @author <%= author %>
 * @createDate <%= date %>
 */
"use strict";

var path = require("path");
var fs = require("fs");

var webpack = require("webpack");
var _ = require("lodash");
var glob = require("glob");

var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");

var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

var srcDir = path.resolve(process.cwd(), "src");
var assets = path.resolve(process.cwd(), "assets");
var nodeModPath = path.resolve(__dirname, "./node_modules");
var pathMap = require("./src/pathmap.json");

var entries = (() => {
    var jsDir = path.resolve(srcDir, "js");
    var entryFiles = glob.sync(jsDir + "/*.{js,jsx}");
    var map = {};

    entryFiles.forEach((filePath) => {
        var filename = filePath.substring(filePath.lastIndexOf("\/") + 1, filePath.lastIndexOf("."));
        map[filename] = filePath;
    });

    return map;
})();
var chunks = Object.keys(entries);

module.exports = (options) => {
    options = options || {};

    var debug = options.debug !== undefined ? options.debug : true;
    // 这里publicPath要使用绝对路径，不然scss/css最终生成的css图片引用路径是错误的，应该是scss-loader的bug
    var publicPath = "/dist";
    var extractCSS;
    var cssLoader;
    var sassLoader;

    // generate entry html files
    // 自动生成入口文件，入口js名必须和入口文件名相同
    // 例如，a页的入口文件是a.html，那么在js目录下必须有一个a.js作为入口文件
    var plugins = (() => {
        var entryHtml = glob.sync(srcDir + "\/html\/*.html");
        var r = [];

        entryHtml.forEach((filePath) => {
            var filename = filePath.substring(filePath.lastIndexOf("\/") + 1, filePath.lastIndexOf("."));
            var conf = {
                template: "html!" + filePath,
                filename: filename + ".html"
            };

            if(filename in entries) {
                conf.inject = "body";
                conf.chunks = ["vender", filename];
            }

            // if(/b|c/.test(filename)) conf.chunks.splice(2, 0, "common-b-c")

            r.push(new HtmlWebpackPlugin(conf));
        })

        return r;
    })();

    // 没有真正引用也会加载到runtime，如果没安装这些模块会导致报错，有点坑
    /*plugins.push(
        new webpack.ProvidePlugin({
            React: "react",
            ReactDOM: "react-dom",
            _: "lodash", 按需引用
            $: "jquery"
        })
    )*/

    if(debug) {
        extractCSS = new ExtractTextPlugin("css/[name].css?[contenthash]");
        cssLoader = extractCSS.extract(["css"]);
        sassLoader = extractCSS.extract(["css", "sass"]);
        plugins.push(extractCSS, new webpack.HotModuleReplacementPlugin());
    } else {
        extractCSS = new ExtractTextPlugin("css/[contenthash:8].[name].min.css", {
            // 当allChunks指定为false时，css loader必须指定怎么处理
            // additional chunk所依赖的css，即指定`ExtractTextPlugin.extract()`
            // 第一个参数`notExtractLoader`，一般是使用style-loader
            // @see https://github.com/webpack/extract-text-webpack-plugin
            allChunks: false
        });
        cssLoader = extractCSS.extract(["css?minimize"]);
        sassLoader = extractCSS.extract(["css?minimize", "sass"]);

        plugins.push(
            extractCSS,
            new UglifyJsPlugin({
                compress: {
                    warnings: false
                },
                output: {
                    comments: false
                },
                mangle: {
                    except: ["$", "exports", "require"]
                }
            }),
            // new AssetsPlugin({
            //     filename: path.resolve(assets, "source-map.json")
            // }),
            new webpack.optimize.DedupePlugin(),
            new webpack.NoErrorsPlugin()
        );

        plugins.push(new UglifyJsPlugin());
    }

    var entry = Object.assign(entries, {
            // 用到什么公共lib（例如React.js），就把它加进vender去，目的是将公用库单独提取打包
            "vender": ["React"]
        });

    var config = {
        entry: entry,

        output: {
            path: assets,
            filename: debug ? "[name].js" : "js/[chunkhash:8].[name].min.js",
            chunkFilename: debug ? "[chunkhash:8].chunk.js" : "js/[chunkhash:8].chunk.min.js",
            hotUpdateChunkFilename: debug ? "[id].js" : "js/[id].[chunkhash:8].min.js",
            publicPath: publicPath
        },

        resolve: {
            root: [srcDir, nodeModPath],
            alias: pathMap,
            extensions: ["", ".js", ".css", ".scss", ".tpl", ".png", ".jpg"]
        },

        module: {
            loaders: [
                {
                    test: /\.((woff2?|svg)(\?v=[0-9]\.[0-9]\.[0-9]))|(woff2?|svg|jpe?g|png|gif|ico)$/,
                    loaders: [
                        // url-loader更好用，小于10KB的图片会自动转成dataUrl，
                        // 否则则调用file-loader，参数直接传入
                        "url?limit=10000&name=img/[hash:8].[name].[ext]",
                        "image?{bypassOnDebug:true, progressive:true,optimizationLevel:3,pngquant:{quality:'65-80',speed:4}}"
                    ]
                },
                {
                    test: /\.((ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9]))|(ttf|eot)$/,
                    loader: "url?limit=10000&name=fonts/[hash:8].[name].[ext]"
                },
                {test: /\.(tpl|ejs)$/, loader: "ejs"},
                {test: /\.css$/, loader: cssLoader},
                {test: /\.scss$/, loader: sassLoader},
                {test: /\.jsx?$/, loader: "babel?presets[]=react,presets[]=es2015"}
            ]
        },

        plugins: [
            // new CommonsChunkPlugin({
            //     name: "common-b-c",
            //     chunks: ["b", "c"]
            // }),
            // new CommonsChunkPlugin({
            //     name: "common",
            //     chunks: ["common-b-c", "a"]
            // }),
            new CommonsChunkPlugin({
                name: "vender",
                chunks: entry
            })
        ].concat(plugins),

    };
    config.devServer = {
        hot: true,
        noInfo: false,
        inline: true,
        publicPath: publicPath,
        stats: {
            cached: false,
            colors: true
        }
    };

    if (debug) {
        // 为实现webpack-hot-middleware做相关配置
        // @see https://github.com/glenjamin/webpack-hot-middleware
        ((entry) => {
            for (var key of Object.keys(entry)) {
                if (! Array.isArray(entry[key])) {
                    entry[key] = Array.of(entry[key]);
                }
                entry[key].push("webpack-hot-middleware/client?reload=true");
            }
        })(config.entry);

        config.plugins.push( new webpack.HotModuleReplacementPlugin() );
        config.plugins.push( new webpack.NoErrorsPlugin() );
    }

    return config;
}
