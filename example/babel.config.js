module.exports = function (api) {

    api.cache(false);

    return {
        ignore: [
            /node_modules/
        ],
        plugins: [
            'lodash',
            [
                '@babel/plugin-transform-typescript',
                {
                    isTSX: true
                }
            ],
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
            '@babel/preset-react',
            '@babel/preset-typescript'
        ]
    };
};
