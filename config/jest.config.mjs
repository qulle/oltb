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

// Note:
// <rootDir> points to the path of the jest.config.mjs
// Thats why ../ is needed to find the __mocks__ directory