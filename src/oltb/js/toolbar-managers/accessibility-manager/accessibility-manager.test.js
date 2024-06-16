import { jest, describe, it, expect } from '@jest/globals';
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
        const spy = jest.spyOn(AccessibilityManager, 'setMap');
        const map = {};

        AccessibilityManager.setMap(map);
        expect(spy).toHaveBeenCalled();
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
});