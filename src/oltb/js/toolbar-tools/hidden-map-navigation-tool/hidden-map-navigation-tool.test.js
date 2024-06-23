import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { HiddenMapNavigationTool } from './hidden-map-navigation-tool';

const FILENAME = 'hidden-map-navigation-tool.js';

//--------------------------------------------------------------------
// # Section: Testing
//--------------------------------------------------------------------
describe('HiddenMapNavigationTool', () => {
    //--------------------------------------------------------------------
    // # Section: Setup
    //--------------------------------------------------------------------
    beforeAll(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(StateManager, 'getStateObject').mockImplementation(() => {
            return {};
        });

        jest.spyOn(StateManager, 'setStateObject').mockImplementation(() => {
            return;
        });
    });

    //--------------------------------------------------------------------
    // # Section: Jesting
    //--------------------------------------------------------------------
    it('should init the tool', () => {
        const tool = new HiddenMapNavigationTool();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(HiddenMapNavigationTool);
        expect(tool.getName()).toBe(FILENAME);
    });
});