import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { HiddenMarkerTool } from './hidden-marker-tool';

const FILENAME = 'hidden-marker-tool.js';

describe('HiddenMarkerTool', () => {
    beforeAll(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    it('should init the tool', () => {
        // TODO:
        // Not able to make toHaveBeenCalled() working on the ctor options
        const tool = new HiddenMarkerTool();

        expect(tool).toBeTruthy();
        expect(tool.getName()).toBe(FILENAME);
    });
});