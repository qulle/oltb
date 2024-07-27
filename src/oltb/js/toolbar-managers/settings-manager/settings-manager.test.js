import { jest, describe, it, expect } from '@jest/globals';
import { StateManager } from '../state-manager/state-manager';
import { SettingsManager } from './settings-manager';
import { DefaultSettings } from './default-settings';

const FILENAME = 'settings-manager.js';

describe('SettingsManager', () => {
    beforeAll(async () => {
        await StateManager.initAsync();
    });

    it('should init the manager', async () => {
        return SettingsManager.initAsync({}).then((result) => {
            expect(result).toStrictEqual({
                filename: FILENAME,
                result: true
            });
        });
    });

    it('should have two overridden methods [setMap, getName]', () => {
        const spyOnSetMap = jest.spyOn(SettingsManager, 'setMap');
        const map = {};

        SettingsManager.setMap(map);
        expect(spyOnSetMap).toHaveBeenCalled();
        expect(SettingsManager.getName()).toBe(FILENAME);
    });

    it('should have settings', () => {
        expect(SettingsManager.getSettings()).toBeTruthy();
    });

    it('should have set settings to default instance', () => {
        SettingsManager.clear()
        expect(SettingsManager.getSettings()).toStrictEqual(DefaultSettings);
    });

    it('should have setting with name [mouseWheelZoom = false]', () => {
        expect(SettingsManager.getSetting('mouseWheelZoom')).toBe(false);
    });

    it('should have setting with name [altShiftDragRotate = true]', () => {
        expect(SettingsManager.getSetting('altShiftDragRotate')).toBe(true);
    });

    it('should add setting with name [jest = true]', () => {
        SettingsManager.addSetting('jest', {
            state: true
        });

        expect(SettingsManager.getSetting('jest')).toBe(true);
    });

    it('should set setting with name [jest = false]', () => {
        SettingsManager.setSetting('jest', {
            state: false
        });

        expect(SettingsManager.getSetting('jest')).toStrictEqual({
            state: false
        });
    });
});