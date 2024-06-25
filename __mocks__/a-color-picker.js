import { jest } from '@jest/globals';

export const createPicker = jest.fn().mockImplementation(() => {
    return {
        setColor: jest.fn(),
        on: jest.fn(),
        off: jest.fn()
    };
});
