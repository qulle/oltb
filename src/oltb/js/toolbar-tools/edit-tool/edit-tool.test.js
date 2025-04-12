import { jest, beforeAll, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import * as jsts from 'jsts/dist/jsts.min';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { Polygon } from 'ol/geom';
import { BaseTool } from '../base-tool';
import { EditTool } from './edit-tool';
import { LogManager } from '../../toolbar-managers/log-manager/log-manager';
import { ToolManager } from '../../toolbar-managers/tool-manager/tool-manager';
import { SnapManager } from '../../toolbar-managers/snap-manager/snap-manager';
import { EventManager } from '../../toolbar-managers/event-manager/event-manager';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { LayerManager } from '../../toolbar-managers/layer-manager/layer-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { FeatureManager } from '../../toolbar-managers/feature-manager/feature-manager';
import { SettingsManager } from '../../toolbar-managers/settings-manager/settings-manager';
import { Feature, Overlay } from 'ol';
import { simulateKeyPress } from '../../../../../__mocks__/simulate-key-press';
import '../../browser-prototypes/string';
import '../../browser-prototypes/json-cycle';

const FILENAME = 'edit-tool.js';
const CLASS__TOOLBOX_SECTION = 'oltb-toolbox-section';
const ID__PREFIX = 'oltb-edit';
const I18N__BASE = 'tools.editTool';
const I18N__BASE_COMMON = 'commons';

//--------------------------------------------------------------------
// # Section: Mocking
//--------------------------------------------------------------------
const HTML__MOCK = (`
    <div id="${ID__PREFIX}-toolbox" class="${CLASS__TOOLBOX_SECTION}">
        <div class="${CLASS__TOOLBOX_SECTION}__header oltb-toggleable" data-oltb-toggleable-target="${ID__PREFIX}-toolbox-collapsed">
            <h4 class="${CLASS__TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N__BASE}.toolbox.titles.edit">__JEST__</h4>
            <span class="${CLASS__TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.toggleSection" title="__JEST__"></span>
        </div>
        <div class="${CLASS__TOOLBOX_SECTION}__groups" id="${ID__PREFIX}-toolbox-collapsed" style="display: block;">
            <div class="${CLASS__TOOLBOX_SECTION}__group ${CLASS__TOOLBOX_SECTION}__group--sub-toolbar">
                <label class="oltb-label" data-oltb-i18n="${I18N__BASE}.toolbox.groups.misc.title">__JEST__</label>
                <button type="button" id="${ID__PREFIX}-delete-selected-button" class="oltb-btn oltb-btn--blue-mid oltb-tippy" data-oltb-i18n="${I18N__BASE}.toolbox.groups.misc.delete" title="__JEST__">__JEST__</button>
                <button type="button" id="${ID__PREFIX}-rotate-selected-button" class="oltb-btn oltb-btn--blue-mid oltb-tippy" data-oltb-i18n="${I18N__BASE}.toolbox.groups.misc.rotate" title="__JEST__">__JEST__</button>
                <button type="button" id="${ID__PREFIX}-info-button" class="oltb-btn oltb-btn--blue-mid oltb-tippy" data-oltb-i18n="${I18N__BASE}.toolbox.groups.misc.geometryData" title="__JEST__">__JEST__</button>
                <button type="button" id="${ID__PREFIX}-convert-button" class="oltb-btn oltb-btn--blue-mid oltb-tippy" data-oltb-i18n="${I18N__BASE}.toolbox.groups.misc.convertFeature" title="__JEST__">__JEST__</button>
            </div>
            <div class="${CLASS__TOOLBOX_SECTION}__group ${CLASS__TOOLBOX_SECTION}__group--sub-toolbar">
                <label class="oltb-label" data-oltb-i18n="${I18N__BASE}.toolbox.groups.copying.title">__JEST__</label>
                <button type="button" id="${ID__PREFIX}-cut-selected-button" class="oltb-btn oltb-btn--blue-mid oltb-tippy" data-oltb-i18n="${I18N__BASE}.toolbox.groups.copying.cut" title="__JEST__">__JEST__</button>
                <button type="button" id="${ID__PREFIX}-copy-selected-button" class="oltb-btn oltb-btn--blue-mid oltb-tippy" data-oltb-i18n="${I18N__BASE}.toolbox.groups.copying.copy" title="__JEST__">__JEST__</button>
                <button type="button" id="${ID__PREFIX}-paste-selected-button" class="oltb-btn oltb-btn--blue-mid oltb-tippy" data-oltb-i18n="${I18N__BASE}.toolbox.groups.copying.paste" title="__JEST__">__JEST__</button>
            </div>
            <div class="${CLASS__TOOLBOX_SECTION}__group ${CLASS__TOOLBOX_SECTION}__group--sub-toolbar">
                <label class="oltb-label" data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.title">__JEST__</label>
                <button type="button" id="${ID__PREFIX}-union-selected-button" class="oltb-btn oltb-btn--blue-mid oltb-tippy" data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.union" title="__JEST__">__JEST__</button>
                <button type="button" id="${ID__PREFIX}-intersect-selected-button" class="oltb-btn oltb-btn--blue-mid oltb-tippy" data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.intersect" title="__JEST__">__JEST__</button>
                <button type="button" id="${ID__PREFIX}-exclude-selected-button" class="oltb-btn oltb-btn--blue-mid oltb-tippy" data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.exclude" title="__JEST__">__JEST__</button>
                <button type="button" id="${ID__PREFIX}-difference-selected-button" class="oltb-btn oltb-btn--blue-mid oltb-tippy" data-oltb-i18n="${I18N__BASE}.toolbox.groups.shapes.difference" title="__JEST__">__JEST__</button>
            </div>
            <div class="${CLASS__TOOLBOX_SECTION}__group ${CLASS__TOOLBOX_SECTION}__group--split-group">
                <div class="${CLASS__TOOLBOX_SECTION}__group-part">
                    <label class="oltb-label" for="${ID__PREFIX}-stroke-color" data-oltb-i18n="${I18N__BASE}.toolbox.groups.strokeColor.title">__JEST__</label>
                    <div id="${ID__PREFIX}-stroke-color" class="oltb-color-input oltb-color-tippy" data-oltb-color-target="#${ID__PREFIX}-stroke-color" data-oltb-color="__JEST__" tabindex="0">
                        <div class="oltb-color-input__inner" style="background-color: #000000;"></div>
                    </div>
                </div>
                <div class="${CLASS__TOOLBOX_SECTION}__group-part">
                    <label class="oltb-label" for="${ID__PREFIX}-fill-color" data-oltb-i18n="${I18N__BASE}.toolbox.groups.fillColor.title">__JEST__</label>
                    <div id="${ID__PREFIX}-fill-color" class="oltb-color-input oltb-color-tippy" data-oltb-color-target="#${ID__PREFIX}-fill-color" data-oltb-color="__JEST__" tabindex="0">
                        <div class="oltb-color-input__inner" style="background-color: #000000;"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
`);

class MockResponse {
    constructor() {}
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
describe('EditTool', () => {
    const toolInstances = [];
    const initToolInstance = (options) => {
        const tool = new EditTool(options);
        toolInstances.push(tool);
    
        return tool;
    }

    beforeAll(async () => {
        window.Response = MockResponse;
        window.document.body.innerHTML = HTML__MOCK;

        await StateManager.initAsync();
        await SettingsManager.initAsync();
        await SnapManager.initAsync();
        await LayerManager.initAsync();
        await FeatureManager.initAsync();

        SnapManager.setMap(mockMap);
        LayerManager.setMap(mockMap);
        FeatureManager.setMap(mockMap);
    });

    beforeEach(() => {
        Element.prototype.scrollIntoView = jest.fn();
        
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getToolboxElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getToastElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(EditTool.prototype, 'getMap').mockImplementation(() => {
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
        expect(tool).toBeInstanceOf(EditTool);
        expect(tool.getName()).toBe(FILENAME);
        expect(tool.options).toStrictEqual({
            hitTolerance: 5,
            onInitiated: undefined,
            onClicked: undefined,
            onBrowserStateCleared: undefined,
            onStyleChange: undefined,
            onCutFeatures: undefined,
            onCopyFeatures: undefined,
            onPasteFeatures: undefined,
            onShapeOperation: undefined,
            onSelectAdd: undefined,
            onSelectRemove: undefined,
            onModifyStart: undefined,
            onModifyEnd: undefined,
            onTranslateStart: undefined,
            onTranslateEnd: undefined,
            onRemovedFeatures: undefined,
            onError: undefined,
            onSnapped: undefined,
            onUnSnapped: undefined
        });
        expect(jsts.io.OL3Parser).toHaveBeenCalled();
    });

    it('should init the tool with options', () => {
        const options = {onInitiated: () => {}};
        const spyOnOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = initToolInstance(options);

        expect(tool).toBeTruthy();
        expect(spyOnOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', async () => {
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

    it('should toggle the tool using short-cut-key [V]', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        // Note:
        // ESLint don't understand that tool reference is used.
        // eslint-disable-next-line no-unused-vars
        const tool = initToolInstance(options);
        const spyOnActivateTool = jest.spyOn(tool, 'activateTool');
        const spyOnDeactivateTool = jest.spyOn(tool, 'deactivateTool');
        
        expect(hasToolActiveClass(tool)).toBe(false);
        simulateKeyPress('keyup', window, 'V');
        expect(hasToolActiveClass(tool)).toBe(true);
        simulateKeyPress('keyup', window, 'V');
        expect(hasToolActiveClass(tool)).toBe(false);

        expect(spyOnActivateTool).toHaveBeenCalledTimes(1);
        expect(spyOnDeactivateTool).toHaveBeenCalledTimes(1);
        expect(spyOnOnClicked).toHaveBeenCalledTimes(2);
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

    it('should not toggle the tool using incorrect short-cut-key', () => {
        const options = {onClicked: () => {}};
        const spyOnOnClicked = jest.spyOn(options, 'onClicked');

        initToolInstance(options);
        simulateKeyPress('keyup', window, '!');
        expect(spyOnOnClicked).not.toHaveBeenCalled();
    });

    it('should deactivate tool as done by ToolManager', () => {
        const tool = initToolInstance();
        const spyOnRemoveActiveTool = jest.spyOn(ToolManager, 'removeActiveTool');

        tool.activateTool();
        tool.deselectTool();

        expect(spyOnRemoveActiveTool).toHaveBeenCalled();
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

    it('should check if intersection mode is enabled', () => {
        const options = {onSnapped: () => {}, onUnSnapped: () => {}};
        const spyOnOnSnapped = jest.spyOn(options, 'onSnapped');
        const spyOnOnUnSnapped = jest.spyOn(options, 'onUnSnapped');
        const spyOnIsSnapLine = jest.spyOn(SnapManager, 'isSnapLine').mockImplementation(() => {
            return false;
        });

        const tool = initToolInstance(options);
        SnapManager.addSnap(tool);
        
        const interaction = SnapManager.getInteraction();
        interaction.dispatchEvent('snap');
        interaction.dispatchEvent('unsnap');

        expect(spyOnIsSnapLine).toHaveBeenCalledTimes(2);
        expect(spyOnOnSnapped).toHaveBeenCalledTimes(1);
        expect(spyOnOnUnSnapped).toHaveBeenCalledTimes(1);
    });

    it('should verify that two shapes', () => {
        const tool = initToolInstance();
        const zero = [];
        const one = [{}];
        const two = [{}, {}];
        const three = [{}, {}, {}];

        expect(tool.isTwoAndOnlyTwoShapes(zero)).toBe(false);
        expect(tool.isTwoAndOnlyTwoShapes(one)).toBe(false);
        expect(tool.isTwoAndOnlyTwoShapes(two)).toBe(true);
        expect(tool.isTwoAndOnlyTwoShapes(three)).toBe(false);
    });

    it('should verify mouse only settings vector shapes', () => {
        const tool = initToolInstance();
        expect(tool.useMouseOnlyToEditVectorShapes()).toBe(true);
    });

    it('should ask user to delete feature', () => {
        const tool = initToolInstance();
        const spyOnDeleteFeatures = jest.spyOn(tool, 'doDeleteFeatures').mockImplementation(() => {
            return;
        });

        const options = {
            lon: 0,
            lat: 0
        };

        const marker = FeatureManager.generateIconMarker(options);
        const dialog = tool.askToDeleteFeatures([marker]);
        const buttons = dialog.buttons;
        const confirmButton = buttons[1];
        confirmButton.click();

        expect(spyOnDeleteFeatures).toHaveBeenCalledTimes(1);
    });

    it('should ask user to rotate features but fail due to invalid chars', () => {
        const tool = initToolInstance();
        const spyOnLogError = jest.spyOn(LogManager, 'logError');
        const spyOnToastError = jest.spyOn(Toast, 'error');

        const options = {
            lon: 0,
            lat: 0
        };

        const marker = FeatureManager.generateIconMarker(options);
        const dialog = tool.askToRotateSelectedFeatures([marker], '0-jest');
        const buttons = dialog.buttons;
        const confirmButton = buttons[1];
        confirmButton.click();

        expect(spyOnLogError).toHaveBeenCalled();
        expect(spyOnToastError).toHaveBeenCalledWith({
            i18nKey: `${I18N__BASE}.toasts.errors.invalidValue`
        });
    });

    it('should ask user to rotate features', () => {
        const tool = initToolInstance();
        const spyOnDoRotateFeatures = jest.spyOn(tool, 'doRotateFeatures');

        const options = {
            lon: 0,
            lat: 0
        };

        const marker = FeatureManager.generateIconMarker(options);
        const dialog = tool.askToRotateSelectedFeatures([marker]);
        const buttons = dialog.buttons;
        const confirmButton = buttons[1];
        confirmButton.click();

        expect(spyOnDoRotateFeatures).toHaveBeenNthCalledWith(1, [marker], '0');
    });

    it('should show data-modal with info about feature', () => {
        const tool = initToolInstance();
        const geometry = new Polygon([[
            [-263258.05497133266,7259891.741364763],
            [-263210.0832504495,7259891.741364763],
            [-263210.0832504495,7259924.362134964],
            [-263258.05497133266,7259924.362134964],
            [-263258.05497133266,7259891.741364763]
        ]]);

        const feature = new Feature({
            geometry: geometry
        });

        const modal = tool.doShowFeatureInfo(feature);
        expect(modal.options.data.coordinates.replace(/\s+/g, ' ').trim()).toEqual("<pre><code>[ [ -263258.05497133266, 7259891.741364763 ], [ -263210.0832504495, 7259891.741364763 ], [ -263210.0832504495, 7259924.362134964 ], [ -263258.05497133266, 7259924.362134964 ], [ -263258.05497133266, 7259891.741364763 ] ]</code></pre>");
    });

    // TODO:
    // At this point it is hard to simulate the events due to missing feature
    // TODO:
    // Add SelectAdd, SelectRemove on feature collection
    it('should trigger drawing-related-events', () => {
        const options = {
            onModifyStart: () => {},
            onModifyEnd: () => {},
            onTranslateStart: () => {},
            onTranslateEnd: () => {}
        };

        const spyOnOnModifyStart = jest.spyOn(options, 'onModifyStart');
        const spyOnOnModifyEnd = jest.spyOn(options, 'onModifyEnd');
        const spyOnOnTranslateStart = jest.spyOn(options, 'onTranslateStart');
        const spyOnOntranslateEnd = jest.spyOn(options, 'onTranslateEnd');

        const tool = initToolInstance(options);

        tool.interactionModify.dispatchEvent('modifystart');
        tool.interactionModify.dispatchEvent('modifyend');
        tool.interactionTranslate.dispatchEvent('translatestart');
        tool.interactionTranslate.dispatchEvent('translateend');
        
        expect(spyOnOnModifyStart).toHaveBeenCalledTimes(1);
        expect(spyOnOnModifyEnd).toHaveBeenCalledTimes(1);
        expect(spyOnOnTranslateStart).toHaveBeenCalledTimes(1);
        expect(spyOnOntranslateEnd).toHaveBeenCalledTimes(1);
    });

    it('should cut, copy, paste vector-features', () => {
        const options = {
            onCutFeatures: () => {},
            onCopyFeatures: () => {},
            onPasteFeatures: () => {}
        };

        // Note:
        // The setMap function is called by OL somewhere in the chain and causes an error
        // TODO: 
        // Try and find why this throws an error 'target.addEventListener is not a function'
        jest.spyOn(Overlay.prototype, 'setMap').mockImplementation(() => {
            return;
        });

        const spyOnOnCutFeatures = jest.spyOn(options, 'onCutFeatures');
        const spyOnOnCopyFeatures = jest.spyOn(options, 'onCopyFeatures');
        const spyOnOnPasteFeatures = jest.spyOn(options, 'onPasteFeatures');
        const spyOnToastInfo = jest.spyOn(Toast, 'info');

        const geometry = new Polygon([[
            [-263258.05497133266,7259891.741364763],
            [-263210.0832504495,7259891.741364763],
            [-263210.0832504495,7259924.362134964],
            [-263258.05497133266,7259924.362134964],
            [-263258.05497133266,7259891.741364763]
        ]]);

        const featureOne = new Feature({
            geometry: geometry,
            oltb: {
                type: 'drawing'
            }
        });

        const featureTwo = new Feature({
            geometry: geometry,
            oltb: {
                type: 'measurement'
            }
        });

        FeatureManager.applyMeasurementProperties(featureTwo);

        const features = [featureOne, featureTwo];
        const tool = initToolInstance(options);

        tool.doCopyFeatures(features);
        expect(tool.featureClipboard.length).toBe(2);
        expect(spyOnOnCopyFeatures).toHaveBeenCalledTimes(1);
        expect(spyOnToastInfo).toHaveBeenCalledWith({
            prefix: 2,
            i18nKey: `${I18N__BASE}.toasts.infos.copiedFeatures`,
            autoremove: true
        });

        tool.doPasteFeatures();
        expect(tool.featureClipboard.length).toBe(0);
        expect(spyOnOnPasteFeatures).toHaveBeenCalledTimes(1);
        expect(spyOnToastInfo).toHaveBeenCalledWith({
            prefix: 2,
            i18nKey: `${I18N__BASE}.toasts.infos.pastedFeatures`,
            autoremove: true
        });

        tool.doCutFeatures(features);
        expect(tool.featureClipboard.length).toBe(2);
        expect(spyOnOnCutFeatures).toHaveBeenCalledTimes(1);
        expect(spyOnToastInfo).toHaveBeenCalledWith({
            prefix: 2,
            i18nKey: `${I18N__BASE}.toasts.infos.cutFeatures`,
            autoremove: true
        });
    });

    it('should verify selection interaction', () => {
        const geometry = new Polygon([[
            [-263258.05497133266,7259891.741364763],
            [-263210.0832504495,7259891.741364763],
            [-263210.0832504495,7259924.362134964],
            [-263258.05497133266,7259924.362134964],
            [-263258.05497133266,7259891.741364763]
        ]]);

        const featureOne = new Feature({
            geometry: geometry,
            oltb: {
                type: 'drawing'
            }
        });

        const featureTwo = new Feature({
            geometry: geometry,
            oltb: {
                type: 'drawing'
            }
        });

        const tool = initToolInstance();
        tool.doAddSelectedFeature(featureOne);
        expect(tool.getNumSelectedFeatures()).toBe(1);
        
        tool.doRemoveSelectedFeature(featureOne);
        expect(tool.getNumSelectedFeatures()).toBe(0);

        tool.doAddSelectedFeature(featureOne);
        tool.doAddSelectedFeature(featureTwo);
        expect(tool.getNumSelectedFeatures()).toBe(2);

        tool.doClearSelectedFeatures();
        expect(tool.getNumSelectedFeatures()).toBe(0);
    });

    it('should convert vector-features from drawing to measurement to drawing', () => {
        const geometry = new Polygon([[
            [-263258.05497133266,7259891.741364763],
            [-263210.0832504495,7259891.741364763],
            [-263210.0832504495,7259924.362134964],
            [-263258.05497133266,7259924.362134964],
            [-263258.05497133266,7259891.741364763]
        ]]);

        const feature = new Feature({
            geometry: geometry,
            oltb: {
                type: 'drawing'
            }
        });

        const features = [feature];
        const tool = initToolInstance();
        expect(tool.getNumSelectedFeatures()).toBe(0);

        tool.doAddSelectedFeature(feature);
        expect(tool.getNumSelectedFeatures()).toBe(1);

        tool.doConvertFeatures(features, {
            to: {
                text: 'Measurement', 
                value: 'measurement'
            }
        });

        expect(FeatureManager.getType(feature)).toBe('measurement');
        expect(FeatureManager.getTooltip(feature)).toBeTruthy();

        tool.doConvertFeatures(features, {
            to: {
                text: 'Drawing', 
                value: 'drawing'
            }
        });

        expect(FeatureManager.getType(feature)).toBe('drawing');
        expect(FeatureManager.getTooltip(feature)).toBeUndefined();
    });
});