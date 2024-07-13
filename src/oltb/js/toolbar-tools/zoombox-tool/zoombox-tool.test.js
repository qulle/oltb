import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { ZoomboxTool } from './zoombox-tool';
import { ToolManager } from '../../toolbar-managers/tool-manager/tool-manager';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { TooltipManager } from '../../toolbar-managers/tooltip-manager/tooltip-manager';

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

//--------------------------------------------------------------------
// # Section: Testing
//--------------------------------------------------------------------
describe('ZoomboxTool', () => {
    //--------------------------------------------------------------------
    // # Section: Setup
    //--------------------------------------------------------------------
    beforeAll(async () => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ZoomboxTool.prototype, 'getMap').mockImplementation(() => {
            return mockMap;
        });

        await StateManager.initAsync();
    });

    //--------------------------------------------------------------------
    // # Section: Jesting
    //--------------------------------------------------------------------
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
        const spyOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = new ZoomboxTool(options);

        expect(tool).toBeTruthy();
        expect(spyOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', async () => {
        const options = {onClicked: () => {}};
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        const spyActivate = jest.spyOn(ZoomboxTool.prototype, 'activateTool');
        const spyDeactivate = jest.spyOn(ZoomboxTool.prototype, 'deactivateTool');

        await TooltipManager.initAsync();
        TooltipManager.setMap(mockMap);

        const tool = new ZoomboxTool(options);
        
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
        const tool = new ZoomboxTool();
        const spy = jest.spyOn(ToolManager, 'removeActiveTool');

        tool.activateTool();
        tool.deselectTool();

        expect(spy).toHaveBeenCalled();
    });

    it('should clear tool state', () => {
        // Note:
        // Spy after new, to make sure it is triggered only one time
        const tool = new ZoomboxTool();
        const spy = jest.spyOn(StateManager, 'setStateObject');

        tool.doClearState();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should trigger drawing-related-events', () => {
        const event = {id: 'jest'};
        const options = {
            onStart: () => {},
            onEnd: () => {},
            onDrag: () => {},
            onCancel: () => {},
            onError: () => {}
        };

        const spyOnStart = jest.spyOn(options, 'onStart');
        const spyOnEnd = jest.spyOn(options, 'onEnd');
        const spyOnDrag = jest.spyOn(options, 'onDrag');
        const spyOnCancel = jest.spyOn(options, 'onCancel');
        const spyOnError = jest.spyOn(options, 'onError');

        const tool = new ZoomboxTool(options);
        tool.doBoxDragStart(event);
        tool.doBoxDragEnd(event);
        tool.doBoxDragDrag(event);
        tool.doBoxDragCancel(event);
        tool.doBoxDragError(event);

        expect(spyOnStart).toHaveBeenCalledWith(event);
        expect(spyOnEnd).toHaveBeenCalledWith(event);
        expect(spyOnDrag).toHaveBeenCalledWith(event);
        expect(spyOnCancel).toHaveBeenCalledWith(event);
        expect(spyOnError).toHaveBeenCalledWith(event);
    });
});