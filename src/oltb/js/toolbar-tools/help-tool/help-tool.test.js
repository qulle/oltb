import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { HelpTool } from './help-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { simulateKeyPress } from '../../../../../__mocks__/simulate-key-press';

const FILENAME = 'help-tool.js';

//--------------------------------------------------------------------
// # Section: Testing
//--------------------------------------------------------------------
describe('HelpTool', () => {
    //--------------------------------------------------------------------
    // # Section: Setup
    //--------------------------------------------------------------------
    beforeAll(() => {
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

    //--------------------------------------------------------------------
    // # Section: Jesting
    //--------------------------------------------------------------------
    it('should init the tool', () => {
        const tool = new HelpTool();

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
        const spyOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = new HelpTool(options);

        expect(tool).toBeTruthy();
        expect(spyOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', () => {
        const options = {onClicked: () => {}};
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        const spyMomentary = jest.spyOn(HelpTool.prototype, 'momentaryActivation');

        const tool = new HelpTool(options);
        tool.onClickTool();

        expect(spyMomentary).toHaveBeenCalledTimes(1);
        expect(spyOnClicked).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool using short-cut-key [1]', () => {
        const options = {onClicked: () => {}};
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        const spyMomentary = jest.spyOn(HelpTool.prototype, 'momentaryActivation');

        new HelpTool(options);
        simulateKeyPress('keyup', window, '1');

        // Note:
        // Since using prototype spy, more have-been-called-results than one first might expect.
        // 5 -> 4 times called by key-binding on window-object and 1 using tool.onClickTool
        expect(spyMomentary).toHaveBeenCalledTimes(5);
        expect(spyOnClicked).toHaveBeenCalledTimes(1);
    });

    it('should not toggle the tool using incorrect short-cut-key', () => {
        const options = {onClicked: () => {}};
        const spy = jest.spyOn(options, 'onClicked');

        new HelpTool(options);
        simulateKeyPress('keyup', window, '!');
        expect(spy).not.toHaveBeenCalled();
    });

    it('should open help window', () => {
        const tool = new HelpTool();
        const wrapper = () => {
            tool.doOpenTabOrWindow();
        };

        expect(wrapper).not.toThrow();
    });

    it('should ask user to open help window but user cancel', () => {
        const tool = new HelpTool();

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
        const tool = new HelpTool();
        const spy = jest.spyOn(HelpTool.prototype, 'doOpenTabOrWindow');

        expect(tool.helpDialog).toBeUndefined();
        tool.askToOpenTabOrWindow();
        expect(tool.helpDialog).not.toBeUndefined();

        const buttons = tool.helpDialog.buttons;
        const confirmButton = buttons[1];
        confirmButton.click();

        expect(spy).toHaveBeenCalledTimes(1);
        expect(tool.helpDialog).toBeUndefined();
    });
});