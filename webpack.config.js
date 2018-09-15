const webpack = require('webpack');
const path = require('path');
const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';
const CleanWebpackPlugin = require('clean-webpack-plugin');

const plugins = [
  new CleanWebpackPlugin(['dist']),
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(nodeEnv)
    }
  }),
];

var config = {
  devtool: isProd ? 'hidden-source-map' : 'source-map',
  devtool: 'inline-source-map',
  context: path.resolve('./src'),
  entry: {
    'app': './index.ts'
  },
  output: {
    path: path.resolve('./dist'),
    filename: 'ezgeoquery-typeahead.js',
    library: 'EzGeoTypeahead',
    libraryTarget: "umd",
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.ts?$/,
        exclude: ['node_modules'],
        use: ['awesome-typescript-loader', 'source-map-loader']
      },
      { test: /\.css$/, loaders: ['style-loader', 'css-loader'] }
    ].filter(Boolean)
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: plugins,
  devServer: {
    contentBase: path.join(__dirname, 'dist/'),
    compress: true,
    port: 3000,
  }
};

module.exports = config;
