const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
  // production, development, none
  mode: 'development',
  entry: './client.js',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, '../')
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            scss: 'vue-style-loader!css-loader'
          }
        }
      },
      {
        test: /\.css/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.vue'],
    modules: [
      'node_modules'
    ],
    alias: {
      vue: 'vue/dist/vue.common.js'
    }
  },
  plugins: [new VueLoaderPlugin()]
};
