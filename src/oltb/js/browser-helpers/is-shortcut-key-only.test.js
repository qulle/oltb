import { describe, it, expect } from '@jest/globals';
import { KeyboardKeys } from '../browser-constants/keyboard-keys';
import { isShortcutKeyOnly } from './is-shortcut-key-only';

describe('isShortcutKeyOnly', () => {
    let originalActiveElement;
    let container;

    beforeAll(() => {
        originalActiveElement = window.document.activeElement;
    });

    beforeEach(() => {
        container = window.document.createElement('div');
        window.document.body.appendChild(container);
    });

    afterEach(() => {
        window.document.body.removeChild(container);
        container = null;
    });

    afterAll(() => {
        if(originalActiveElement && originalActiveElement.focus) {
            originalActiveElement.focus();
        }
    });

    function setActiveElement(nodeName) {
        const element = document.createElement(nodeName);
        container.appendChild(element);
        element.focus();
    }

    it('should return true when the key matches and no modifier keys are pressed', () => {
        setActiveElement('DIV');
        const event = new KeyboardEvent('keydown', { key: 'A' });
        expect(isShortcutKeyOnly(event, 'A')).toBe(true);
    });

    it('should return false when an INPUT element is active', () => {
        setActiveElement('INPUT');
        const event = new KeyboardEvent('keydown', { key: 'A' });
        expect(isShortcutKeyOnly(event, 'A')).toBe(false);
    });

    it('should return false when a TEXTAREA element is active', () => {
        setActiveElement('TEXTAREA');
        const event = new KeyboardEvent('keydown', { key: 'A' });
        expect(isShortcutKeyOnly(event, 'A')).toBe(false);
    });

    it('should return false when Ctrl key is pressed', () => {
        setActiveElement('DIV');
        const event = new KeyboardEvent('keydown', { key: 'A', ctrlKey: true });
        expect(isShortcutKeyOnly(event, 'A')).toBe(false);
    });

    it('should return false when Shift key is pressed', () => {
        setActiveElement('DIV');
        const event = new KeyboardEvent('keydown', { key: 'A', shiftKey: true });
        expect(isShortcutKeyOnly(event, 'A')).toBe(false);
    });

    it('should return false when Alt key is pressed', () => {
        setActiveElement('DIV');
        const event = new KeyboardEvent('keydown', { key: 'A', altKey: true });
        expect(isShortcutKeyOnly(event, 'A')).toBe(false);
    });

    it('should return false when Meta key is pressed', () => {
        setActiveElement('DIV');
        const event = new KeyboardEvent('keydown', { key: 'A', metaKey: true });
        expect(isShortcutKeyOnly(event, 'A')).toBe(false);
    });

    it('should return false when the key does not match', () => {
        setActiveElement('DIV');
        const event = new KeyboardEvent('keydown', { key: 'B' });
        expect(isShortcutKeyOnly(event, 'A')).toBe(false);
    });

    it('should return false when the key matches the operating system key', () => {
        setActiveElement('DIV');
        const event = new KeyboardEvent('keydown', { key: KeyboardKeys.valueOperatingSystem });
        expect(isShortcutKeyOnly(event, KeyboardKeys.valueOperatingSystem)).toBe(false);
    });
});