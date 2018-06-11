'use strict';

const merge = require('webpack-merge');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const path = require('path');
const ngAnnotatePlugin = require('ng-annotate-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: "source-map",

  entry: {
    dark: './public/sass/grafana.dark.scss',
    light: './public/sass/grafana.light.scss',
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        enforce: 'pre',
        exclude: /node_modules/,
        use: {
          loader: 'tslint-loader',
          options: {
            emitErrors: true,
            typeCheck: false,
          }
        }
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      require('./sass.rule.js')({
        sourceMap: false, minimize: false, preserveUrl: false
      })
    ]
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          minSize: 30000,
          test: /[\\/]node_modules[\\/].*[tj]s$/,
          name: "vendor",
          chunks: "all"
        }
      }
    },
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: "grafana.[name].css"
    }),
    new ngAnnotatePlugin(),
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, '../../public/views/index.html'),
      template: path.resolve(__dirname, '../../public/views/index.template.html'),
      inject: 'body',
      chunks: ['vendor', 'app'],
    }),
    new MonacoWebpackPlugin({
      languages: ['coffee'],
      features: [
        'bracketMatching',
        'caretOperations',
        'clipboard',
        'comment',
        'coreCommands', 'cursorUndo', 'dnd', 'find', 'folding', 'format', 'hover', 'inPlaceReplace', 'inspectTokens', 'linesOperations', 'links', 'multicursor', 'parameterHints', 'quickCommand', 'quickFixCommands', 'quickOutline', 'referenceSearch', 'rename', 'smartSelect', 'snippets', 'suggest', 'toggleHighContrast', 'toggleTabFocusMode', 'transpose', 'wordHighlighter', 'wordOperations'
      ]
    }),
    function () {
      this.plugin("done", function (stats) {
        if (stats.compilation.errors && stats.compilation.errors.length) {
          console.log(stats.compilation.errors);
          process.exit(1);
        }
      });
    }
  ]
});
