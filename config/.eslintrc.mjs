export default [
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
        },
        settings: {
            "eslint:recommended": true,
            browser: true,
        },
        rules: {
            "no-unused-vars": [
                "error",
                { vars: "all", args: "none", ignoreRestSiblings: false },
            ],
            "no-control-regex": "off",
        },
    },
];
