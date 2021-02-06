module.exports = {
    env: {
        commonjs: true,
        es2021: true,
        node: true
    },
    extends: 'eslint:recommended',
    parserOptions: {
        ecmaVersion: 12
    },
    globals: {
        Discord: 'writable'
    },
    rules: {
        'no-empty': 'off',
        'no-unused-vars': 'warn',
        'eol-last': ['warn', 'never'],
        'lines-between-class-members': 'warn',
        quotes: ['warn', 'single'],
        semi: ['warn', 'always', { omitLastInOneLineBlock: true }],
    }
};