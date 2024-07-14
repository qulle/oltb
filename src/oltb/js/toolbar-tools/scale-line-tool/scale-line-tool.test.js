import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ScaleLineTool } from './scale-line-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { eventDispatcher } from '../../browser-helpers/event-dispatcher';

const FILENAME = 'scale-line-tool.js';

//--------------------------------------------------------------------
// # Section: Mocking
//--------------------------------------------------------------------
class MockScaleLine {
    constructor() {}

    setMap(map) {}
}

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
describe('ScaleLineTool', () => {
    //--------------------------------------------------------------------
    // # Section: Setup
    //--------------------------------------------------------------------
    beforeAll(async () => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ScaleLineTool.prototype, 'getMap').mockImplementation(() => {
            return mockMap;
        });

        await StateManager.initAsync();
    });

    //--------------------------------------------------------------------
    // # Section: Jesting
    //--------------------------------------------------------------------
    it('should init the tool', () => {
        const tool = new ScaleLineTool();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(ScaleLineTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(tool.options).toStrictEqual({
            units: 'metric',
            onInitiated: undefined,
            onClicked: undefined,
            onBrowserStateCleared: undefined
        });
    });

    it('should init the tool with options', () => {
        const options = {onInitiated: () => {}};
        const spyOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = new ScaleLineTool(options);

        expect(tool).toBeTruthy();
        expect(spyOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', () => {
        const options = {onClicked: () => {}};
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        const spyActivate = jest.spyOn(ScaleLineTool.prototype, 'activateTool');
        const spyDeactivate = jest.spyOn(ScaleLineTool.prototype, 'deactivateTool');
        const spyScaleLine = jest.spyOn(MockScaleLine.prototype, 'setMap');

        const mockScaleLine = new MockScaleLine();
        const tool = new ScaleLineTool(options);
        tool.scaleLine = mockScaleLine;

        expect(hasToolActiveClass(tool)).toBe(false);
        tool.onClickTool();
        expect(hasToolActiveClass(tool)).toBe(true);
        tool.onClickTool();
        expect(hasToolActiveClass(tool)).toBe(false);

        expect(spyActivate).toHaveBeenCalledTimes(1);
        expect(spyDeactivate).toHaveBeenCalledTimes(1);
        expect(spyOnClicked).toHaveBeenCalledTimes(2);
        expect(spyScaleLine).toHaveBeenCalledTimes(2);
    });

    it('should re-activate active tool after reload', () => {
        const spy = jest.spyOn(ScaleLineTool.prototype, 'activateTool').mockImplementation(() => {
            return;
        });

        const tool = new ScaleLineTool();
        tool.localStorage.isActive = true;

        eventDispatcher([window], 'oltb.is.ready');
        expect(spy).toHaveBeenCalled();
    });

    it('should clean up state after beeing cleared', () => {
        const options = {onBrowserStateCleared: () =>{}};
        const spy = jest.spyOn(options, 'onBrowserStateCleared');
        new ScaleLineTool(options);

        eventDispatcher([window], 'oltb.browser.state.cleared');
        expect(spy).toHaveBeenCalled();
    });

    it('should clear tool state', () => {
        // Note:
        // Spy after new, to make sure it is triggered only one time
        const tool = new ScaleLineTool();
        const spy = jest.spyOn(StateManager, 'setStateObject');

        tool.doClearState();
        expect(spy).toHaveBeenCalledTimes(1);
    });
});