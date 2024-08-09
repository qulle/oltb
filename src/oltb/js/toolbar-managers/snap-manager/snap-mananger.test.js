import { jest, describe, it, expect } from '@jest/globals';
import { SnapManager } from './snap-manager';
import { SettingsManager } from '../settings-manager/settings-manager';

const FILENAME = 'snap-manager.js';

describe('SnapManager', () => {
    beforeAll(() => {
        jest.spyOn(SettingsManager, 'getSetting').mockImplementation(() => {
            return true;
        });
    });

    it('should init the manager', async () => {
        return SnapManager.initAsync({}).then((result) => {
            expect(result).toStrictEqual({
                filename: FILENAME,
                result: true
            });
        });
    });

    it('should have two overridden methods [setMap, getName]', () => {
        const spyOnSetMap = jest.spyOn(SnapManager, 'setMap');
        const map = {};

        SnapManager.setMap(map);
        expect(spyOnSetMap).toHaveBeenCalled();
        expect(SnapManager.getName()).toBe(FILENAME);
    });

    it('should not have snap activated on a tool', () => {
        expect(SnapManager.getActivatedBy()).toBeUndefined();
        expect(SnapManager.hasActiveTool()).toBe(false);
    });

    it('should add snap to dummy tool', () => {
        const name = 'Jest';
        const tool = {
            name: name,
            getName: ()  => { 
                return name; 
            },
        };

        const map = {
            on: (event, callback) => {},
            addInteraction: (interaction) => {},
            removeInteraction: (interaction) => {},
            addLayer: (overlay) => {},
            removeLayer: (overlay) => {}
        };

        SnapManager.setMap(map);
        SnapManager.addSnap(tool);
        
        expect(SnapManager.getActivatedBy()).toBe(tool);
        expect(SnapManager.hasActiveTool()).toBe(true);

        SnapManager.removeSnap();

        expect(SnapManager.getActivatedBy()).toBeUndefined();
        expect(SnapManager.hasActiveTool()).toBe(false);
    });
});