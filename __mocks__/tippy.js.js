import { jest } from '@jest/globals';

const tippy = jest.fn(element, options).mockImplementation(() => {
    return {};
});

export default tippy;