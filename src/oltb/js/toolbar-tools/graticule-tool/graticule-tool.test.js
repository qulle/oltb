import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { GraticuleTool } from './graticule-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

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
    getRotation: () => 1.234
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
describe('GraticuleTool', () => {
    //--------------------------------------------------------------------
    // # Section: Setup
    //--------------------------------------------------------------------
    beforeAll(async () => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(GraticuleTool.prototype, 'getMap').mockImplementation(() => {
            return mockMap;
        });

        await StateManager.initAsync();
    });

    //--------------------------------------------------------------------
    // # Section: Jesting
    //--------------------------------------------------------------------
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
        const spyOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = new GraticuleTool(options);

        expect(tool).toBeTruthy();
        expect(spyOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', () => {
        const options = {onClicked: () => {}};
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        const spyActivate = jest.spyOn(GraticuleTool.prototype, 'activateTool');
        const spyDeactivate = jest.spyOn(GraticuleTool.prototype, 'deactivateTool');
        const spyGraticule = jest.spyOn(MockGraticule.prototype, 'setMap');

        const mockGraticule = new MockGraticule();
        const tool = new GraticuleTool(options);
        tool.graticule = mockGraticule;

        expect(hasToolActiveClass(tool)).toBe(false);
        tool.onClickTool();
        expect(hasToolActiveClass(tool)).toBe(true);
        tool.onClickTool();
        expect(hasToolActiveClass(tool)).toBe(false);

        expect(spyActivate).toHaveBeenCalledTimes(1);
        expect(spyDeactivate).toHaveBeenCalledTimes(1);
        expect(spyOnClicked).toHaveBeenCalledTimes(2);
        expect(spyGraticule).toHaveBeenCalledTimes(2);
    });
});