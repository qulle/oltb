import { jest } from '@jest/globals';

const screenfull = jest.fn(element, options).mockImplementation(() => {
    return {
        exit: jest.fn(),
        request: jest.fn(),
        on: jest.fn(),
        off: jest.fn()
    };
});

export default screenfull;