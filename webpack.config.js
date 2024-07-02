const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    background: './background.js',
    content: './content.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build')
  },
  devtool: 'source-map'
};