import { jest, beforeAll, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { BaseTool } from '../base-tool';
import { SettingsTool } from './settings-tool';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { SettingsManager } from '../../toolbar-managers/settings-manager/settings-manager';
import { simulateKeyPress } from '../../../../../__mocks__/simulate-key-press';

const FILENAME = 'settings-tool.js';
const I18N__BASE = 'tools.settingsTool';

describe('SettingsTool', () => {
    const toolInstances = [];
    const initToolInstance = (options) => {
        const tool = new SettingsTool(options);
        toolInstances.push(tool);
    
        return tool;
    }

    beforeAll(async () => {
        await StateManager.initAsync();
        await SettingsManager.initAsync();
    });

    beforeEach(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getToastElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    afterEach(() => {
        toolInstances.forEach((tool) => {
            tool.detachGlobalListeners();
        });
        toolInstances.length = 0;

        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should init the tool', () => {
        const tool = initToolInstance();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(SettingsTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(tool.options).toStrictEqual({
            onInitiated: undefined,
            onClicked: undefined,
            onBrowserStateCleared: undefined
        });
    });

    it('should init the tool with options', () => {
        const options = {onInitiated: () => {}};
        const spyOnOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = initToolInstance(options);

        expect(tool).toBeTruthy();
        expect(spyOnOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = initToolInstance(options);
        const spyOnMomentaryActivation = jest.spyOn(tool, 'momentaryActivation');
        tool.onClickTool();

        expect(spyOnMomentaryActivation).toHaveBeenCalledTimes(1);
        expect(spyOnOnClicked).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool using short-cut-key [2]', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = initToolInstance(options);
        const spyOnMomentaryActivation = jest.spyOn(tool, 'momentaryActivation');
        simulateKeyPress('keyup', window, '2');

        expect(spyOnMomentaryActivation).toHaveBeenCalledTimes(1);
        expect(spyOnOnClicked).toHaveBeenCalledTimes(1);
    });

    it('should not toggle the tool using incorrect short-cut-key', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        initToolInstance(options);
        simulateKeyPress('keyup', window, '!');
        expect(spyOnOnClicked).not.toHaveBeenCalled();
    });

    it('should ask user to clear browser state', () => {
        const spyOnToastInfo = jest.spyOn(Toast, 'info');
        const tool = initToolInstance();
        const spyOnDoDispatchEvent = jest.spyOn(tool, 'doDispatchBrowserStateCleared').mockImplementation(() => {
            return;
        });

        const dialog = tool.askToClearBrowserState();
        const confirmButton = dialog.buttons[1];
        confirmButton.click();

        expect(spyOnDoDispatchEvent).toHaveBeenCalledTimes(1);
        expect(spyOnToastInfo).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.infos.clearBrowserState`,
            autoremove: true
        });
    });

    it('should clear browser state and trigger event', () => {
        const options = {onBrowserStateCleared: () => {}};
        const spyOnOnBrowserStateCleared = jest.spyOn(options, 'onBrowserStateCleared');

        const tool = initToolInstance(options);
        tool.doDispatchBrowserStateCleared();

        expect(spyOnOnBrowserStateCleared).toHaveBeenCalledTimes(1);
    });
});