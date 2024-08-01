import { jest } from '@jest/globals';

const screenfull = {
    request: jest.fn(),
    exit: jest.fn(),
    toggle: jest.fn(),
    onchange: jest.fn(),
    onerror: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    raw: {},
    isFullscreen: false,
    element: window.document.createElement('div'),
    isEnabled: true
};

export default screenfull;