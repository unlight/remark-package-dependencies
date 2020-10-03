module.exports = {
    env: {
        commonjs: true,
        es6: true,
        node: true,
        mocha: true,
    },
    plugins: ['only-warn'],
    extends: ['eslint:recommended'],
    parserOptions: {
        ecmaVersion: 2018,
    },
    rules: {},
};
