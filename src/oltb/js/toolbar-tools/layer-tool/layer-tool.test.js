import { jest, beforeAll, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { BaseTool } from '../base-tool';
import { LayerTool } from './layer-tool';
import { LogManager } from '../../toolbar-managers/log-manager/log-manager';
import { LayerManager } from '../../toolbar-managers/layer-manager/layer-manager';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { EventManager } from '../../toolbar-managers/event-manager/event-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { simulateKeyPress } from '../../../../../__mocks__/simulate-key-press';
import { InfoWindowManager } from '../../toolbar-managers/info-window-manager/info-window-manager';
import '../../browser-prototypes/string';

const FILENAME = 'layer-tool.js';
const CLASS__TOOLBOX_SECTION = 'oltb-toolbox-section';
const CLASS__TOOLBOX_LIST = 'oltb-toolbox-list';
const ID__PREFIX = 'oltb-layer';
const I18N__BASE = 'tools.layerTool';
const I18N__BASE_COMMON = 'commons';

//--------------------------------------------------------------------
// # Section: Mocking
//--------------------------------------------------------------------
const HTML__MOCK = (`
    <div id="${ID__PREFIX}-toolbox" class="${CLASS__TOOLBOX_SECTION}">
        <div class="${CLASS__TOOLBOX_SECTION}__header oltb-toggleable" data-oltb-toggleable-target="${ID__PREFIX}-map-toolbox-collapsed">
            <h4 class="${CLASS__TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N__BASE}.toolbox.titles.mapLayers">__JEST__</h4>
            <span class="${CLASS__TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.toggleSection" title="__JEST__"></span>
        </div>
        <div class="${CLASS__TOOLBOX_SECTION}__groups" id="${ID__PREFIX}-map-toolbox-collapsed" style="display: block;">
            <div class="${CLASS__TOOLBOX_SECTION}__group">
                <div class="oltb-input-button-group">
                    <input type="text" id="${ID__PREFIX}-map-stack-add-text" class="oltb-input" data-oltb-i18n="${I18N__BASE}.toolbox.groups.createMapLayer.placeholder" placeholder="__JEST__">
                    <button type="button" id="${ID__PREFIX}-map-stack-add-button" class="oltb-btn oltb-btn--green-mid oltb-tippy" data-oltb-i18n="${I18N__BASE}.toolbox.groups.createMapLayer.create" title="__JEST__">__JEST__</button>
                </div>
            </div>
            <div class="${CLASS__TOOLBOX_SECTION}__group">
                <ul id="${ID__PREFIX}-map-stack" class="${CLASS__TOOLBOX_LIST}"></ul>
            </div>
        </div>
        <div class="${CLASS__TOOLBOX_SECTION}__header oltb-toggleable" data-oltb-toggleable-target="${ID__PREFIX}-feature-toolbox-collapsed">
            <h4 class="${CLASS__TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N__BASE}.toolbox.titles.featureLayers">__JEST__</h4>
            <span class="${CLASS__TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.toggleSection" title="__JEST__"></span>
        </div>
        <div class="${CLASS__TOOLBOX_SECTION}__groups" id="${ID__PREFIX}-feature-toolbox-collapsed" style="display: block;">
            <div class="${CLASS__TOOLBOX_SECTION}__group">
                <div class="oltb-input-button-group">
                    <input type="text" id="${ID__PREFIX}-feature-stack-add-text" class="oltb-input" data-oltb-i18n="${I18N__BASE}.toolbox.groups.createFeatureLayer.placeholder" placeholder="__JEST__">
                    <button type="button" id="${ID__PREFIX}-feature-stack-add-button" class="oltb-btn oltb-btn--green-mid oltb-tippy" data-oltb-i18n="${I18N__BASE}.toolbox.groups.createFeatureLayer.create" title="__JEST__">__JEST__</button>
                </div>
            </div>
            <div class="${CLASS__TOOLBOX_SECTION}__group">
                <ul id="${ID__PREFIX}-feature-stack" class="${CLASS__TOOLBOX_LIST} ${CLASS__TOOLBOX_LIST}--selectable"></ul>
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
describe('LayerTool', () => {
    const toolInstances = [];
    const initToolInstance = (options) => {
        const tool = new LayerTool(options);
        toolInstances.push(tool);
    
        return tool;
    }
    
    beforeAll(async () => {
        window.document.body.innerHTML = HTML__MOCK;
        await StateManager.initAsync();
        await LayerManager.initAsync();
        await InfoWindowManager.initAsync();

        LayerManager.setMap(mockMap);
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
            return window.document.createElement('div');
        });

        jest.spyOn(LayerTool.prototype, 'getMap').mockImplementation(() => {
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
        expect(tool).toBeInstanceOf(LayerTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(tool.options).toStrictEqual({
            disableMapCreateLayerButton: false,
            disableMapLayerEditButton: false,
            disableMapLayerDeleteButton: false,
            disableFeatureCreateLayerButton: false,
            disableFeatureLayerEditButton: false,
            disableFeatureLayerDeleteButton: false,
            disableFeatureLayerDownloadButton: false,
            onClicked: undefined,
            onInitiated: undefined,
            onBrowserStateCleared: undefined,
            onMapLayerAdded: undefined,
            onMapLayerRemoved: undefined,
            onMapLayerRenamed: undefined,
            onMapLayerVisibilityChanged: undefined,
            onMapLayerDragged: undefined,
            onFeatureLayerAdded: undefined,
            onFeatureLayerRemoved: undefined,
            onFeatureLayerRenamed: undefined,
            onFeatureLayerVisibilityChanged: undefined,
            onFeatureLayerDownloaded: undefined,
            onFeatureLayerDragged: undefined
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

    it('should toggle the tool using short-cut-key [L]', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        const tool = initToolInstance(options);
        const spyOnActivateTool = jest.spyOn(tool, 'activateTool');
        const spyOnDeactivateTool = jest.spyOn(tool, 'deactivateTool');
        
        expect(hasToolActiveClass(tool)).toBe(false);
        simulateKeyPress('keyup', window, 'L');
        expect(hasToolActiveClass(tool)).toBe(true);
        simulateKeyPress('keyup', window, 'L');
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

        expect(tool.localStorage['jest-mock-name']).toBe(true);
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

    it('should check if key-event is valid Enter-key', () => {
        const tool = initToolInstance();
        const validEnter = {type: 'keyup', key: 'Enter'};
        const invalidEnter = {type: 'jest', key: 'Enter'};

        expect(tool.isValidEnter(validEnter)).toBe(true);
        expect(tool.isValidEnter(invalidEnter)).toBe(false);
    });

    it('should check layer has features', () => {
        const tool = initToolInstance();
        const validLayer = {
            getSource: () => {
                return {
                    getFeatures: () => {
                        return [{id: 1}, {id: 2}];
                    }
                }
            }
        };

        const invalidLayer = {
            getSource: () => {
                return {
                    getFeatures: () => {
                        return [];
                    }
                }
            }
        };

        expect(tool.hasLayerFeatures(validLayer)).toBe(true);
        expect(tool.hasLayerFeatures(invalidLayer)).toBe(false);
    });

    it('should check if projection exists', () => {
        const tool = initToolInstance();
        const validProjection = 'EPSG:3857';
        const invalidProjection = 'EPSG:1234';

        const spyOnLogError = jest.spyOn(LogManager, 'logError');
        const spyOnToastError = jest.spyOn(Toast, 'error');

        expect(tool.hasProjection(validProjection)).toBe(true);
        expect(tool.hasProjection(invalidProjection)).toBe(false);
        expect(spyOnLogError).toHaveBeenCalled();
        expect(spyOnToastError).toHaveBeenCalled();
    });

    it('should find map-layer with id 100, but not id 200 in localStorage', () => {
        const tool = initToolInstance();
        tool.localStorage.mapLayers.push({id: 100});

        expect(tool.hasLocalStorageMapLayerById(100)).toBe(true);
        expect(tool.hasLocalStorageMapLayerById(200)).toBe(false);
    });

    it('should find feature-layer with id 300, but not id 400 in localStorage', () => {
        const tool = initToolInstance();
        tool.localStorage.featureLayers.push({id: 300});

        expect(tool.hasLocalStorageFeatureLayerById(300)).toBe(true);
        expect(tool.hasLocalStorageFeatureLayerById(400)).toBe(false);
    });

    it('should remove one map- and one feature-layer that is stored in localStorage but not in LayerManager', () => {
        const tool = initToolInstance();
        tool.localStorage.mapLayers.push({id: 100});
        tool.localStorage.featureLayers.push({id: 200});

        const spyOnLogDebug = jest.spyOn(LogManager, 'logDebug');
        tool.removeUnusedLayers();
        expect(spyOnLogDebug).toHaveBeenCalledWith(FILENAME, 'removeUnusedLayers', {
            info: 'Removing unused layers',
            mapLayers: [{id: 100}],
            featureLayers: [{id: 200}]
        });
    });

    it('should ask user to download layer', () => {
        const tool = initToolInstance();
        const spyOnDownloadLayer = jest.spyOn(tool, 'doDownloadLayer').mockImplementation(() => {
            return;
        });

        const callback = {onDownload: () => {}};
        const layerWrapper = {
            getName: () => {
                return 'jest';
            },
            getId: () => {
                return 'jest-1';
            }
        };

        const modal = tool.askToDownloadLayer(layerWrapper, callback.onDownload);
        const buttons = modal.getButtons();
        const downloadButton = buttons[1];
        downloadButton.click();

        expect(spyOnDownloadLayer).toHaveBeenCalledTimes(1);
    });

    it('should ask user to rename layer', () => {
        const tool = initToolInstance();
        const callback = {onRenamed: () => {}};
        const spyOnOnRenamed = jest.spyOn(callback, 'onRenamed');

        const layerName = {
            innerText: '',
            getTippy: () => {
                return {
                    setContent: () => {}
                }
            }
        };

        const layerWrapper = {
            getName: () => {
                return 'jest';
            },
            getId: () => {
                return 'jest-1';
            },
            setName: (name) => {} 
        };

        const dialog = tool.askToRenameLayer(layerWrapper, callback.onRenamed, layerName);
        const buttons = dialog.buttons;
        const confirmButton = buttons[1];
        confirmButton.click();

        expect(spyOnOnRenamed).toHaveBeenCalledWith(layerWrapper);
    });

    it('should ask user to delete layer', () => {
        const tool = initToolInstance();
        const callback = {onDeleted: () => {}};
        const spyOnOnDeleted = jest.spyOn(callback, 'onDeleted');
        
        const layerWrapper = {
            getName: () => {
                return 'jest';
            },
            getId: () => {
                return 'jest-1';
            },
            setName: (name) => {} 
        };

        const dialog = tool.askToDeleteLayer(layerWrapper, callback.onDeleted);
        const buttons = dialog.buttons;
        const confirmButton = buttons[1];
        confirmButton.click();
    
        expect(spyOnOnDeleted).toHaveBeenCalledWith(layerWrapper);
    });

    it('should add feature-layer', () => {
        const tool = initToolInstance();

        expect(LayerManager.getFeatureLayerSize()).toBe(0);
        const layerWrapper = tool.doAddFeatureLayer({
            name: 'jest'
        });

        expect(layerWrapper).toBeTruthy();
        expect(LayerManager.getFeatureLayerSize()).toBe(1);
    });

    it('should remove feature-layer', () => {
        const layerWrapper = {
            getId: () => {
                return 'jest-1';
            }
        };

        const event = {
            detail: {
                isSilent: false,
                layerWrapper: layerWrapper
            }
        };
        
        const options = {onFeatureLayerRemoved: () => {}};
        const spyOnOnFeatureLayerRemoved = jest.spyOn(options, 'onFeatureLayerRemoved');
        const layers = '<li id="oltb-layer-feature-jest-1"></li>';

        const tool = initToolInstance(options);
        tool.uiRefFeatureLayerStack.innerHTML = layers;
        tool.doFeatureLayerRemoved(event);

        expect(spyOnOnFeatureLayerRemoved).toHaveBeenCalledWith(layerWrapper);
        expect(tool.uiRefFeatureLayerStack.innerHTML).toBe('');
    });

    it('should add map-layer', () => {
        const options = {onMapLayerRenamed: () => {}};
        const tool = initToolInstance(options);

        expect(LayerManager.getMapLayerSize()).toBe(0);
        const layerWrapper = tool.doAddMapLayer({
            name: 'jest',
            layer: 'Vector',
            projection: 'EPSG:3857',
            url: 'localhost:1234/jest',
            parameters: '{}',
            wrapX: true,
            attributions: 'jest',
            format: 'GeoJSON'
        });

        expect(layerWrapper).toBeTruthy();
        expect(LayerManager.getFeatureLayerSize()).toBe(1);
    });

    it('should remove map-layer', () => {
        const layerWrapper = {
            getId: () => {
                return 'jest-1';
            }
        };

        const event = {
            detail: {
                isSilent: false,
                layerWrapper: layerWrapper
            }
        };
        
        const options = {onMapLayerRemoved: () => {}};
        const spyOnOnMapLayerRemoved = jest.spyOn(options, 'onMapLayerRemoved');
        const layers = '<li id="oltb-layer-map-jest-1"></li>';

        const tool = initToolInstance(options);
        tool.uiRefMapLayerStack.innerHTML = layers;
        tool.doMapLayerRemoved(event);

        expect(spyOnOnMapLayerRemoved).toHaveBeenCalledWith(layerWrapper);
        expect(tool.uiRefMapLayerStack.innerHTML).toBe('');
    });

    it('should remove active class from all feature-layers but one', () => {
        const layerWrapper = {};
        const targetLayer = window.document.createElement('li');
        const layers = `
            <li class="oltb-toolbox-list__item--active"></li>
            <li class="oltb-toolbox-list__item--active"></li>
            <li class="oltb-toolbox-list__item--active"></li>
        `;

        const tool = initToolInstance();
        tool.uiRefFeatureLayerStack.innerHTML = layers;
        tool.uiRefFeatureLayerStack.appendChild(targetLayer);

        tool.doSetFeatureLayerAsActive(layerWrapper, targetLayer);
        let classCounter = 0;

        tool.uiRefFeatureLayerStack.querySelectorAll('li').forEach((item) => {
            if(item.classList.contains('oltb-toolbox-list__item--active')) {
                classCounter += 1;
            }
        });

        expect(classCounter).toBe(1);
        expect(LayerManager.getActiveFeatureLayer()).toBe(layerWrapper);
    });

    it('should change layer visibility', () => {
        const callbacks = {onFeatureLayerVisibilityChanged: () => {}};
        const spyOnOnFeatureLayerVisibilityChanged = jest.spyOn(callbacks, 'onFeatureLayerVisibilityChanged');
        const spyOnHideOverlay = jest.spyOn(InfoWindowManager, 'hideOverlay').mockImplementation(() => {
            return;
        });

        const data = {
            visible: true
        };

        const layer = {
            setVisible: (visible) => {
                data.visible = visible;
            },
            getVisible: () => {
                return data.visible;
            },
            getSource: () => {
                return {
                    getFeatures: () => {
                        return [];
                    }
                }
            }
        };

        const layerWrapper = {
            getLayer: () => {
                return layer;
            }
        };

        const tool = initToolInstance();
        tool.doChangeLayerVisibility(layerWrapper, callbacks.onFeatureLayerVisibilityChanged);

        expect(data.visible).toBe(false);
        expect(spyOnHideOverlay).toHaveBeenCalled();
        expect(spyOnOnFeatureLayerVisibilityChanged).toHaveBeenCalledTimes(1);
    });

    it('should download layer', () => {
        const layerWrapper = {
            getName: () => {
                return 'jest';
            },
            getLayer: () => {
                return {
                    getSource: () => {
                        return {
                            getFeatures: () => {
                                return [{
                                    name: 'jest'
                                }];
                            }
                        }
                    }
                }
            }
        };

        const format = {
            writeFeatures: (features, options) => {
                return JSON.stringify(features);
            }
        };

        const result = {
            format: 'GEOJSON'
        };

        const callbacks = {onDownload: () => {}};
        const spyOnOnDownload = jest.spyOn(callbacks, 'onDownload');

        const tool = initToolInstance();
        tool.doDownloadLayer(layerWrapper, format, result, callbacks.onDownload);

        expect(spyOnOnDownload).toHaveBeenCalledWith(layerWrapper, 'jest.geojson', '[{"name":"jest"}]');
    });
});