import { jest } from '@jest/globals';

const tippy = jest.fn().mockImplementation((element, options) => {
    return {
        name: 'jest-tippy'
    };
});

const createSingleton = jest.fn().mockImplementation((element, options) => {
    return {
        name: 'jest-singleton-tippy'
    };
});

const delegate = jest.fn().mockImplementation((element, options) => {
    return {
        name: 'jest-delegate-tippy'
    };
});

export default tippy;
export { createSingleton, delegate};