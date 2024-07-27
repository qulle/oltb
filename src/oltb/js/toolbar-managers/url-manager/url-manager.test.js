import { jest, describe, it, expect } from '@jest/globals';
import { UrlManager } from './url-manager';

const FILENAME = 'url-manager.js';

describe('UrlManager', () => {
    it('should init the manager', async () => {
        return UrlManager.initAsync({}).then((data) => {
            expect(data).toStrictEqual({
                filename: FILENAME,
                result: true
            });
        });
    });

    it('should have two overridden methods [setMap, getName]', () => {
        const spyOnSetMap = jest.spyOn(UrlManager, 'setMap');
        const map = {};

        UrlManager.setMap(map);
        expect(spyOnSetMap).toHaveBeenCalled();
        expect(UrlManager.getName()).toBe(FILENAME);
    });
});