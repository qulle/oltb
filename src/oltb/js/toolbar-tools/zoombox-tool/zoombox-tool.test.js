import { jest, beforeAll, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { ZoomboxTool } from './zoombox-tool';
import { ToolManager } from '../../toolbar-managers/tool-manager/tool-manager';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { TooltipManager } from '../../toolbar-managers/tooltip-manager/tooltip-manager';
import { eventDispatcher } from '../../browser-helpers/event-dispatcher';

const FILENAME = 'zoombox-tool.js';

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

describe('ZoomboxTool', () => {
    beforeAll(async () => {
        await StateManager.initAsync();
        await TooltipManager.initAsync();

        TooltipManager.setMap(mockMap);
    });

    beforeEach(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ZoomboxTool.prototype, 'getMap').mockImplementation(() => {
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
        const tool = new ZoomboxTool();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(ZoomboxTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(tool.options).toStrictEqual({
            onInitiated: undefined,
            onClicked: undefined,
            onBrowserStateCleared: undefined,
            onStart: undefined,
            onEnd: undefined,
            onDrag: undefined,
            onCancel: undefined,
            onError: undefined
        });
    });

    it('should init the tool with options', () => {
        const options = {onInitiated: () => {}};
        const spyOnOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = new ZoomboxTool(options);

        expect(tool).toBeTruthy();
        expect(spyOnOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', async () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = new ZoomboxTool(options);
        const spyOnActivateTool = jest.spyOn(tool, 'activateTool');
        const spyOnDeactivateTool = jest.spyOn(tool, 'deactivateTool');
        
        expect(hasToolActiveClass(tool)).toBe(false);
        tool.onClickTool();
        expect(hasToolActiveClass(tool)).toBe(true);
        tool.onClickTool();
        expect(hasToolActiveClass(tool)).toBe(false);

        expect(spyOnActivateTool).toHaveBeenCalledTimes(1);
        expect(spyOnDeactivateTool).toHaveBeenCalledTimes(1);
        expect(spyOnOnClicked).toHaveBeenCalledTimes(2);
    });

    it('should deactivate tool as done by ToolManager', () => {
        const tool = new ZoomboxTool();
        const spyOnRemoveActiveTool = jest.spyOn(ToolManager, 'removeActiveTool');

        tool.activateTool();
        tool.deselectTool();

        expect(spyOnRemoveActiveTool).toHaveBeenCalled();
    });

    it('should re-activate active tool after reload', () => {
        const tool = new ZoomboxTool();
        tool.localStorage.isActive = true;

        const spyOnActivateTool = jest.spyOn(tool, 'activateTool').mockImplementation(() => {
            return;
        });

        eventDispatcher([window], 'oltb.is.ready');
        expect(spyOnActivateTool).toHaveBeenCalled();
    });

    it('should clean up state after beeing cleared', () => {
        const options = {onBrowserStateCleared: () =>{}};
        const spyOnOnBrowserStateCleared = jest.spyOn(options, 'onBrowserStateCleared');
        new ZoomboxTool(options);

        eventDispatcher([window], 'oltb.browser.state.cleared');
        expect(spyOnOnBrowserStateCleared).toHaveBeenCalled();
    });

    it('should clear tool state', () => {
        const tool = new ZoomboxTool();
        const spyOnSetStateObject = jest.spyOn(StateManager, 'setStateObject');

        tool.doClearState();
        expect(spyOnSetStateObject).toHaveBeenCalledTimes(1);
    });

    it('should trigger drawing-related-events', () => {
        const options = {
            onStart: () => {},
            onEnd: () => {},
            onDrag: () => {},
            onCancel: () => {},
            onError: () => {}
        };

        const spyOnOnStart = jest.spyOn(options, 'onStart');
        const spyOnOnEnd = jest.spyOn(options, 'onEnd');
        const spyOnOnDrag = jest.spyOn(options, 'onDrag');
        const spyOnOnCancel = jest.spyOn(options, 'onCancel');
        const spyOnOnError = jest.spyOn(options, 'onError');

        const tool = new ZoomboxTool(options);
        tool.interactionDragZoom.dispatchEvent('boxstart');
        tool.interactionDragZoom.dispatchEvent('boxend');
        tool.interactionDragZoom.dispatchEvent('boxdrag');
        tool.interactionDragZoom.dispatchEvent('boxcancel');
        tool.interactionDragZoom.dispatchEvent('error');

        expect(spyOnOnStart).toHaveBeenCalledTimes(1);
        expect(spyOnOnEnd).toHaveBeenCalledTimes(1);
        expect(spyOnOnDrag).toHaveBeenCalledTimes(1);
        expect(spyOnOnCancel).toHaveBeenCalledTimes(1);
        expect(spyOnOnError).toHaveBeenCalledTimes(1);
    });
});