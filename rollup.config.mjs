import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from 'rollup-plugin-replace';
import scss from 'rollup-plugin-scss'
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';

export default {
    input: './src/js/oltb.js',
    output: {
        file: './dist/oltb.min.js',
        format: 'iife',
        name: 'oltb',
        sourcemap: true
    },
    plugins: [
        resolve(),
        commonjs(),
        replace({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        scss({
            output: './dist/oltb.min.css',
            outputStyle: 'compressed',
            sourceMap: true
        }),
        json(),
        terser()
    ]
};