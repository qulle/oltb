import _ from 'lodash';
import { DOM } from '../../browser-helpers/dom-factory';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { Events } from '../../browser-constants/events';
import { unByKey } from 'ol/Observable';
import { BaseTool } from '../base-tool';
import { LogManager } from '../../toolbar-managers/log-manager/log-manager';
import { LayerManager } from '../../toolbar-managers/layer-manager/layer-manager';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { EventManager } from '../../toolbar-managers/event-manager/event-manager';
import { ShortcutKeys } from '../../browser-constants/shortcut-keys';
import { ConfigManager } from '../../toolbar-managers/config-manager/config-manager';
import { getRenderPixel } from 'ol/render';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { LocalStorageKeys } from '../../browser-constants/local-storage-keys';
import { isShortcutKeyOnly } from '../../browser-helpers/is-shortcut-key-only';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';
import { SvgPaths, getSvgIcon } from '../../ui-icons/get-svg-icon/get-svg-icon';

const FILENAME = 'split-view-tool.js';
const CLASS__TOOL_BUTTON = 'oltb-tool-button';
const CLASS__TOOLBOX_SECTION = 'oltb-toolbox-section';
const CLASS__SLIDER = 'oltb-slider';
const CLASS__TOGGLEABLE = 'oltb-toggleable';
const ID__PREFIX = 'oltb-split-view';
const INDEX__DEFAULT_RIGHT = 0;
const INDEX__DEFAULT_LEFT = 1;
const DEFAULT__MIN_NUM_LAYERS = 2;
const I18N__BASE = 'tools.splitViewTool';
const I18N__BASE_COMMON = 'commons';

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
class SplitViewTool extends BaseTool {
    constructor(options = {}) {
        super({
            filename: FILENAME
        });
        
        const icon = getSvgIcon({
            path: SvgPaths.arrowsExpandVertical.stroked,
            class: `${CLASS__TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N__BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS__TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.splitViewTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.splitViewTool})`,
                'data-oltb-i18n': `${I18N__BASE}.title`
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
        
        this.#initToolboxHTML();
        this.#initMapHTML();
        this.uiRefToolboxSection = window.document.querySelector(`#${ID__PREFIX}-toolbox`);
        this.#initToggleables();

        this.uiRefLeftSource = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-left-source`);
        this.uiRefLeftSource.addEventListener(Events.browser.change, this.updateTool.bind(this));

        this.uiRefRightSource = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-right-source`);
        this.uiRefRightSource.addEventListener(Events.browser.change, this.updateTool.bind(this));

        const uiRefSwapSidesButton = this.uiRefToolboxSection.querySelector(`#${ID__PREFIX}-swap-button`);
        uiRefSwapSidesButton.addEventListener(Events.browser.click, (event) => {
            this.#onSwapLayerSides();
        });
        
        this.uiRefSplitViewSlider = ElementManager.getMapElement().querySelector(`#${ID__PREFIX}-slider`);
        this.uiRefSplitViewSlider.addEventListener(Events.browser.input, this.#onSliderInput.bind(this));

        this.attachGlobalListeners();

        // Note: 
        // @Consumer callback
        if(this.options.onInitiated) {
            this.options.onInitiated();
        }
    }

    attachGlobalListeners() {
        this.onWindowKeyUpBind = this.#onWindowKeyUp.bind(this);
        this.onOLTBReadyBind = this.#onOLTBReady.bind(this);
        this.onWindowMapLayerAddedBind = this.#onWindowMapLayerAdded.bind(this);
        this.onWindowMapLayerRemovedBind = this.#onWindowMapLayerRemoved.bind(this);
        this.onWindowBrowserStateClearedBind = this.#onWindowBrowserStateCleared.bind(this);

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
        window.addEventListener(Events.custom.ready, this.onOLTBReadyBind);
        window.addEventListener(Events.custom.mapLayerAdded, this.onWindowMapLayerAddedBind);
        window.addEventListener(Events.custom.mapLayerRemoved, this.onWindowMapLayerRemovedBind);
        window.addEventListener(Events.custom.browserStateCleared, this.onWindowBrowserStateClearedBind);
    }

    detachGlobalListeners() {
        window.removeEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
        window.removeEventListener(Events.custom.ready, this.onOLTBReadyBind);
        window.removeEventListener(Events.custom.mapLayerAdded, this.onWindowMapLayerAddedBind);
        window.removeEventListener(Events.custom.mapLayerRemoved, this.onWindowMapLayerRemovedBind);
        window.removeEventListener(Events.custom.browserStateCleared, this.onWindowBrowserStateClearedBind);
    }

    //--------------------------------------------------------------------
    // # Section: Overridden
    //--------------------------------------------------------------------
    getName() {
        return super.getName();
    }

    onClickTool(event) {
        super.onClickTool(event);

        if(LayerManager.getMapLayerSize() < DEFAULT__MIN_NUM_LAYERS) {
            Toast.info({
                i18nKey: `${I18N__BASE}.toasts.infos.strictOneLayer`
            });
            
            return;
        }

        if(this.isActive) {
            this.deactivateTool();
        }else {
            this.activateTool();
        }

        // Note: 
        // @Consumer callback
        if(this.options.onClicked) {
            this.options.onClicked();
        }
    }

    //--------------------------------------------------------------------
    // # Section: Init Helpers
    //--------------------------------------------------------------------
    #initToolboxHTML() {
        const i18n = TranslationManager.get(`${I18N__BASE}.toolbox`);
        const i18nCommon = TranslationManager.get(`${I18N__BASE_COMMON}.titles`);

        const html = (`
            <div id="${ID__PREFIX}-toolbox" class="${CLASS__TOOLBOX_SECTION}">
                <div class="${CLASS__TOOLBOX_SECTION}__header oltb-toggleable" data-oltb-toggleable-target="${ID__PREFIX}-toolbox-collapsed">
                    <h4 class="${CLASS__TOOLBOX_SECTION}__title" data-oltb-i18n="${I18N__BASE}.toolbox.titles.splitView">${i18n.titles.splitView}</h4>
                    <span class="${CLASS__TOOLBOX_SECTION}__icon oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.toggleSection" title="${i18nCommon.toggleSection}"></span>
                </div>
                <div class="${CLASS__TOOLBOX_SECTION}__groups" id="${ID__PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.isCollapsed ? 'none' : 'block'}">
                    <div class="${CLASS__TOOLBOX_SECTION}__group ${CLASS__TOOLBOX_SECTION}__group--split-group">
                        <div class="${CLASS__TOOLBOX_SECTION}__group-part">
                            <label class="oltb-label" for="${ID__PREFIX}-left-source" data-oltb-i18n="${I18N__BASE}.toolbox.groups.leftSide.title">${i18n.groups.leftSide.title}</label>
                            <select id="${ID__PREFIX}-left-source" class="oltb-select"></select>
                        </div>
                        <div class="${CLASS__TOOLBOX_SECTION}__group-part" style="flex: none;">
                            <button type="button" id="${ID__PREFIX}-swap-button" class="oltb-btn oltb-btn--green-mid oltb-tippy" title="${i18n.groups.swapSides.swap}">
                                ${getSvgIcon({
                                    path: SvgPaths.arrowLeftRight.stroked,
                                    width: 20,
                                    height: 20,
                                    class: 'oltb-btn__icon'
                                })}
                            </button>
                        </div>
                        <div class="${CLASS__TOOLBOX_SECTION}__group-part">
                            <label class="oltb-label" for="${ID__PREFIX}-source" data-oltb-i18n="${I18N__BASE}.toolbox.groups.rightSide.title">${i18n.groups.rightSide.title}</label>
                            <select id="${ID__PREFIX}-right-source" class="oltb-select"></select>
                        </div>
                    </div>
                </div>
            </div>
        `);

        ElementManager.getToolboxElement().insertAdjacentHTML('beforeend', html);
    }

    #initMapHTML() {
        ElementManager.getMapElement().insertAdjacentHTML('beforeend', `
            <input type="range" min="0" max="100" value="50" class="oltb-slider" id="${ID__PREFIX}-slider">
        `);
    }

