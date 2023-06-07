module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
    "overrides": [],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
        "no-unused-vars": [
            "error", {
                "vars": "all", 
                "args": "none", 
                "ignoreRestSiblings": false 
            }
        ],
        "no-control-regex": 0
    }
}
