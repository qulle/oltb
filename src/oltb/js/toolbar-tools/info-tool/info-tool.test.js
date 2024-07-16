import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { InfoTool } from './info-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { simulateKeyPress } from '../../../../../__mocks__/simulate-key-press';

const FILENAME = 'info-tool.js';

describe('InfoTool', () => {
    beforeEach(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    afterEach(() => {
        window.onkeydown = function() {};
        window.onkeyup = function() {};

        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should init the tool', () => {
        const tool = new InfoTool();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(InfoTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(tool.options).toStrictEqual({
            title: 'Hey!',
            content: 'This is the default content, try adding some content of your own.',
            onInitiated: undefined,
            onClicked: undefined
        });
    });

    it('should init the tool with options', () => {
        const options = {onInitiated: () => {}};
        const spyOnOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = new InfoTool(options);

        expect(tool).toBeTruthy();
        expect(spyOnOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = new InfoTool(options);
        const spyOnMomentaryActivation = jest.spyOn(tool, 'momentaryActivation');
        tool.onClickTool();

        expect(spyOnMomentaryActivation).toHaveBeenCalledTimes(1);
        expect(spyOnOnClicked).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool using short-cut-key [I]', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = new InfoTool(options);
        const spyOnMomentaryActivation = jest.spyOn(tool, 'momentaryActivation');
        simulateKeyPress('keyup', window, 'I');

        expect(spyOnMomentaryActivation).toHaveBeenCalledTimes(1);
        expect(spyOnOnClicked).toHaveBeenCalledTimes(1);
    });

    it('should not toggle the tool using incorrect short-cut-key', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        new InfoTool(options);
        simulateKeyPress('keyup', window, '!');
        expect(spyOnOnClicked).not.toHaveBeenCalled();
    });

    it('should open info modal', () => {
        const tool = new InfoTool();

        // Note:
        // Trigger twice to also let JEST verify the blocking of modal/dialog when truthy
        expect(tool.infoModal).toBeUndefined();
        tool.doShowInfoModal();
        tool.doShowInfoModal();
        expect(tool.infoModal).not.toBeUndefined();

        const buttons = tool.infoModal.buttons;
        const closeButton = buttons[0];
        closeButton.click();
        expect(tool.infoModal).toBeUndefined();
    });
});