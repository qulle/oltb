/** @type {import('jest').Config} */
export default {
    verbose: true,
    transform: {},
    rootDir: '../src',
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '^uuid$': 'uuid',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^jsts/dist/jsts.min$': '<rootDir>../__mocks__/jsts/dist/jsts.min.js'
    }
};
