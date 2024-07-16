import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { HiddenMarkerTool } from './hidden-marker-tool';

const FILENAME = 'hidden-marker-tool.js';

describe('HiddenMarkerTool', () => {
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
        const tool = new HiddenMarkerTool();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(HiddenMarkerTool);
        expect(tool.getName()).toBe(FILENAME);
    });
});