import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { SettingsTool } from './settings-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { SettingsManager } from '../../toolbar-managers/settings-manager/settings-manager';

const FILENAME = 'settings-tool.js';

describe('SettingsTool', () => {
    beforeAll(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(SettingsManager, 'getSettings').mockImplementation(() => {
            return [];
        });
    });

    it('should init the tool', () => {
        const options = {onInitiated: () => {}};
        const spyOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = new SettingsTool(options);

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(SettingsTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(spyOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', () => {
        const options = {onClicked: () => {}};
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        const spyMomentary = jest.spyOn(SettingsTool.prototype, 'momentaryActivation');

        const tool = new SettingsTool(options);
        tool.onClickTool();

        expect(spyMomentary).toHaveBeenCalledTimes(1);
        expect(spyOnClicked).toHaveBeenCalledTimes(1);
    });
});