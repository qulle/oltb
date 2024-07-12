import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { LayerTool } from './layer-tool';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

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
    //--------------------------------------------------------------------
    // # Section: Setup
    //--------------------------------------------------------------------
    beforeAll(async () => {
        Element.prototype.scrollIntoView = jest.fn();
        window.document.body.innerHTML = HTML__MOCK;
        
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(ElementManager, 'getToolboxElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        await StateManager.initAsync();
    });

    //--------------------------------------------------------------------
    // # Section: Jesting
    //--------------------------------------------------------------------
    it('should init the tool', () => {
        const tool = new LayerTool();

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
        const spyOnInitiated = jest.spyOn(options, 'onInitiated');
        const tool = new LayerTool(options);

        expect(tool).toBeTruthy();
        expect(spyOnInitiated).toHaveBeenCalledTimes(1);
    });

    it('should toggle the tool', () => {
        const options = {onClicked: () => {}};
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        const spyActivate = jest.spyOn(LayerTool.prototype, 'activateTool');
        const spyDeactivate = jest.spyOn(LayerTool.prototype, 'deactivateTool');

        const tool = new LayerTool(options);
        
        expect(hasToolActiveClass(tool)).toBe(false);
        tool.onClickTool();
        expect(hasToolActiveClass(tool)).toBe(true);
        tool.onClickTool();
        expect(hasToolActiveClass(tool)).toBe(false);

        expect(spyActivate).toHaveBeenCalledTimes(1);
        expect(spyDeactivate).toHaveBeenCalledTimes(1);
        expect(spyOnClicked).toHaveBeenCalledTimes(2);
    });
});