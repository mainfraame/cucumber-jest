module.exports = {
    ignore: [
        /node_modules/
    ],
    plugins: [
        [
            '@babel/plugin-transform-typescript',
            {
                isTSX: true
            }
        ],
        'babel-plugin-add-module-exports'
    ],
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    node: 'current'
                },
                modules: 'cjs'
            }
        ],
        '@babel/preset-typescript'
    ]
};
