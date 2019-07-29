'use strict';
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
  entry: `${__dirname}/src/index.ts`,
  mode: 'development',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use:['ts-loader']
    },{
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    },{
      test: /\.(woff|woff2|eot|ttf|svg)$/,
      use: ['url-loader?limit=100000']
    },{
      test: /\.(png|jpe?g|gif|jp2|webp)$/,
      loader: 'file-loader',
      options: {
        name: 'images/[name].[ext]'
      }
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      // title: 'MBMBaM Quote Search'
      favicon: 'src/images/heyJefferyAlt.png',
      template: 'src/index.html',
      inject: true
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    })
  ],

}
