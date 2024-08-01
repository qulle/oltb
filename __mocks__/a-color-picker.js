import { jest } from '@jest/globals';

export const createPicker = jest.fn().mockImplementation((element) => {
    for(let i = 0; i < 64; i++) {
        const color = window.document.createElement('div');

        color.classList.add('a-color-picker-palette-color');
        element.appendChild(color);
    }

    for(let i = 0; i < 4; i++) {
        const row = window.document.createElement('div');

        row.classList.add('a-color-picker-row');
        element.appendChild(row);
    }

    return {
        setColor: jest.fn(),
        on: jest.fn(),
        off: jest.fn()
    };
});
