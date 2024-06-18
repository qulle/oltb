import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { BaseTool } from './base-tool';
import { LogManager } from '../toolbar-managers/log-manager/log-manager';
import { ElementManager } from '../toolbar-managers/element-manager/element-manager';

const FILENAME = 'base-tool.js';

describe('BaseTool', () => {
    beforeAll(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    it('should init the tool', () => {
        const tool = new BaseTool();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool.getName()).toBe(FILENAME);
    });

    it('should test [onClickTool]', () => {
        const spyOnClicked = jest.spyOn(LogManager, 'logDebug');
        const tool = new BaseTool();

        tool.onClickTool();
        expect(spyOnClicked).toHaveBeenCalledWith(FILENAME, 'onClickTool', 'User clicked tool');
    });
});