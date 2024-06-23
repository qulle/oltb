import { jest, beforeAll, afterAll, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { RefreshTool } from './refresh-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

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

        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    afterAll(() => {
        Object.defineProperty(window, 'location', { 
            configurable: true, 
            value: original 
        });
    });

    it('should init the tool', () => {
        const options = {onInitiated: () => {}};
        const spyOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = new RefreshTool(options);

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(RefreshTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(spyOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', () => {
        const options = {onClicked: () => {}};
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        const spyMomentary = jest.spyOn(RefreshTool.prototype, 'momentaryActivation');

        const tool = new RefreshTool(options);
        tool.onClickTool();

        expect(spyMomentary).toHaveBeenCalledTimes(1);
        expect(spyOnClicked).toHaveBeenCalledTimes(1);
    });
});