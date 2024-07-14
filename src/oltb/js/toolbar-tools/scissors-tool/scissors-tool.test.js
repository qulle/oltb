import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import * as jsts from 'jsts/dist/jsts.min';
import { BaseTool } from '../base-tool';
import { ToolManager } from '../../toolbar-managers/tool-manager/tool-manager';
import { SnapManager } from '../../toolbar-managers/snap-manager/snap-manager';
import { ScissorsTool } from './scissors-tool';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { eventDispatcher } from '../../browser-helpers/event-dispatcher';
import { SettingsManager } from '../../toolbar-managers/settings-manager/settings-manager';

const FILENAME = 'scissors-tool.js';

//--------------------------------------------------------------------
// # Section: Mocking
//--------------------------------------------------------------------
const mockView = {
    animate: (options) => {},
    cancelAnimations: () => {},
    getAnimating: () => true,
    getZoom: () => 1.234,
    getProjection: () => 'jest',
    getCenter: () => [1.123, 2.456],
    getRotation: () => 1.234,
    getConstrainedZoom: (zoom) => 1
};

const mockMap = {
    addLayer: (layer) => {},
    removeLayer: (layer) => {}, 
    addInteraction: (interaction) => {},
    removeInteraction: (interaction) => {},
    addOverlay: (overlay) => {},
    removeOverlay: (overlay) => {},
    on: (event, callback) => {},
    getView: () => {
        return mockView;
    }
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
    beforeAll(async () => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(SettingsManager, 'getSetting').mockImplementation(() => {
            return true;
        });

        jest.spyOn(ScissorsTool.prototype, 'getMap').mockImplementation(() => {
            return mockMap;
        });

        await StateManager.initAsync();
    });

    //--------------------------------------------------------------------
    // # Section: Jesting
    //--------------------------------------------------------------------
    it('should init the tool', () => {
        const tool = new ScissorsTool();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(ScissorsTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(jsts.io.OL3Parser).toHaveBeenCalled();
        expect(tool.options).toStrictEqual({
            strokeWidth: '2.5',
            strokeColor: '#0166A5FF',
            fillColor: '#D7E3FA80',
            onInitiated: undefined,
            onClicked: undefined,
            onBrowserStateCleared: undefined,
            onStart: undefined,
            onEnd: undefined,
            onAbort: undefined,
            onError: undefined,
            onSnapped: undefined
        });
    });

    it('should init the tool with options', () => {
        const options = {onInitiated: () => {}};
        const spyOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = new ScissorsTool(options);

        expect(tool).toBeTruthy();
        expect(spyOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', async () => {
        const options = {onClicked: () => {}};
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        const spyActivate = jest.spyOn(ScissorsTool.prototype, 'activateTool');
        const spyDeactivate = jest.spyOn(ScissorsTool.prototype, 'deactivateTool');

        await SnapManager.initAsync();
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

    it('should deactivate tool as done by ToolManager', () => {
        const tool = new ScissorsTool();
        const spy = jest.spyOn(ToolManager, 'removeActiveTool');

        tool.activateTool();
        tool.deselectTool();

        expect(spy).toHaveBeenCalled();
    });

    it('should re-activate active tool after reload', () => {
        const spy = jest.spyOn(ScissorsTool.prototype, 'activateTool').mockImplementation(() => {
            return;
        });

        const tool = new ScissorsTool();
        tool.localStorage.isActive = true;

        eventDispatcher([window], 'oltb.is.ready');
        expect(spy).toHaveBeenCalled();
    });

    it('should clean up state after beeing cleared', () => {
        const options = {onBrowserStateCleared: () =>{}};
        const spy = jest.spyOn(options, 'onBrowserStateCleared');
        new ScissorsTool(options);

        eventDispatcher([window], 'oltb.browser.state.cleared');
        expect(spy).toHaveBeenCalled();
    });

    it('should clear tool state', () => {
        // Note:
        // Spy after new, to make sure it is triggered only one time
        const tool = new ScissorsTool();
        const spy = jest.spyOn(StateManager, 'setStateObject');

        tool.doClearState();
        expect(spy).toHaveBeenCalledTimes(1);
    });
});