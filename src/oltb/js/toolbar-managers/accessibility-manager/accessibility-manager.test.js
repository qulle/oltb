import { jest, describe, it, expect } from '@jest/globals';
import { AccessibilityManager } from './accessibility-manager';

const FILENAME = 'accessibility-manager.js';

describe('AccessibilityManager', () => {
    it('should init the manager', () => {
        AccessibilityManager.initAsync({}).then((result) => {
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
});