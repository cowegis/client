import js from '@eslint/js';
import { createNodeResolver, flatConfigs as importX } from 'eslint-plugin-import-x';
import globals from 'globals';

export default [
    {
        files: ['js/**/*.js'],
    },
    js.configs.recommended,
    importX.recommended,
    {
        files: ['js/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                // Used for webpack asset modules in js/leaflet/index.js
                require: 'readonly',
            },
        },
        rules: {
            'quotes': [2, 'single', {avoidEscape: true}],
            'no-unused-vars': ['error', {args: 'none'}],
            'import-x/named': 'error',
            'import-x/no-unresolved': 'error',
            'import-x/order': ['error', {
                groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
                'newlines-between': 'always',
                alphabetize: {
                    order: 'asc'
                }
            }],
        },
        settings: {
            'import-x/extensions': ['.js'],
            'import-x/resolver-next': [createNodeResolver()],
            'import-x/ignore': ['\\.png$', '\\.jpg$'],
        },
    },
];
