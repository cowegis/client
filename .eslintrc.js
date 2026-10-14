module.exports = {
    root: true,
    parser: '@babel/eslint-parser',
    parserOptions: {
        sourceType: 'module',
        allowImportExportEverywhere: true,
        requireConfigFile: false,
    },
    env: {
        browser: true,
        es2022: true,
    },
    globals: {
        // Used for webpack asset modules in js/leaflet/index.js
        require: 'readonly',
    },
    extends: [
        'eslint:recommended',
        'plugin:import/recommended'
    ],
    rules: {
        "quotes": [2, "single", "avoid-escape"],
        "no-unused-vars": ["error", {args: "none"}],
        "import/named": "error",
        "import/no-unresolved": "error",
        "import/order": ["error", {
            groups: ["builtin", "external", "internal", "parent", "sibling", "index", "object", "type"],
            "newlines-between": "always",
            alphabetize: {
                order: "asc"
            }
        }],
    },
    settings: {
        "import/extensions": [
            ".js",
        ],
        'import/resolver': {
            typescript: {},
            webpack: {}
        },
        "import/ignore": ["/*.png/", "/*.jpg/"]
    }
}
