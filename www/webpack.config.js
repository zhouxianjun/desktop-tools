/**
 * Created by alone on 17-5-11.
 */
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const glob = require('glob');
let webpackConfig = {
    entry: {
    },
    output: {
        path: path.resolve(__dirname, '../html'),
        filename: '[name].js'
    },
    target: 'electron-renderer',
    module: {
        rules: [{
            test: /iview.src.*?js$/,
            loader: 'babel-loader'
        }, {
            test: /\.vue$/,
            loader: 'vue-loader',
            options: {
                loaders: {
                    less: ExtractTextPlugin.extract({
                        use: ['css-loader?minimize', 'autoprefixer-loader', 'less-loader'],
                        fallback: 'vue-style-loader'
                    }),
                    css: ExtractTextPlugin.extract({
                        use: ['css-loader', 'autoprefixer-loader', 'less-loader'],
                        fallback: 'vue-style-loader'
                    })
                }
            }
        }, {
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
                use: ['css-loader?minimize', 'autoprefixer-loader'],
                fallback: 'style-loader'
            })
        }, {
            test: /\.less/,
            use: ExtractTextPlugin.extract({
                use: ['autoprefixer-loader', 'less-loader'],
                fallback: 'style-loader'
            })
        }, {
            test: /\.(woff|eot|ttf)\??.*$/,
            loader: 'url-loader?limit=1024&name=fonts/[name]-[sha512:hash:base64:7].[ext]'
        }, {
            test: /\.(gif|jpg|png|svg)\??.*$/,
            loader: 'url-loader?limit=1024&name=img/[name]-[sha512:hash:base64:7].[ext]'
        }, {
            test: /\.(swf)$/,
            loader: 'file-loader?name=swf/[name]-[sha512:hash:base64:7].[ext]'
        }, {
            test: /\.(mp3)$/,
            loader: 'file-loader?name=audio/[name]-[sha512:hash:base64:7].[ext]'
        }, {
            test: /\.(html|tpl)$/,
            loader: 'html-loader'
        }]
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    },
    plugins: [
        new ExtractTextPlugin({
            filename: '[name].css',
            allChunks: true
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.MinChunkSizePlugin({minChunkSize: 10000}),
        new webpack.ProvidePlugin({$: "jquery", jQuery: 'jquery'}),
        new webpack.DefinePlugin({
            config: JSON.stringify(require(`../env/${process.env['NODE_ENV'] || 'dev'}`))
        })
    ]
};
// 获取指定路径下的入口文件
function getEntries(globPath) {
    let files = glob.sync(globPath),
        entries = {};

    files.forEach(function(filepath) {
        // 取倒数第二层(view下面的文件夹)做包名
        let split = filepath.split('/');
        let name = split[split.length - 2];

        entries[name] = './' + filepath;
    });

    return entries;
}

let entries = getEntries('view/**/index.js');

Object.keys(entries).forEach(function(name) {
    // 每个页面生成一个entry，如果需要HotUpdate，在这里修改entry
    webpackConfig.entry[name] = entries[name];

    // 每个页面生成一个html
    let plugin = new HtmlWebpackPlugin({
        // 生成出来的html文件名
        filename: `${name}.html`,
        // 每个html的模版，这里多个页面使用同一个模版
        template: './template.ejs',
        // 自动将引用插入html
        inject: true,
        // 每个html引用的js模块，也可以在这里加上vendor等公用模块
        chunks: [name],
        hash: true
    });
    webpackConfig.plugins.push(plugin);
});

module.exports = webpackConfig;