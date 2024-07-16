import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { FullscreenTool } from './fullscreen-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

const FILENAME = 'fullscreen-tool.js';

describe('FullscreenTool', () => {
    beforeEach(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getToastElement').mockImplementation(() => {
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
        const tool = new FullscreenTool();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(FullscreenTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(tool.options).toStrictEqual({
            onInitiated: undefined,
            onClicked: undefined,
            onEnter: undefined,
            onLeave: undefined
        });
    });

    it('should init the tool with options', () => {
        const options = {onInitiated: () => {}};
        const spyOnOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = new FullscreenTool(options);

        expect(tool).toBeTruthy();
        expect(spyOnOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', () => {
        const options = {onClicked: () => {}};
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        
        const tool = new FullscreenTool(options);
        const spyOnMomentaryActivation = jest.spyOn(tool, 'momentaryActivation');
        tool.onClickTool();

        expect(spyOnMomentaryActivation).toHaveBeenCalledTimes(1);
        expect(spyOnClicked).toHaveBeenCalledTimes(1);
    });
});