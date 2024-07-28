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
        const spyOnSetMap = jest.spyOn(InfoWindowManager, 'setMap');
        const map = {
            on: (event, callback) => {},
            addOverlay: (overlay) => {}
        };

        InfoWindowManager.setMap(map);
        expect(spyOnSetMap).toHaveBeenCalled();
        expect(InfoWindowManager.getName()).toBe(FILENAME);
    });

    it('should set view-port-cursor', () => {
        const cursor = 'pointer';
        const viewport = {
            style: {
                cursor: 'default'
            }
        };

        const map = {
            on: (event, callback) => {},
            addOverlay: (overlay) => {},
            getViewport: () => {
                return viewport;
            }
        };

        InfoWindowManager.setMap(map);
        expect(InfoWindowManager.getViewportCursor()).toBe('default');
        InfoWindowManager.setViewportCursor(cursor);
        expect(InfoWindowManager.getViewportCursor()).toBe('pointer');
    });

    it('should check if same feature', () => {
        const a = {};
        const b = {};
        expect(InfoWindowManager.isSameFeature(a, b)).toBe(false);
        expect(InfoWindowManager.isSameFeature(a, undefined)).toBe(false);

        a['ol_uid'] = 'jest';
        expect(InfoWindowManager.isSameFeature(a, b)).toBe(false);

        a['ol_uid'] = 'foo';
        b['ol_uid'] = 'bar';
        expect(InfoWindowManager.isSameFeature(a, b)).toBe(false);

        a['ol_uid'] = 'jest';
        b['ol_uid'] = 'jest';
        expect(InfoWindowManager.isSameFeature(a, b)).toBe(true);
    });
});