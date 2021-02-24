module.exports = {
    ignore: [/node_modules/],
    plugins: [
        [
            '@babel/plugin-transform-typescript',
            {
                isTSX: true
            }
        ],
        'babel-plugin-add-module-exports',
        'babel-plugin-macros'
    ],
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    node: '10'
                },
                modules: 'cjs'
            }
        ],
        '@babel/preset-typescript'
    ]
};
