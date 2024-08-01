import { jest, beforeAll, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { BaseTool } from '../base-tool';
import { UrlManager } from '../../toolbar-managers/url-manager/url-manager';
import { LogManager } from '../../toolbar-managers/log-manager/log-manager';
import { EventManager } from '../../toolbar-managers/event-manager/event-manager';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
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
    const toolInstances = [];
    const initToolInstance = (options) => {
        const tool = new HiddenMapNavigationTool(options);
        toolInstances.push(tool);
    
        return tool;
    }

    beforeAll(async () => {
        await StateManager.initAsync();
    });

    beforeEach(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getToastElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(HiddenMapNavigationTool.prototype, 'getMap').mockImplementation(() => {
            return mockMap;
        });
    });

    afterEach(() => {
        toolInstances.forEach((tool) => {
            tool.detachGlobalListeners();
        });
        toolInstances.length = 0;
        
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
    
    it('should init the tool', () => {
        const tool = initToolInstance();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(HiddenMapNavigationTool);
        expect(tool.getName()).toBe(FILENAME);
    });

    it('should set last position', () => {
        const tool = initToolInstance();
        tool.setLastPosition(mockMap);
        
        expect(tool.localStorage.lon).toBe(0.000010088080640662224);
        expect(tool.localStorage.lat).toBe(0.00002206262337267617);
        expect(tool.localStorage.zoom).toBe(1.234);
        expect(tool.localStorage.rotation).toBe(1.234);
    });

    it('should resolve copy map-coordinates', async () => {
        const spyOnToastInfo = jest.spyOn(Toast, 'info');
        const coordinates = {lon: 12.34, lat: 43.21};

        jest.spyOn(copyToClipboard, 'copyAsync').mockImplementation(() => {
            return Promise.resolve();
        });
        
        const tool = initToolInstance();
        await tool.doCopyCoordinatesAsync(coordinates);

        expect(spyOnToastInfo).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.infos.coordinatesCopied`,
            autoremove: true
        });
    });

    it('should reject copy map-coordinates', async () => {
        const spyOnToastError = jest.spyOn(Toast, 'error');
        const coordinates = {lon: 12.34, lat: 43.21};

        jest.spyOn(copyToClipboard, 'copyAsync').mockImplementation(() => {
            return Promise.reject();
        });
        
        const tool = initToolInstance();
        await tool.doCopyCoordinatesAsync(coordinates);

        expect(spyOnToastError).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.errors.coordinatesCopy`
        });
    });

    it('should re-activate active tool after reload', () => {
        const tool = initToolInstance();
        const spyOnDoDetectUrlMarker = jest.spyOn(tool, 'doDetectUrlMarker').mockImplementation(() => {
            return;
        });

        EventManager.dispatchEvent([window], 'oltb.is.ready');
        expect(spyOnDoDetectUrlMarker).toHaveBeenCalled();
    });

    it('should show coordinates modal and close it', () => {
        const tool = initToolInstance();

        // Note:
        // Trigger twice to also let JEST verify the blocking of modal/dialog when truthy
        tool.doShowCoordinatesModal(mockMap);
        tool.doShowCoordinatesModal(mockMap);
        
        expect(tool.coordinatesModal).toBeTruthy();

        const buttons = tool.coordinatesModal.getButtons();
        const closeButton = buttons[0];
        closeButton.click();

        expect(tool.coordinatesModal).toBeFalsy();
    });

    // TODO:
    // What to expect?
    it('should show coordiantes modal and navigate to location', () => {
        const options = {onNavigationDone: () => {}};
        const tool = initToolInstance(options);

        tool.doShowCoordinatesModal(mockMap);

        const buttons = tool.coordinatesModal.getButtons();
        const navigateButton = buttons[1];
        navigateButton.click();
    });

    it('should detect marker given in URL', () => {
        const tool = initToolInstance();
        const spyOnDoParseUrlMarker = jest.spyOn(tool, 'doParseUrlMarker').mockImplementation(() => {
            return;
        });

        const spyOnGetUrlParameter = jest.spyOn(UrlManager, 'getParameter').mockImplementation(() => {
            return '{"title":"Marker Title","label":"Marker Label","description":"Information about the maker","icon":"exclamationTriangle.filled","iconFill":"%23FFFFFFFF","iconStroke":"%23FFFFFFFF","markerFill":"%23EB4542FF","markerStroke":"%23EB454266","layerName":"URL Marker","projection":"EPSG:4326","lon":18.0685,"lat":59.3293,"zoom":8}';
        });
  
        tool.doDetectUrlMarker();

        expect(spyOnGetUrlParameter).toHaveBeenCalledTimes(1);
        expect(spyOnDoParseUrlMarker).toHaveBeenCalledTimes(1);
    });

    it('should fail to parse marker given in URL', () => {
        const spyOnLogError = jest.spyOn(LogManager, 'logError');
        const spyOnToastError = jest.spyOn(Toast, 'error');
        const tool = initToolInstance();

        const brokenJSONValue = '{';
        tool.doParseUrlMarker(brokenJSONValue);

        expect(spyOnLogError).toHaveBeenCalled();
        expect(spyOnToastError).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.errors.parseUrlMarker`
        });
    });

    it('should parse marker given in URL', () => {
        const tool = initToolInstance();
        const spyOnLogDebug = jest.spyOn(LogManager, 'logDebug');
        const spyOnDoFocusMarker = jest.spyOn(tool, 'doFocusMarker').mockImplementation(() => {
            return;
        });

        const validJSONValue = '{"title":"Marker Title","label":"Marker Label","description":"Information about the maker","icon":"exclamationTriangle.filled","iconFill":"%23FFFFFFFF","iconStroke":"%23FFFFFFFF","markerFill":"%23EB4542FF","markerStroke":"%23EB454266","layerName":"URL Marker","projection":"EPSG:4326","lon":18.0685,"lat":59.3293,"zoom":8}';
        tool.doParseUrlMarker(validJSONValue);

        expect(spyOnLogDebug).toHaveBeenCalled();
        expect(spyOnDoFocusMarker).toHaveBeenCalledTimes(1);
    });

    it('should test correctness of marker given in URL', () => {
        const tool = initToolInstance();
        const spyOnLogDebug = jest.spyOn(LogManager, 'logDebug');
        const spyOnDoFocusMarker = jest.spyOn(tool, 'doFocusMarker').mockImplementation(() => {
            return;
        });

        // Note:
        // %23 replaced with #
        // EPSG:4326 replaced with 1234
        const validJSONValue = '{"title":"Marker Title","label":"Marker Label","description":"Information about the maker","icon":"exclamationTriangle.filled","iconFill":"#FFFFFFFF","iconStroke":"#FFFFFFFF","markerFill":"#EB4542FF","markerStroke":"#EB454266","layerName":"URL Marker","projection":"1234","lon":18.0685,"lat":59.3293,"zoom":8}';
        tool.doParseUrlMarker(validJSONValue);

        expect(spyOnLogDebug).toHaveBeenCalled();
        expect(spyOnDoFocusMarker).toHaveBeenCalledTimes(1);
    });
});