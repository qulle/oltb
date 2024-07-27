import { jest, describe, it, expect } from '@jest/globals';
import { simulateKeyPress } from '../../../../../__mocks__/simulate-key-press';
import { simulateMouseClick } from '../../../../../__mocks__/simulate-mouse-click';
import { AccessibilityManager } from './accessibility-manager';

const FILENAME = 'accessibility-manager.js';

describe('AccessibilityManager', () => {
    it('should init the manager', async () => {
        return AccessibilityManager.initAsync({}).then((result) => {
            expect(result).toStrictEqual({
                filename: FILENAME,
                result: true
            });
        });
    });

    it('should have two overridden methods [setMap, getName]', () => {
        const spyOnSetMap = jest.spyOn(AccessibilityManager, 'setMap');
        const map = {};

        AccessibilityManager.setMap(map);
        expect(spyOnSetMap).toHaveBeenCalled();
        expect(AccessibilityManager.getName()).toBe(FILENAME);
    });

    it('should add class [oltb-using-keyboard] to window.document.body', () => {
        AccessibilityManager.addAccessibilityClass();
        expect(window.document.body.classList.contains('oltb-using-keyboard')).toBe(true);
    });

    it('should add class [oltb-using-keyboard] to window.document.body', () => {
        AccessibilityManager.removeAccessibilityClass();
        expect(window.document.body.classList.contains('oltb-using-keyboard')).toBe(false);
    });

    it('should add class using keyboard-event', () => {
        expect(window.document.body.classList.contains('oltb-using-keyboard')).toBe(false);
        simulateKeyPress('keydown', window, 'Tab');
        expect(window.document.body.classList.contains('oltb-using-keyboard')).toBe(true);
    });

    it('should add remove class using mouse-event', () => {
        expect(window.document.body.classList.contains('oltb-using-keyboard')).toBe(true);
        simulateMouseClick('mousedown', window, {clientX: 100, clientY: 200, button: 1});
        expect(window.document.body.classList.contains('oltb-using-keyboard')).toBe(false);
    });

    it('should not add class using wrong-keyboard-event', () => {
        expect(window.document.body.classList.contains('oltb-using-keyboard')).toBe(false);
        simulateKeyPress('keydown', window, 'A');
        expect(window.document.body.classList.contains('oltb-using-keyboard')).toBe(false);
    });
});