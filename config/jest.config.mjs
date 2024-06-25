/** @type {import('jest').Config} */
export default {
    verbose: true,
    transform: {},
    rootDir: '../src',
    testEnvironment: 'jsdom',
    coverageDirectory: '<rootDir>../coverage',
    moduleNameMapper: {
        '^uuid$': 'uuid',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^a-color-picker$': '<rootDir>../__mocks__/a-color-picker.js',
        '^jsts/dist/jsts.min$': '<rootDir>../__mocks__/jsts/dist/jsts.min.js'
    }
};
