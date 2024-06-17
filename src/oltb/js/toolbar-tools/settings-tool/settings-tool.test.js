import { jest, beforeAll, describe, it, expect } from '@jest/globals';
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
        // TODO:
        // Not able to make toHaveBeenCalled() working on the ctor options
        const tool = new SettingsTool({
            onClicked: () => {
                expect(1).toBe(1);
            },
            onInitiated: () => {
                expect(1).toBe(1);
            }
        });

        expect(tool).toBeTruthy();
        expect(tool.getName()).toBe(FILENAME);

        tool.onClickTool();
    });
});