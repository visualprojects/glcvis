const path = require('path');


module.exports = {
    entry: path.resolve(__dirname, 'src/index.js'),
    output: {
        filename: 'glcvis.min.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'glc',
        libraryTarget: 'umd'
    },
    module: {
        rules: [{
            test:/\.(js)$/,
            use: 'babel-loader',
            exclude: /node_modules/
        }]
    },
    mode: 'production'
}