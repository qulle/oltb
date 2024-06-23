import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import * as jsts from 'jsts/dist/jsts.min';
import { BaseTool } from '../base-tool';
import { SnapManager } from '../../toolbar-managers/snap-manager/snap-manager';
import { ScissorsTool } from './scissors-tool';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { SettingsManager } from '../../toolbar-managers/settings-manager/settings-manager';

const FILENAME = 'scissors-tool.js';

//--------------------------------------------------------------------
// # Section: Mocking
//--------------------------------------------------------------------
const mockMap = {
    addInteraction: (interaction) => {},
    removeInteraction: (interaction) => {},
    addOverlay: (overlay) => {},
    removeOverlay: (overlay) => {},
    on: (event, callback) => {}
};

//--------------------------------------------------------------------
// # Section: Helpers
//--------------------------------------------------------------------
const hasToolActiveClass = (tool) => {
    return tool.button.classList.contains('oltb-tool-button--active');
}

//--------------------------------------------------------------------
// # Section: Testing
//--------------------------------------------------------------------
describe('ScissorsTool', () => {
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

        jest.spyOn(SettingsManager, 'getSetting').mockImplementation(() => {
            return true;
        });

        jest.spyOn(ScissorsTool.prototype, 'getMap').mockImplementation(() => {
            return mockMap;
        });
    });

    //--------------------------------------------------------------------
    // # Section: Jesting
    //--------------------------------------------------------------------
    it('should init the tool', () => {
        const options = {onInitiated: () => {}};
        const spyOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = new ScissorsTool(options);

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(ScissorsTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(spyOnInitiated).toHaveBeenCalledTimes(1);
        expect(jsts.io.OL3Parser).toHaveBeenCalled();
    });

    it('should toggle the tool', () => {
        const options = {onClicked: () => {}};
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        const spyActivate = jest.spyOn(ScissorsTool.prototype, 'activateTool');
        const spyDeactivate = jest.spyOn(ScissorsTool.prototype, 'deactivateTool');

        SnapManager.initAsync();
        SnapManager.setMap(mockMap);

        const tool = new ScissorsTool(options);

        expect(hasToolActiveClass(tool)).toBe(false);
        tool.onClickTool();
        expect(hasToolActiveClass(tool)).toBe(true);
        tool.onClickTool();
        expect(hasToolActiveClass(tool)).toBe(false);

        expect(spyActivate).toHaveBeenCalledTimes(1);
        expect(spyDeactivate).toHaveBeenCalledTimes(1);
        expect(spyOnClicked).toHaveBeenCalledTimes(2);
    });
});