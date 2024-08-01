import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { TippyManager } from './tippy-manager';
import { ElementManager } from '../element-manager/element-manager';

const FILENAME = 'tippy-manager.js';

describe('TippyManager', () => {
    beforeAll(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    it('should init the manager', async () => {
        return TippyManager.initAsync({}).then((result) => {
            expect(result).toStrictEqual({
                filename: FILENAME,
                result: true
            });
        });
    });

    it('should have two overridden methods [setMap, getName]', () => {
        const spyOnSetMap = jest.spyOn(TippyManager, 'setMap');
        const map = {};

        TippyManager.setMap(map);
        expect(spyOnSetMap).toHaveBeenCalled();
        expect(TippyManager.getName()).toBe(FILENAME);
    });

    it('should have tool-button-tippy', () => {
        expect(TippyManager.getToolButtonTippy()).toBeTruthy();
    });

    it('should have dynamic-tippy', () => {
        expect(TippyManager.getDynamicTippy()).toBeTruthy();
    });

    it('should have color-tippy', () => {
        expect(TippyManager.getColorTippy()).toBeTruthy();
    });
});