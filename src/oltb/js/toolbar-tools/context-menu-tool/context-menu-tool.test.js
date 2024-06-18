import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { ContextMenuTool } from './context-menu-tool';

const FILENAME = 'context-menu-tool.js';

describe('ContextMenuTool', () => {
    beforeAll(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    it('should init the tool', () => {
        const tool = new ContextMenuTool();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(ContextMenuTool);
        expect(tool.getName()).toBe(FILENAME);
    });
});