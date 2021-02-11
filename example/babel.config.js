module.exports = function (api) {
    api.cache(false);

    return {
        ignore: [/node_modules/],
        plugins: [
            'lodash',
            [
                '@babel/plugin-proposal-class-properties',
                {
                    loose: true
                }
            ],
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
                        node: '10'
                    }
                }
            ],
            '@babel/preset-react',
            '@babel/preset-typescript'
        ]
    };
};
