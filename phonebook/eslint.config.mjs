import stylisticJs from '@stylistic/eslint-plugin-js'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
})

export default [{
    ignores: ['**/dist', '**/eslint.config.{js,cjs, mjs}'],
}, ...compat.extends('eslint:recommended'), {
    plugins: {
        '@stylistic/js': stylisticJs,
    },

    languageOptions: {
        globals: {
            ...globals.commonjs,
            ...globals.node,
        },

        ecmaVersion: 'latest',
        sourceType: 'module',
    },

    rules: {
        '@stylistic/js/indent': ['error', 4],
        '@stylistic/js/linebreak-style': ['error', 'unix'],
        '@stylistic/js/quotes': ['error', 'single'],
        '@stylistic/js/semi': ['error', 'never'],
        eqeqeq: 'error',
        'no-trailing-spaces': 'error',
        'object-curly-spacing': ['error', 'always'],

        'arrow-spacing': ['error', {
            before: true,
            after: true,
        }],

        'no-console': 0,
    },
}, {
    files: ['**/eslint.config.{js,cjs, mjs}'],

    languageOptions: {
        globals: {
            ...globals.node,
        },

        ecmaVersion: 5,
        sourceType: 'commonjs',
    },
}]