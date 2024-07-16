import { jest, beforeAll, beforeEach, afterAll, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { RefreshTool } from './refresh-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { simulateKeyPress } from '../../../../../__mocks__/simulate-key-press';

const FILENAME = 'refresh-tool.js';

describe('RefreshTool', () => {
    const original = window.location;

    beforeAll(() => {
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { 
                reload: jest.fn() 
            },
        });
    });

    beforeEach(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    afterAll(() => {
        Object.defineProperty(window, 'location', { 
            configurable: true, 
            value: original 
        });

        window.onkeydown = function() {};
        window.onkeyup = function() {};

        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should init the tool', () => {
        const tool = new RefreshTool();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(RefreshTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(tool.options).toStrictEqual({
            onInitiated: undefined,
            onClicked: undefined
        });
    });

    it('should init the tool with options', () => {
        const options = {onInitiated: () => {}};
        const spyOnOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = new RefreshTool(options);

        expect(tool).toBeTruthy();
        expect(spyOnOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = new RefreshTool(options);
        const spyOnMomentaryActivation = jest.spyOn(tool, 'momentaryActivation');
        tool.onClickTool();

        expect(spyOnMomentaryActivation).toHaveBeenCalledTimes(1);
        expect(spyOnOnClicked).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool using short-cut-key [R]', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = new RefreshTool(options);
        const spyOnMomentaryActivation = jest.spyOn(tool, 'momentaryActivation');
        simulateKeyPress('keyup', window, 'R');

        expect(spyOnMomentaryActivation).toHaveBeenCalledTimes(1);
        expect(spyOnOnClicked).toHaveBeenCalledTimes(1);
    });

    it('should not toggle the tool using incorrect short-cut-key', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        new RefreshTool(options);
        simulateKeyPress('keyup', window, '!');
        expect(spyOnOnClicked).not.toHaveBeenCalled();
    });
});