import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { HiddenAboutTool } from './hidden-about-tool';

const FILENAME = 'hidden-about-tool.js';

describe('HiddenAboutTool', () => {
    beforeAll(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    it('should init the tool', () => {
        // TODO:
        // Not able to make toHaveBeenCalled() working on the ctor options
        const tool = new HiddenAboutTool();

        expect(tool).toBeTruthy();
        expect(tool.getName()).toBe(FILENAME);
    });
});