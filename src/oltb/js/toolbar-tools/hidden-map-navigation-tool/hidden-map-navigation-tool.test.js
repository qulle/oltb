import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { HiddenMapNavigationTool } from './hidden-map-navigation-tool';

const FILENAME = 'hidden-map-navigation-tool.js';

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
// # Section: Testing
//--------------------------------------------------------------------
describe('HiddenMapNavigationTool', () => {
    //--------------------------------------------------------------------
    // # Section: Setup
    //--------------------------------------------------------------------
    beforeAll(async () => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        await StateManager.initAsync();
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

    it('should set last position', () => {
        const tool = new HiddenMapNavigationTool();
        tool.setLastPosition(mockMap);
        
        expect(tool.localStorage.lon).toBe(0.000010088080640662224);
        expect(tool.localStorage.lat).toBe(0.00002206262337267617);
        expect(tool.localStorage.zoom).toBe(1.234);
        expect(tool.localStorage.rotation).toBe(1.234);
    });
});