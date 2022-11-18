import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import scss from 'rollup-plugin-scss';
import license from 'rollup-plugin-license';

const jsBanner  = await import('./rollup.jsbanner.mjs');
const cssBanner = await import('./rollup.cssbanner.mjs');

export default {
    input: './src/oltb/js/oltb.js',
    output: {
        file: './dist/oltb.min.js',
        format: 'iife',
        name: 'oltb'
    },
    plugins: [
        resolve(),
        commonjs(),
        replace({
            preventAssignment: true,
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        scss({
            output: './dist/oltb.min.css',
            outputStyle: 'compressed',
            processor: (css) => {
                return cssBanner.banner + '\n' + css;
            }
        }),
        json(),
        terser({
            format: {
                comments: false
            }
        }),
        license({
            banner: jsBanner.banner
        })
    ]
};