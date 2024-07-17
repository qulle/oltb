import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { HelpTool } from './help-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { simulateKeyPress } from '../../../../../__mocks__/simulate-key-press';

const FILENAME = 'help-tool.js';

describe('HelpTool', () => {
    const toolInstances = [];
    const initToolInstance = (options) => {
        const tool = new HelpTool(options);
        toolInstances.push(tool);
    
        return tool;
    }

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

        jest.spyOn(window, 'open').mockImplementation(() => {
            return;
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
        expect(tool).toBeInstanceOf(HelpTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(tool.options).toStrictEqual({
            url: 'https://github.com/qulle/oltb',
            target: '_blank',
            onInitiated: undefined,
            onClicked: undefined
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

    it('should toggle the tool using short-cut-key [1]', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = initToolInstance(options);
        const spyOnMomentaryActivation = jest.spyOn(tool, 'momentaryActivation');
        simulateKeyPress('keyup', window, '1');

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

    it('should open help window', () => {
        const tool = initToolInstance();
        const wrapper = () => {
            tool.doOpenTabOrWindow();
        };

        expect(wrapper).not.toThrow();
    });

    it('should ask user to open help window but user cancel', () => {
        const tool = initToolInstance();

        // Note:
        // Trigger twice to also let JEST verify the blocking of modal/dialog when truthy
        expect(tool.helpDialog).toBeUndefined();
        tool.askToOpenTabOrWindow();
        tool.askToOpenTabOrWindow();
        expect(tool.helpDialog).not.toBeUndefined();

        const buttons = tool.helpDialog.buttons;
        const cancelButton = buttons[0];
        cancelButton.click();
        expect(tool.helpDialog).toBeUndefined();
    });

    it('should ask user to open help window', () => {
        const tool = initToolInstance();
        const spyOnDoOpenTabOrWindow = jest.spyOn(tool, 'doOpenTabOrWindow');

        expect(tool.helpDialog).toBeUndefined();
        tool.askToOpenTabOrWindow();
        expect(tool.helpDialog).not.toBeUndefined();

        const buttons = tool.helpDialog.buttons;
        const confirmButton = buttons[1];
        confirmButton.click();

        expect(spyOnDoOpenTabOrWindow).toHaveBeenCalledTimes(1);
        expect(tool.helpDialog).toBeUndefined();
    });
});