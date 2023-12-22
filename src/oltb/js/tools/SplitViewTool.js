import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';
import { Toast } from '../common/Toast';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { unByKey } from 'ol/Observable';
import { LogManager } from '../managers/LogManager';
import { LayerManager } from '../managers/LayerManager';
import { StateManager } from '../managers/StateManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ConfigManager } from '../managers/ConfigManager';
import { getRenderPixel } from 'ol/render';
import { ElementManager } from '../managers/ElementManager';
import { eventDispatcher } from '../helpers/browser/EventDispatcher';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { TranslationManager } from '../managers/TranslationManager';

const FILENAME = 'tools/SplitViewTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const CLASS_TOOLBOX_SECTION = 'oltb-toolbox-section';
const CLASS_SLIDER = 'oltb-slider';
const CLASS_TOGGLEABLE = 'oltb-toggleable';
const ID_PREFIX = 'oltb-split-view';
const INDEX_DEFAULT_RIGHT = 0;
const INDEX_DEFAULT_LEFT = 1;
const I18N_BASE = 'tools.splitViewTool';
const I18N_BASE_COMMON = 'commons';

const DefaultOptions = Object.freeze({
    onInitiated: undefined,
    onClicked: undefined,
    onBrowserStateCleared: undefined
});

const LocalStorageNodeName = LocalStorageKeys.splitViewTool;
const LocalStorageDefaults = Object.freeze({
    isActive: false,
    isCollapsed: false
});

/**
 * About:
 * Review two overlapping Map layers side by side
 * 
 * Description:
 * Compares two different Map images and enables staggered overlap.
 */
class SplitViewTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.arrowsExpandVertical.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N_BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.splitViewTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.splitViewTool})`,
                'data-oltb-i18n': `${I18N_BASE}.title`
            },
            listeners: {
                'click': this.onClickTool.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);
        
        this.button = button;
        this.isActive = false;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );
        
        this.initToolboxHTML();
        this.initMapHTML();
        this.uiRefToolboxSection = document.querySelector(`#${ID_PREFIX}-toolbox`);
        this.initToggleables();

        this.uiRefLeftSource = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-left-source`);
        this.uiRefLeftSource.addEventListener(Events.browser.change, this.updateTool.bind(this));

        this.uiRefRightSource = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-right-source`);
        this.uiRefRightSource.addEventListener(Events.browser.change, this.updateTool.bind(this));

        const uiRefSwapSidesButton = this.uiRefToolboxSection.querySelector(`#${ID_PREFIX}-swap-button`);
        uiRefSwapSidesButton.addEventListener(Events.browser.click, (event) => {
            this.onSwapLayerSides();
        });
        
        this.uiRefSplitViewSlider = ElementManager.getMapElement().querySelector(`#${ID_PREFIX}-slider`);
        this.uiRefSplitViewSlider.addEventListener(Events.browser.input, this.onSliderInput.bind(this));

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(Events.custom.ready, this.onOLTBReady.bind(this));
        window.addEventListener(Events.custom.mapLayerAdded, this.onWindowMapLayerAdded.bind(this));
        window.addEventListener(Events.custom.mapLayerRemoved, this.onWindowMapLayerRemoved.bind(this));
        window.addEventListener(Events.custom.browserStateCleared, this.onWindowBrowserStateCleared.bind(this));

        // Note: Consumer callback
        if(this.options.onInitiated instanceof Function) {
            this.options.onInitiated();
        }
    }

    getName() {
        return FILENAME;
    }

    // -------------------------------------------------------------------
    // # Section: Init Helpers
    // -------------------------------------------------------------------

    initToolboxHTML() {
        const i18n = TranslationManager.get(`${I18N_BASE}.toolbox`);
        const i18nCommon = TranslationManager.get(`${I18N_BASE_COMMON}.titles`);

        ElementManager.getToolboxElement().insertAdjacentHTML('beforeend', `
            <div id="${ID_PREFIX}-toolbox" class="${CLASS_TOOLBOX_SECTION}">
                <div class="${CLASS_TOOLBOX_SECTION}__header oltb-toggleable" data-oltb-toggleable-target="${ID_PREFIX}-toolbox-collapsed">
                    <h4 class="${CLASS_TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N_BASE}.toolbox.titles.splitView">${i18n.titles.splitView}</h4>
                    <span class="${CLASS_TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N_BASE_COMMON}.titles.toggleSection" title="${i18nCommon.toggleSection}"></span>
                </div>
                <div class="${CLASS_TOOLBOX_SECTION}__groups" id="${ID_PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.isCollapsed ? 'none' : 'block'}">
                    <div class="${CLASS_TOOLBOX_SECTION}__group">
                        <label class="oltb-label" for="${ID_PREFIX}-left-source" data-oltb-i18n="${I18N_BASE}.toolbox.groups.leftSide.title">${i18n.groups.leftSide.title}</label>
                        <select id="${ID_PREFIX}-left-source" class="oltb-select"></select>
                    </div>
                    <div class="${CLASS_TOOLBOX_SECTION}__group">
                        <label class="oltb-label" for="${ID_PREFIX}-source" data-oltb-i18n="${I18N_BASE}.toolbox.groups.rightSide.title">${i18n.groups.rightSide.title}</label>
                        <select id="${ID_PREFIX}-right-source" class="oltb-select"></select>
                    </div>
                    <div class="${CLASS_TOOLBOX_SECTION}__group">
                        <button type="button" id="${ID_PREFIX}-swap-button" class="oltb-btn oltb-btn--green-mid oltb-w-100" data-oltb-i18n="${I18N_BASE}.toolbox.groups.swapSides.swap">${i18n.groups.swapSides.swap}</button>
                    </div>
                </div>
            </div>
        `);
    }

    initMapHTML() {
        ElementManager.getMapElement().insertAdjacentHTML('beforeend', `
            <input type="range" min="0" max="100" value="50" class="oltb-slider" id="${ID_PREFIX}-slider">
        `);
    }

    initToggleables() {
        this.uiRefToolboxSection.querySelectorAll(`.${CLASS_TOGGLEABLE}`).forEach((toggle) => {
            toggle.addEventListener(Events.browser.click, this.onToggleToolbox.bind(this, toggle));
        });
    }

    // -------------------------------------------------------------------
    // # Section: Tool Control
    // -------------------------------------------------------------------

    onClickTool(event) {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');

        if(LayerManager.getMapLayerSize() <= 1) {
            Toast.info({
                i18nKey: `${I18N_BASE}.toasts.infos.strictOneLayer`
            });
            
            return;
        }

        if(this.isActive) {
            this.deActivateTool();
        }else {
            this.activateTool();
        }

        // Note: Consumer callback
        if(this.options.onClicked instanceof Function) {
            this.options.onClicked();
        }
    }

    activateTool() {
        // Note: The active switch must be enabled first
        // Events can be triggered by other tools that should not be handled if the tools is not in use 
        this.isActive = true;

        this.setDefaultSelectedIndexes().doDispatchChangeEvent();

        // Some layer related error, missing or rendering
        // Triggered by eventDispatcher change-event
        if(this.layerLoadingError) {
            this.isActive = false;
            return;
        }
        
        this.uiRefToolboxSection.classList.add(`${CLASS_TOOLBOX_SECTION}--show`);
        this.uiRefSplitViewSlider.classList.add(`${CLASS_SLIDER}--show`);
        this.button.classList.add(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.isActive = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deActivateTool() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        // Remove previosly added listeners
        unByKey(this.onPreRenderListener);
        unByKey(this.onPostRenderListener);
        
        // Remove the ol-split-view-layers from the map
        LayerManager.getMapLayers().forEach((layerWrapper) => {
            map.removeLayer(layerWrapper.getLayer());
        });

        // Add back all the original layers to the map
        LayerManager.getMapLayers().forEach((layerWrapper) => {
            map.addLayer(layerWrapper.getLayer());
        });

        LayerManager.setTopMapLayerAsOnlyVisible();

        this.isActive = false;
        this.uiRefToolboxSection.classList.remove(`${CLASS_TOOLBOX_SECTION}--show`);
        this.uiRefSplitViewSlider.classList.remove(`${CLASS_SLIDER}--show`);
        this.button.classList.remove(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.isActive = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    updateTool() {
        this.doUpdateTool(
            this.uiRefLeftSource.value, 
            this.uiRefRightSource.value
        );
    }

    // -------------------------------------------------------------------
    // # Section: Browser Events
    // -------------------------------------------------------------------

    onOLTBReady(event) {
        if(this.localStorage.isActive) {
            this.activateTool();
        }
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.splitViewTool)) {
            this.onClickTool(event);
        }
    }
    
    onWindowBrowserStateCleared() {
        this.doClearState();

        if(this.isActive) {
            this.deActivateTool();
        }

        // Note: Consumer callback
        if(this.options.onBrowserStateCleared instanceof Function) {
            this.options.onBrowserStateCleared();
        }
    }

    onWindowMapLayerAdded(event) {
        this.doMapLayerAdded(event);
    }

    onWindowMapLayerRemoved(event) {
        this.doMapLayerRemoved(event);
        this.doDispatchChangeEvent();
    }

    // -------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    // -------------------------------------------------------------------
    
    onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
    
        this.doToggleToolboxSection(targetName);
    }

    onSwapLayerSides() {
        this.doSwapLayerSides();
        this.doDispatchChangeEvent();
    }

    onSliderInput(event) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        map.render();
    }

    onPreRender(event) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        this.doPreRender(event, map);
    }

    onPostRender(event) {
        event.context.restore();
    }

    // -------------------------------------------------------------------
    // # Getters and Setters
    // -------------------------------------------------------------------

    setDefaultSelectedIndexes() {
        this.uiRefLeftSource.selectedIndex = String(INDEX_DEFAULT_LEFT);
        this.uiRefRightSource.selectedIndex = String(INDEX_DEFAULT_RIGHT);

        return this;
    }
    
    setLoadingError() {
        this.layerLoadingError = true;
        
        LogManager.logError(FILENAME, 'setLoadingError', {
            message: 'One or both of the layers could not be loaded'
        });
        
        Toast.error({
            i18nKey: `${I18N_BASE}.toasts.errors.layerFailedToLoad`
        });
    }

    // -------------------------------------------------------------------
    // # Section: Tool DoActions
    // -------------------------------------------------------------------

    doMapLayerRemoved(event) {
        const layerWrapper = event.detail.layerWrapper;

        this.uiRefLeftSource.childNodes.forEach((option) => {
            if(option.value === layerWrapper.getId()) {
                DOM.removeElement(option);
            }
        });

        this.uiRefRightSource.childNodes.forEach((option) => {
            if(option.value === layerWrapper.getId()) {
                DOM.removeElement(option);
            }
        });
    } 

    doMapLayerAdded(event) {
        const layerWrapper = event.detail.layerWrapper;

        const leftOption = DOM.createElement({
            element: 'option',
            text: layerWrapper.getName(),
            value: layerWrapper.getId().toString()
        });

        const rightOption = DOM.createElement({
            element: 'option',
            text: layerWrapper.getName(),
            value: layerWrapper.getId().toString()
        });

        DOM.appendChildren(this.uiRefLeftSource, [
            leftOption
        ]);

        DOM.appendChildren(this.uiRefRightSource, [
            rightOption
        ]);
    }

    doToggleToolboxSection(targetName) {
        const targetNode = document.getElementById(targetName);
        const duration = ConfigManager.getConfig().animationDuration.fast;

        targetNode?.slideToggle(duration, (collapsed) => {
            this.localStorage.isCollapsed = collapsed;
            StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
        });
    }

    doClearState() {
        this.localStorage = _.cloneDeep(LocalStorageDefaults);
        StateManager.setStateObject(LocalStorageNodeName, LocalStorageDefaults);
    }

    doPreRender(event, map) {
        const context = event.context;
        const mapSize = map.getSize();

        // Calculate offset for the handlebar. 
        // The range slider is not perfectly linear towards the edges. 
        const halfHandleWidth = ConfigManager.getConfig().browser.rem;
        const sliderWidth = this.uiRefSplitViewSlider.offsetWidth;
        const sliderCenter = sliderWidth / 2;
        const percentOfRange = (this.uiRefSplitViewSlider.value / (this.uiRefSplitViewSlider.max - this.uiRefSplitViewSlider.min));
        const valuePxPosition = percentOfRange * sliderWidth;
        const distFromCenter = valuePxPosition - sliderCenter;
        const percentDistFromCenter = distFromCenter / sliderCenter;
        const offset = percentDistFromCenter * halfHandleWidth;

        const mapWidth = mapSize[0];
        const mapHeight = mapSize[1];

        // Displaying two maps next to each other.
        const width = mapWidth * (this.uiRefSplitViewSlider.value / this.uiRefSplitViewSlider.max) - offset;
        const tl = getRenderPixel(event, [width, 0]);
        const tr = getRenderPixel(event, [mapWidth, 0]);
        const bl = getRenderPixel(event, [width, mapHeight]);
        const br = getRenderPixel(event, [mapWidth, mapHeight]);
    
        context.save();
        context.beginPath();
        context.moveTo(tl[0], tl[1]);
        context.lineTo(bl[0], bl[1]);
        context.lineTo(br[0], br[1]);
        context.lineTo(tr[0], tr[1]);
        context.closePath();
        context.clip();
    }

    doSwapLayerSides() {
        const currentRightId = this.uiRefRightSource.value;

        this.uiRefRightSource.value = this.uiRefLeftSource.value;
        this.uiRefLeftSource.value = currentRightId;
    }

    doDispatchChangeEvent() {
        eventDispatcher([
            this.uiRefLeftSource, 
            this.uiRefRightSource
        ], Events.browser.change);
    }

    doAddMapLayer(layer) {
        layer.setVisible(true);
        this.getMap().addLayer(layer);
    }

    doRemoveMapLayer(layer) {
        layer.setVisible(false);
        this.getMap().removeLayer(layer);
    }

    doUpdateTool(leftId, rightId) {
        // Note: Block access for events that are captued when the tool is not activated
        // Example removing a layer in the LayerTool
        if(!this.isActive) {
            return;
        }

        const map = this.getMap();
        if(!map) {
            return;
        }

        // Remove previously added listeners
        unByKey(this.onPreRenderListener);
        unByKey(this.onPostRenderListener);

        // Remove current layers from the map
        // Only the left and right layer will be added later
        LayerManager.getMapLayers().forEach((layerWrapper) => {
            this.doRemoveMapLayer(layerWrapper.getLayer());
        });

        // Get layers to view in split-mode
        const leftLayerWrapper = LayerManager.getMapLayerById(leftId);
        const rightLayerWrapper = LayerManager.getMapLayerById(rightId);

        // This should not happen, but just in case
        if(!leftLayerWrapper || !rightLayerWrapper) {
            this.setLoadingError();

            return;
        }

        const leftLayer = leftLayerWrapper.getLayer();
        const rightLayer = rightLayerWrapper.getLayer();

        this.doAddMapLayer(leftLayer);

        // Note: Only render right side layer if it is different from the left layer
        if(leftId !== rightId) {
            this.doAddMapLayer(rightLayer);

            // Attach listeners to the right layer. 
            // Pre/Post render will only show part of the right map
            this.onPreRenderListener = rightLayer.on(Events.openLayers.preRender, this.onPreRender.bind(this));
            this.onPostRenderListener = rightLayer.on(Events.openLayers.postRender, this.onPostRender.bind(this));
        }

        map.render();
    }
}

export { SplitViewTool };