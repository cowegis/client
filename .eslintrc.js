module.exports = {
    parser: '@babel/eslint-parser',
    parserOptions: {
        sourceType: 'module',
        allowImportExportEverywhere: true,
        requireConfigFile: false,
    },
    extends: [
        'plugin:import/recommended'
    ],
    rules: {
        "quotes": [2, "single", "avoid-escape"],
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
