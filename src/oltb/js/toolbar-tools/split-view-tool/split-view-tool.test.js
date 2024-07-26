import { jest, beforeAll, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { OSM } from 'ol/source';
import { Tile } from 'ol';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { BaseTool } from '../base-tool';
import { LogManager } from '../../toolbar-managers/log-manager/log-manager';
import { LayerManager } from '../../toolbar-managers/layer-manager/layer-manager';
import { EventManager } from '../../toolbar-managers/event-manager/event-manager';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { SplitViewTool } from './split-view-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { simulateKeyPress } from '../../../../../__mocks__/simulate-key-press';

const FILENAME = 'split-view-tool.js';
const CLASS__TOOLBOX_SECTION = 'oltb-toolbox-section';
const ID__PREFIX = 'oltb-split-view';
const I18N__BASE = 'tools.splitViewTool';
const I18N__BASE_COMMON = 'commons';

//--------------------------------------------------------------------
// # Section: Mocking
//--------------------------------------------------------------------
const HTML__MOCK = (`
    <div id="${ID__PREFIX}-toolbox" class="${CLASS__TOOLBOX_SECTION}">
        <div class="${CLASS__TOOLBOX_SECTION}__header oltb-toggleable" data-oltb-toggleable-target="${ID__PREFIX}-toolbox-collapsed">
            <h4 class="${CLASS__TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N__BASE}.toolbox.titles.splitView">__JEST__</h4>
            <span class="${CLASS__TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.toggleSection" title="__JEST__"></span>
        </div>
        <div class="${CLASS__TOOLBOX_SECTION}__groups" id="${ID__PREFIX}-toolbox-collapsed" style="display: block;">
            <div class="${CLASS__TOOLBOX_SECTION}__group ${CLASS__TOOLBOX_SECTION}__group--split-group">
                <div class="${CLASS__TOOLBOX_SECTION}__group-part">
                    <label class="oltb-label" for="${ID__PREFIX}-left-source" data-oltb-i18n="${I18N__BASE}.toolbox.groups.leftSide.title">__JEST__</label>
                    <select id="${ID__PREFIX}-left-source" class="oltb-select"></select>
                </div>
                <div class="${CLASS__TOOLBOX_SECTION}__group-part" style="flex: none;">
                    <button type="button" id="${ID__PREFIX}-swap-button" class="oltb-btn oltb-btn--green-mid oltb-tippy" title="__JEST__">__JEST__</button>
                </div>
                <div class="${CLASS__TOOLBOX_SECTION}__group-part">
                    <label class="oltb-label" for="${ID__PREFIX}-source" data-oltb-i18n="${I18N__BASE}.toolbox.groups.rightSide.title">__JEST__</label>
                    <select id="${ID__PREFIX}-right-source" class="oltb-select"></select>
                </div>
            </div>
        </div>
    </div>
`);

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
describe('SplitViewTool', () => {
    const toolInstances = [];
    const initToolInstance = (options) => {
        const tool = new SplitViewTool(options);
        toolInstances.push(tool);
    
        return tool;
    }

    beforeAll(async () => {
        window.document.body.innerHTML = HTML__MOCK;

        await StateManager.initAsync();

        LayerManager.setMap(mockMap);
        LayerManager.addMapLayers([
            {
                id: '7b5399a8-9e57-4304-a233-cdf363c8ed93',
                name: 'Open Street Map',
                layer: new Tile({
                    source: new OSM({
                        crossOrigin: 'anonymous'
                    }),
                    visible: true
                })
            }, {
                id: '7b5399a8-9e57-4304-a233-cdf363c8ed93',
                name: 'Open Street Map 2',
                layer: new Tile({
                    source: new OSM({
                        crossOrigin: 'anonymous'
                    }),
                    visible: true
                })
            }
        ]);
    });

    beforeEach(() => {
        Element.prototype.scrollIntoView = jest.fn();

        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getToolboxElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
        
        jest.spyOn(ElementManager, 'getToastElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            const mapElement = window.document.createElement('div');
            mapElement.insertAdjacentHTML('beforeend', `
                <input type="range" min="0" max="100" value="50" class="oltb-slider" id="${ID__PREFIX}-slider">
            `);
            
            return mapElement;
        });

        // TODO:
        // Remove spyOn-prototypes in future
        jest.spyOn(SplitViewTool.prototype, 'getMap').mockImplementation(() => {
            return mockMap;
        });

        jest.spyOn(SplitViewTool.prototype, 'doUpdateTool').mockImplementation(() => {
            return;
        });

        jest.spyOn(LayerManager, 'setTopMapLayerAsOnlyVisible').mockImplementation(() => {
            return;
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

    it('should have two mock layers to be used by tool', () => {
        expect(LayerManager.getMapLayerSize()).toBe(2);
    });

    it('should init the tool', () => {
        const tool = initToolInstance();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(SplitViewTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(tool.options).toStrictEqual({
            onInitiated: undefined,
            onClicked: undefined,
            onBrowserStateCleared: undefined
        });
    });

    it('should init the tool with options', () => {
        const options = {onInitiated: () => {}};
        const spyOnOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = initToolInstance(options);

        expect(tool).toBeTruthy();
        expect(spyOnOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = initToolInstance(options);
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

    it('should toggle the tool using short-cut-key [S]', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = initToolInstance(options);
        const spyOnActivateTool = jest.spyOn(tool, 'activateTool');
        const spyOnDeactivateTool = jest.spyOn(tool, 'deactivateTool');
        
        expect(hasToolActiveClass(tool)).toBe(false);
        simulateKeyPress('keyup', window, 'S');
        expect(hasToolActiveClass(tool)).toBe(true);
        simulateKeyPress('keyup', window, 'S');
        expect(hasToolActiveClass(tool)).toBe(false);

        expect(spyOnActivateTool).toHaveBeenCalledTimes(1);
        expect(spyOnDeactivateTool).toHaveBeenCalledTimes(1);
        expect(spyOnOnClicked).toHaveBeenCalledTimes(2);
    });

    it('should not toggle the tool using incorrect short-cut-key', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        initToolInstance(options);
        simulateKeyPress('keyup', window, '!');
        expect(spyOnOnClicked).not.toHaveBeenCalled();
    });

    it('should slide-toggle the toolbox section', () => {
        const tool = initToolInstance();
        const spyOnSetStateObject = jest.spyOn(StateManager, 'setStateObject');
        const spyOnGetElementById = jest.spyOn(window.document, 'getElementById').mockImplementation(() => {
            return {
                slideToggle: (duration, callback) => {
                    callback(true);
                }
            }
        });

        tool.doToggleToolboxSection('jest-mock-name');

        expect(tool.localStorage.isCollapsed).toBe(true);
        expect(spyOnGetElementById).toHaveBeenCalled();
        expect(spyOnSetStateObject).toHaveBeenCalled();
    });

    it('should re-activate active tool after reload', () => {
        const tool = initToolInstance();
        tool.localStorage.isActive = true;

        const spyOnActivateTool = jest.spyOn(tool, 'activateTool').mockImplementation(() => {
            return;
        });

        EventManager.dispatchEvent([window], 'oltb.is.ready');
        expect(spyOnActivateTool).toHaveBeenCalled();
    });

    it('should clean up state after beeing cleared', () => {
        const options = {onBrowserStateCleared: () =>{}};
        const spyOnOnBrowserStateCleared = jest.spyOn(options, 'onBrowserStateCleared');
        initToolInstance(options);

        EventManager.dispatchEvent([window], 'oltb.browser.state.cleared');
        expect(spyOnOnBrowserStateCleared).toHaveBeenCalled();
    });

    it('should clear tool state', () => {
        const tool = initToolInstance();
        const spyOnSetStateObject = jest.spyOn(StateManager, 'setStateObject');

        tool.doClearState();
        expect(spyOnSetStateObject).toHaveBeenCalledTimes(1);
    });

    it('should add map-layer', () => {
        const spyOnAddLayer = jest.spyOn(mockMap, 'addLayer');
        const layer = {
            name: 'jest',
            setVisible: () => {}
        };
        const tool = initToolInstance();

        tool.doAddMapLayer(layer);
        expect(spyOnAddLayer).toHaveBeenCalledWith(layer);
    });

    it('should remove map-layer', () => {
        const spyOnRemoveLayer = jest.spyOn(mockMap, 'removeLayer');
        const layer = {
            name: 'jest',
            setVisible: () => {}
        };
        const tool = initToolInstance();
        
        tool.doRemoveMapLayer(layer);
        expect(spyOnRemoveLayer).toHaveBeenCalledWith(layer);
    });

    it('should add and remove map-layer from ui-select', () => {
        const tool = initToolInstance();

        expect(tool.uiRefLeftSource.length).toBe(0);
        expect(tool.uiRefRightSource.length).toBe(0);

        const event = {
            detail: {
                layerWrapper: {
                    getName: () => {
                        return 'jest';
                    },
                    getId: () => {
                        return 'jest-1';
                    }
                }
            }
        };

        tool.doMapLayerAdded(event);

        expect(tool.uiRefLeftSource.length).toBe(1);
        expect(tool.uiRefRightSource.length).toBe(1);

        tool.doMapLayerRemoved(event);

        expect(tool.uiRefLeftSource.length).toBe(0);
        expect(tool.uiRefRightSource.length).toBe(0);
    });

    it('should set loading error', () => {
        const spyOnLogError = jest.spyOn(LogManager, 'logError');
        const spyOnToastError = jest.spyOn(Toast, 'error');

        const tool = initToolInstance();
        tool.setLoadingError();
        expect(tool.layerLoadingError).toBe(true);

        expect(spyOnLogError).toHaveBeenCalledWith(FILENAME, 'setLoadingError', {
            message: 'One or both of the layers could not be loaded'
        });

        expect(spyOnToastError).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.errors.layerFailedToLoad`
        });
    });
});