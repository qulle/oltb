/** @type {import('jest').Config} */
export default {
    verbose: true,
    transform: {},
    rootDir: '../src',
    testEnvironment: 'jsdom',
    collectCoverage: true,
    coverageDirectory: '<rootDir>../coverage',
    coverageReporters: ['json', 'lcov', 'text', 'clover'],
    moduleNameMapper: {
        '^uuid$': 'uuid',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^a-color-picker$': '<rootDir>../__mocks__/a-color-picker.js',
        '^tippy.js$': '<rootDir>../__mocks__/tippy.js.js',
        '^screenfull$': '<rootDir>../__mocks__/screenfull.js',
        '^jsts/dist/jsts.min$': '<rootDir>../__mocks__/jsts/dist/jsts.min.js'
    }
};
