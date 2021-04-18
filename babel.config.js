module.exports = (api) => {
    api.cache(() => process.env.NODE_ENV);

    return {
        ignore: [/node_modules/],
        plugins: [
            [
                '@babel/plugin-proposal-class-properties',
                {
                    loose: true
                }
            ],
            [
                '@babel/plugin-transform-runtime',
                {
                    corejs: 3
                }
            ],
            [
                '@babel/plugin-transform-typescript',
                {
                    isTSX: true
                }
            ],
            '@babel/plugin-transform-spread',
            'babel-plugin-add-module-exports',
            'babel-plugin-macros'
        ],
        presets: [
            ['@babel/preset-env', {targets: {node: 8}}],
            '@babel/preset-react',
            '@babel/preset-typescript'
        ]
    };
};