    #initToggleables() {
        this.uiRefToolboxSection.querySelectorAll(`.${CLASS__TOGGLEABLE}`).forEach((toggle) => {
            toggle.addEventListener(Events.browser.click, this.#onToggleToolbox.bind(this, toggle));
        });
    }

    //--------------------------------------------------------------------
    // # Section: Tool Control
    //--------------------------------------------------------------------
    activateTool() {
        // Note: 
        // The active switch must be enabled first
        // Events can be triggered by other tools that should not be handled if the tools is not in use 
        this.isActive = true;
        this.setDefaultSelectedIndexes().doDispatchChangeEvent();

        // Note:
        // Some layer related error, missing or rendering
        // Is triggered by eventDispatcher change-event
        if(this.layerLoadingError) {
            this.isActive = false;
            return;
        }
        
        this.uiRefToolboxSection.classList.add(`${CLASS__TOOLBOX_SECTION}--show`);
        this.uiRefSplitViewSlider.classList.add(`${CLASS__SLIDER}--show`);
        this.button.classList.add(`${CLASS__TOOL_BUTTON}--active`);

        this.localStorage.isActive = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);

        this.uiRefToolboxSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'end', 
            inline: 'nearest' 
        });
    }

    deactivateTool() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        // Note:
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

        // Note:
        // This method picks the top-most layer meaning the [0] index
        // In the future make it pix the one with highest Z-index or pick the one active before the tool was activated
        LayerManager.setTopMapLayerAsOnlyVisible();

        this.isActive = false;
        this.uiRefToolboxSection.classList.remove(`${CLASS__TOOLBOX_SECTION}--show`);
        this.uiRefSplitViewSlider.classList.remove(`${CLASS__SLIDER}--show`);
        this.button.classList.remove(`${CLASS__TOOL_BUTTON}--active`);

        this.localStorage.isActive = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    updateTool() {
        this.doUpdateTool(
            this.uiRefLeftSource.value, 
            this.uiRefRightSource.value
        );
    }

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    #onOLTBReady(event) {
        if(this.localStorage.isActive) {
            this.activateTool();
        }
    }

    #onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.splitViewTool)) {
            this.onClickTool(event);
        }
    }
    
    #onWindowBrowserStateCleared() {
        this.doClearState();

        if(this.isActive) {
            this.deactivateTool();
        }

        // Note: 
        // @Consumer callback
        if(this.options.onBrowserStateCleared) {
            this.options.onBrowserStateCleared();
        }
    }

    #onWindowMapLayerAdded(event) {
        this.doMapLayerAdded(event);
    }

    #onWindowMapLayerRemoved(event) {
        this.doMapLayerRemoved(event);
        this.doDispatchChangeEvent();
    }

    //--------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    //--------------------------------------------------------------------
    #onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        this.doToggleToolboxSection(targetName);
    }

    #onSwapLayerSides() {
        this.doSwapLayerSides();
        this.doDispatchChangeEvent();
    }

    #onSliderInput(event) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        map.render();
    }

    #onPreRender(event) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        this.doPreRender(event, map);
    }

    #onPostRender(event) {
        event.context.restore();
    }

    //--------------------------------------------------------------------
    // # Getters and Setters
    //--------------------------------------------------------------------
    setDefaultSelectedIndexes() {
        this.uiRefLeftSource.selectedIndex = String(INDEX__DEFAULT_LEFT);
        this.uiRefRightSource.selectedIndex = String(INDEX__DEFAULT_RIGHT);

        return this;
    }
    
    setLoadingError() {
        this.layerLoadingError = true;
        
        LogManager.logError(FILENAME, 'setLoadingError', {
            message: 'One or both of the layers could not be loaded'
        });
        
        Toast.error({
            i18nKey: `${I18N__BASE}.toasts.errors.layerFailedToLoad`
        });
    }

    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
    doClearState() {
        this.localStorage = _.cloneDeep(LocalStorageDefaults);
        StateManager.setStateObject(LocalStorageNodeName, LocalStorageDefaults);
    }

    doToggleToolboxSection(targetName) {
        const targetNode = window.document.getElementById(targetName);
        const duration = ConfigManager.getConfig().animationDuration.fast;

        targetNode?.slideToggle(duration, (collapsed) => {
            this.localStorage.isCollapsed = collapsed;
            StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
        });
    }

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
        EventManager.dispatchEvent([
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
        // Note: 
        // Block access for events that are captured when the tool is not activated
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

        // Note: 
        // Only render right side layer if it is different from the left layer
        if(leftId !== rightId) {
            this.doAddMapLayer(rightLayer);

            // Attach listeners to the right layer
            // Pre/Post render will only show part of the right map
            this.onPreRenderListener = rightLayer.on(Events.openLayers.preRender, this.#onPreRender.bind(this));
            this.onPostRenderListener = rightLayer.on(Events.openLayers.postRender, this.#onPostRender.bind(this));
        }

        map.render();
    }
}

export { SplitViewTool };