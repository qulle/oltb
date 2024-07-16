import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { MagnifyTool } from './magnify-tool';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { eventDispatcher } from '../../browser-helpers/event-dispatcher';

const FILENAME = 'magnify-tool.js';

//--------------------------------------------------------------------
// # Section: Helpers
//--------------------------------------------------------------------
const hasToolActiveClass = (tool) => {
    return tool.button.classList.contains('oltb-tool-button--active');
}

describe('MagnifyTool', () => {
    beforeAll(async () => {
        await StateManager.initAsync();
    });

    beforeEach(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
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
        const tool = new MagnifyTool();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(MagnifyTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(tool.options).toStrictEqual({
            radius: 75,
            min: 25,
            max: 150,
            onInitiated: undefined,
            onClicked: undefined,
            onBrowserStateCleared: undefined
        });
    });

    it('should init the tool with options', () => {
        const options = {onInitiated: () => {}};
        const spyOnOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = new MagnifyTool(options);

        expect(tool).toBeTruthy();
        expect(spyOnOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = new MagnifyTool(options);
        const spyOnActivateTool = jest.spyOn(tool, 'activateTool');
        const spyOnDeactivateTool = jest.spyOn(tool, 'deactivateTool');

        expect(hasToolActiveClass(tool)).toBe(false);
        tool.onClickTool();
        expect(hasToolActiveClass(tool)).toBe(true);
        tool.onClickTool();
        expect(hasToolActiveClass(tool)).toBe(false);

        expect(spyOnActivateTool).toHaveBeenCalledTimes(1);
        expect(spyOnDeactivateTool).toHaveBeenCalledTimes(1);
        expect(spyOnOnClicked).toHaveBeenCalledTimes(2);
    });

    it('should re-activate active tool after reload', () => {
        const tool = new MagnifyTool();
        tool.localStorage.isActive = true;

        const spyOnActivateTool = jest.spyOn(tool, 'activateTool').mockImplementation(() => {
            return;
        });

        eventDispatcher([window], 'oltb.is.ready');
        expect(spyOnActivateTool).toHaveBeenCalled();
    });

    it('should clean up state after beeing cleared', () => {
        const options = {onBrowserStateCleared: () =>{}};
        const spyOnOnBrowserStateCleared = jest.spyOn(options, 'onBrowserStateCleared');
        new MagnifyTool(options);

        eventDispatcher([window], 'oltb.browser.state.cleared');
        expect(spyOnOnBrowserStateCleared).toHaveBeenCalled();
    });

    it('should clear tool state', () => {
        const tool = new MagnifyTool();
        const spyOnSetStateObject = jest.spyOn(StateManager, 'setStateObject');

        tool.doClearState();
        expect(spyOnSetStateObject).toHaveBeenCalledTimes(1);
    });
});