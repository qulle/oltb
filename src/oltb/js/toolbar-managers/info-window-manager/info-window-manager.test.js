import { jest, describe, it, expect } from '@jest/globals';
import { InfoWindowManager } from './info-window-manager';

const FILENAME = 'info-window-manager.js';

describe('InfoWindowManager', () => {
    it('should init the manager', async () => {
        return InfoWindowManager.initAsync({}).then((result) => {
            expect(result).toStrictEqual({
                filename: FILENAME,
                result: true
            });
        });
    });

    it('should have two overridden methods [setMap, getName]', () => {
        const spy = jest.spyOn(InfoWindowManager, 'setMap');
        const map = {
            on: (event, callback) => {},
            addOverlay: (overlay) => {}
        };

        InfoWindowManager.setMap(map);
        expect(spy).toHaveBeenCalled();
        expect(InfoWindowManager.getName()).toBe(FILENAME);
    });
});