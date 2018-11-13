const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports ={
    entry: './src/js/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist/js')
    },
    module: {
        rules: [
          {
            test: /\.css$/,
            use: [ 'style-loader', 'css-loader' ]
          },
          {
            test: /\.(png|jpg|gif)$/,
            use: [
              {
                loader: 'url-loader',
                options: {
                  limit: 8192      
                }
              }
            ]
          }
        ]
    },
    // 热加载
    devServer: {
      
    },
    plugins: [
        new HtmlWebpackPlugin({template: './index.html'}),
        new CleanWebpackPlugin(['dist']),
    ]
};