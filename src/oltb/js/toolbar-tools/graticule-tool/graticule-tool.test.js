import { jest, beforeAll, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { GraticuleTool } from './graticule-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { eventDispatcher } from '../../browser-helpers/event-dispatcher';

const FILENAME = 'graticule-tool.js';

//--------------------------------------------------------------------
// # Section: Mocking
//--------------------------------------------------------------------
class MockGraticule {
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

describe('GraticuleTool', () => {
    beforeAll(async () => {
        await StateManager.initAsync();
    });

    beforeEach(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(GraticuleTool.prototype, 'getMap').mockImplementation(() => {
            return mockMap;
        });
    });

    afterEach(() => {
        window.onkeydown = function() {};
        window.onkeyup = function() {};

        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should init the tool', () => {
        const tool = new GraticuleTool();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(GraticuleTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(tool.options).toStrictEqual({
            color: '#3B4352E6',
            dashed: true,
            width: 2,
            showLabels: true,
            wrapX: true,
            onInitiated: undefined,
            onClicked: undefined,
            onBrowserStateCleared: undefined
        });
    });

    it('should init the tool with options', () => {
        const options = {onInitiated: () => {}};
        const spyOnOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = new GraticuleTool(options);

        expect(tool).toBeTruthy();
        expect(spyOnOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const mockGraticule = new MockGraticule();
        const tool = new GraticuleTool(options);
        tool.graticule = mockGraticule;

        const spyOnActivateTool = jest.spyOn(tool, 'activateTool');
        const spyOnDeactivateTool = jest.spyOn(tool, 'deactivateTool');
        const spyOnGraticule = jest.spyOn(mockGraticule, 'setMap');

        expect(hasToolActiveClass(tool)).toBe(false);
        tool.onClickTool();
        expect(hasToolActiveClass(tool)).toBe(true);
        tool.onClickTool();
        expect(hasToolActiveClass(tool)).toBe(false);

        expect(spyOnActivateTool).toHaveBeenCalledTimes(1);
        expect(spyOnDeactivateTool).toHaveBeenCalledTimes(1);
        expect(spyOnOnClicked).toHaveBeenCalledTimes(2);
        expect(spyOnGraticule).toHaveBeenCalledTimes(2);
    });

    it('should re-activate active tool after reload', () => {
        const tool = new GraticuleTool();
        tool.localStorage.isActive = true;

        const spyOnActivateTool = jest.spyOn(tool, 'activateTool').mockImplementation(() => {
            return;
        });

        eventDispatcher([window], 'oltb.is.ready');
        expect(spyOnActivateTool).toHaveBeenCalled();
    });

    it('should clean up state after beeing cleared', () => {
        const options = {onBrowserStateCleared: () =>{}};
        const spyOnBrowserStateCleared = jest.spyOn(options, 'onBrowserStateCleared');
        new GraticuleTool(options);

        eventDispatcher([window], 'oltb.browser.state.cleared');
        expect(spyOnBrowserStateCleared).toHaveBeenCalled();
    });

    it('should clear tool state', () => {
        const tool = new GraticuleTool();
        const spyOnSetStateObject = jest.spyOn(StateManager, 'setStateObject');

        tool.doClearState();
        expect(spyOnSetStateObject).toHaveBeenCalledTimes(1);
    });
});