import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { BaseTool } from '../base-tool';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { eventDispatcher } from '../../browser-helpers/event-dispatcher';
import { copyToClipboard } from '../../browser-helpers/copy-to-clipboard';
import { HiddenMapNavigationTool } from './hidden-map-navigation-tool';

const FILENAME = 'hidden-map-navigation-tool.js';
const I18N__BASE = 'tools.hiddenMapNavigationTool';

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

        jest.spyOn(ElementManager, 'getToastElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(HiddenMapNavigationTool.prototype, 'getMap').mockImplementation(() => {
            return mockMap;
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

    it('should resolve copy map-coordinates', async () => {
        const spyToast = jest.spyOn(Toast, 'info');
        const coordinates = {lon: 12.34, lat: 43.21};

        jest.spyOn(copyToClipboard, 'copy').mockImplementation(() => {
            return Promise.resolve();
        });
        
        const tool = new HiddenMapNavigationTool();
        await tool.doCopyCoordinates(coordinates);

        expect(spyToast).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.infos.coordinatesCopied`,
            autoremove: true
        });
    });

    it('should reject copy map-coordinates', async () => {
        const spyToast = jest.spyOn(Toast, 'error');
        const coordinates = {lon: 12.34, lat: 43.21};

        jest.spyOn(copyToClipboard, 'copy').mockImplementation(() => {
            return Promise.reject();
        });
        
        const tool = new HiddenMapNavigationTool();
        await tool.doCopyCoordinates(coordinates);

        expect(spyToast).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.errors.coordinatesCopy`
        });
    });

    it('should re-activate active tool after reload', () => {
        const spy = jest.spyOn(HiddenMapNavigationTool.prototype, 'doDetectUrlMarker').mockImplementation(() => {
            return;
        });

        new HiddenMapNavigationTool();

        eventDispatcher([window], 'oltb.is.ready');
        expect(spy).toHaveBeenCalled();
    });
});