import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from 'rollup-plugin-replace';
import scss from 'rollup-plugin-scss'
import css from "rollup-plugin-import-css";
import json from '@rollup/plugin-json';

export default {
    input: './src/js/oltb.js',
    output: {
        file: './dist/bundle.js',
        format: 'iife',
        name: 'oltb'
    },
    plugins: [
        resolve(),
        commonjs(),
        replace({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        scss(),
        css(),
        json()
    ]
};