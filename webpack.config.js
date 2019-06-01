const path = require('path')

module.exports = {
    entry: [
        './src/index.jsx'
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            }
        ]
    },
    output: {
        path: path.join(__dirname, '/static'),
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.js', ".jsx"]
    },
};
