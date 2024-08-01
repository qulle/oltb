import { describe, it, expect } from '@jest/globals';
import { trapFocus } from './trap-focus';
import { KeyboardKeys } from '../browser-constants/keyboard-keys';

describe('trapFocus', () => {
    let modal;
    let firstButton;
    let lastButton;

    beforeEach(() => {
        window.document.body.innerHTML = `
            <div id="modal">
                <button id="first">First Button</button>
                <button id="middle">Middle Button</button>
                <button id="last">Last Button</button>
            </div>
        `;

        modal = window.document.getElementById('modal');
        firstButton = window.document.getElementById('first');
        lastButton = window.document.getElementById('last');

        modal.addEventListener('keydown', (event) => trapFocus.call(modal, event));
    });

    it('should focus last element when Shift+Tab is pressed on first element', () => {
        firstButton.focus();

        const event = new KeyboardEvent('keydown', {
            key: KeyboardKeys.valueTab,
            shiftKey: true,
            bubbles: true
        });
        firstButton.dispatchEvent(event);

        expect(window.document.activeElement).toBe(lastButton);
    });

    it('should focus first element when Tab is pressed on last element', () => {
        lastButton.focus();

        const event = new KeyboardEvent('keydown', {
            key: KeyboardKeys.valueTab,
            shiftKey: false,
            bubbles: true
        });
        lastButton.dispatchEvent(event);

        expect(window.document.activeElement).toBe(firstButton);
    });

    it('should not change focus when non-Tab key is pressed', () => {
        const invalidKey = 'A';
        const middleButton = window.document.getElementById('middle');
        middleButton.focus();

        const event = new KeyboardEvent('keydown', {
            key: invalidKey,
            bubbles: true
        });
        middleButton.dispatchEvent(event);

        expect(window.document.activeElement).toBe(middleButton);
    });
});