import { jest, beforeAll, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { DirectionTool } from './direction-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { eventDispatcher } from '../../browser-helpers/event-dispatcher';
import { simulateKeyPress } from '../../../../../__mocks__/simulate-key-press';

const FILENAME = 'direction-tool.js';

describe('DirectionTool', () => {
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
        const tool = new DirectionTool();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(DirectionTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(tool.options).toStrictEqual({
            onInitiated: undefined,
            onClicked: undefined,
            onBrowserStateCleared: undefined,
            onChanged: undefined
        });
    });

    it('should init the tool with options', () => {
        const options = {onInitiated: () => {}};
        const spyOnOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = new DirectionTool(options);

        expect(tool).toBeTruthy();
        expect(spyOnOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = new DirectionTool(options);
        const spyOnMomentaryActivation = jest.spyOn(tool, 'momentaryActivation');
        tool.onClickTool();

        expect(spyOnMomentaryActivation).toHaveBeenCalledTimes(1);
        expect(spyOnOnClicked).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool using short-cut-key [D]', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = new DirectionTool(options);
        const spyOnMomentaryActivation = jest.spyOn(tool, 'momentaryActivation');
        simulateKeyPress('keyup', window, 'D');

        expect(spyOnMomentaryActivation).toHaveBeenCalledTimes(1);
        expect(spyOnOnClicked).toHaveBeenCalledTimes(1);
    });

    it('should not toggle the tool using incorrect short-cut-key', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        new DirectionTool(options);
        simulateKeyPress('keyup', window, '!');
        expect(spyOnOnClicked).not.toHaveBeenCalled();
    });

    it('should clean up state after beeing cleared', () => {
        const options = {onBrowserStateCleared: () =>{}};
        const spyOnOnBrowserStateCleared = jest.spyOn(options, 'onBrowserStateCleared');
        new DirectionTool(options);

        eventDispatcher([window], 'oltb.browser.state.cleared');
        expect(spyOnOnBrowserStateCleared).toHaveBeenCalled();
    });
});