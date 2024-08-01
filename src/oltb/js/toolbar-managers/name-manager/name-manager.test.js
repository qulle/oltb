import { jest, describe, it, expect } from '@jest/globals';
import { NameManager } from './name-manager';
import '../../browser-prototypes/string';

const FILENAME = 'name-manager.js';

describe('NameManager', () => {
    it('should init the manager', async () => {
        return NameManager.initAsync({}).then((result) => {
            expect(result).toStrictEqual({
                filename: FILENAME,
                result: true
            });
        });
    });

    it('should have two overridden methods [setMap, getName]', () => {
        const spyOnSetMap = jest.spyOn(NameManager, 'setMap');
        const map = {};

        NameManager.setMap(map);
        expect(spyOnSetMap).toHaveBeenCalled();
        expect(NameManager.getName()).toBe(FILENAME);
    });

    it('should create a concatenated name', () => {
        const name = NameManager.generate();
        expect(name.length).toBeGreaterThan(0);
        expect(name.startsWithCapital()).toBe(true);
        expect(name).toContain(' ');
    });
});