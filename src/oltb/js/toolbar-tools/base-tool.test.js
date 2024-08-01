import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { BaseTool } from './base-tool';
import { LogManager } from '../toolbar-managers/log-manager/log-manager';
import { ElementManager } from '../toolbar-managers/element-manager/element-manager';

const FILENAME = 'base-tool.js';

describe('BaseTool', () => {
    const toolInstances = [];
    const initToolInstance = (options) => {
        const tool = new BaseTool(options);
        toolInstances.push(tool);
    
        return tool;
    }

    beforeEach(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
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
        expect(tool.getName()).toBe(FILENAME);
    });

    it('should test [onClickTool]', () => {
        const spyOnLogDebug = jest.spyOn(LogManager, 'logDebug');
        const tool = initToolInstance();

        tool.onClickTool();
        expect(spyOnLogDebug).toHaveBeenCalledWith(FILENAME, 'onClickTool', 'User clicked tool');
    });
});