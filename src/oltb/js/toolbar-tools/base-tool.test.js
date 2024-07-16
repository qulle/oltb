import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { BaseTool } from './base-tool';
import { LogManager } from '../toolbar-managers/log-manager/log-manager';
import { ElementManager } from '../toolbar-managers/element-manager/element-manager';

const FILENAME = 'base-tool.js';

describe('BaseTool', () => {
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
        const tool = new BaseTool();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool.getName()).toBe(FILENAME);
    });

    it('should test [onClickTool]', () => {
        const spyOnLogDebug = jest.spyOn(LogManager, 'logDebug');
        const tool = new BaseTool();

        tool.onClickTool();
        expect(spyOnLogDebug).toHaveBeenCalledWith(FILENAME, 'onClickTool', 'User clicked tool');
    });
});