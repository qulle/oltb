import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { HiddenMapNavigationTool } from './hidden-map-navigation-tool';

const FILENAME = 'hidden-map-navigation-tool.js';

describe('HiddenMapNavigationTool', () => {
    beforeAll(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(StateManager, 'getStateObject').mockImplementation(() => {
            return {};
        });
    });

    it('should init the tool', () => {
        // TODO:
        // Not able to make toHaveBeenCalled() working on the ctor options
        const tool = new HiddenMapNavigationTool();

        expect(tool).toBeTruthy();
        expect(tool.getName()).toBe(FILENAME);
    });
});