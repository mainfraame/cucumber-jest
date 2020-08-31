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
        ]
    ],
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    node: 'current'
                }
            }
        ],
        '@babel/preset-typescript'
    ]
};
