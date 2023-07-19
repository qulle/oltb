import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';
import { Toast } from '../common/Toast';
import { Config } from '../core/Config';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { unByKey } from 'ol/Observable';
import { LogManager } from '../core/managers/LogManager';
import { LayerManager } from '../core/managers/LayerManager';
import { StateManager } from '../core/managers/StateManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { getRenderPixel } from 'ol/render';
import { ElementManager } from '../core/managers/ElementManager';
import { eventDispatcher } from '../helpers/browser/EventDispatcher';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';

const FILENAME = 'tools/SplitViewTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const CLASS_TOOLBOX_SECTION = 'oltb-toolbox-section';
const CLASS_SLIDER = 'oltb-slider';
const ID_PREFIX = 'oltb-split-view';

const DefaultOptions = Object.freeze({
    onClick: undefined
});

const LocalStorageNodeName = LocalStorageKeys.splitViewTool;
const LocalStorageDefaults = Object.freeze({
    active: false,
    collapsed: false
});

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

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `Split view (${ShortcutKeys.splitViewTool})`
            },
            listeners: {
                'click': this.onClickTool.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);
        
        this.button = button;
        this.active = false;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        const uiRefMapElement = ElementManager.getMapElement();
        const uiRefToolboxElement = ElementManager.getToolboxElement();
        uiRefToolboxElement.insertAdjacentHTML('beforeend', `
            <div id="${ID_PREFIX}-toolbox" class="${CLASS_TOOLBOX_SECTION}">
                <div class="${CLASS_TOOLBOX_SECTION}__header">
                    <h4 class="${CLASS_TOOLBOX_SECTION}__title oltb-toggleable" data-oltb-toggleable-target="${ID_PREFIX}-toolbox-collapsed">
                        Split view
                        <span class="${CLASS_TOOLBOX_SECTION}__icon oltb-tippy" title="Toggle section"></span>
                    </h4>
                </div>
                <div class="${CLASS_TOOLBOX_SECTION}__groups" id="${ID_PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.collapsed ? 'none' : 'block'}">
                    <div class="${CLASS_TOOLBOX_SECTION}__group">
                        <label class="oltb-label" for="${ID_PREFIX}-left-src">Left side</label>
                        <select id="${ID_PREFIX}-left-src" class="oltb-select"></select>
                    </div>
                    <div class="${CLASS_TOOLBOX_SECTION}__group">
                        <label class="oltb-label" for="${ID_PREFIX}-src">Right side</label>
                        <select id="${ID_PREFIX}-right-src" class="oltb-select"></select>
                    </div>
                    <div class="${CLASS_TOOLBOX_SECTION}__group">
                        <button type="button" id="${ID_PREFIX}-swap-button" class="oltb-btn oltb-btn--green-mid oltb-w-100">Swap sides</button>
                    </div>
                </div>
            </div>
        `);

        uiRefMapElement.insertAdjacentHTML('beforeend', `
            <input type="range" min="0" max="100" value="50" class="oltb-slider" id="${ID_PREFIX}-slider">
        `);

        this.uiRefSplitViewToolbox = document.querySelector(`#${ID_PREFIX}-toolbox`);

        this.uiRefLeftSideSrc = this.uiRefSplitViewToolbox.querySelector(`#${ID_PREFIX}-left-src`);
        this.uiRefLeftSideSrc.addEventListener(Events.browser.change, this.updateTool.bind(this));

        this.uiRefRightSideSrc = this.uiRefSplitViewToolbox.querySelector(`#${ID_PREFIX}-right-src`);
        this.uiRefRightSideSrc.addEventListener(Events.browser.change, this.updateTool.bind(this));

        this.uiRefSplitViewToolbox.querySelectorAll('.oltb-toggleable').forEach((toggle) => {
            toggle.addEventListener(Events.browser.click, this.onToggleToolbox.bind(this, toggle));
        });

        const uiRefSwapSidesButton = this.uiRefSplitViewToolbox.querySelector(`#${ID_PREFIX}-swap-button`);
        uiRefSwapSidesButton.addEventListener(Events.browser.click, (event) => {
            this.swapSides();
        });
        
        this.uiRefSplitViewSlider = uiRefMapElement.querySelector(`#${ID_PREFIX}-slider`);
        this.uiRefSplitViewSlider.addEventListener(Events.browser.input, this.onSliderInput.bind(this));

        window.addEventListener(Events.custom.mapLayerAdded, this.onWindowMapLayerAdded.bind(this));
        window.addEventListener(Events.custom.mapLayerRemoved, this.onWindowMapLayerRemoved.bind(this));
        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(Events.custom.settingsCleared, this.onWindowSettingsCleared.bind(this));
        window.addEventListener(Events.browser.contentLoaded, this.onDOMContentLoaded.bind(this));
    }

    onSliderInput(event) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        map.render();
    }

    onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        const targetNode = document.getElementById(targetName);
        
        targetNode?.slideToggle(Config.animationDuration.fast, (collapsed) => {
            this.localStorage.collapsed = collapsed;
            StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
        });
    }

    onDOMContentLoaded() {
        if(this.localStorage.active) {
            this.activateTool();
        }
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.splitViewTool)) {
            this.onClickTool(event);
        }
    }
    
    onWindowSettingsCleared() {
        this.localStorage = _.cloneDeep(LocalStorageDefaults);
    }

    onWindowMapLayerAdded(event) {
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

        DOM.appendChildren(this.uiRefLeftSideSrc, [
            leftOption
        ]);

        DOM.appendChildren(this.uiRefRightSideSrc, [
            rightOption
        ]);
    }

    onWindowMapLayerRemoved(event) {
        const layerWrapper = event.detail.layerWrapper;

        this.uiRefLeftSideSrc.childNodes.forEach((option) => {
            if(option.value === layerWrapper.getId()) {
                DOM.removeElement(option);
            }
        });

        this.uiRefRightSideSrc.childNodes.forEach((option) => {
            if(option.value === layerWrapper.getId()) {
                DOM.removeElement(option);
            }
        });

        this.dispatchChangeEvent();
    }

    updateTool() {
        this.sourceChange(
            this.uiRefLeftSideSrc.value, 
            this.uiRefRightSideSrc.value
        );
    }

    onClickTool() {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');

        // Note: Consumer callback
        if(this.options.onClick instanceof Function) {
            this.options.onClick();
        }

        if(LayerManager.getMapLayerSize() <= 1) {
            Toast.info({
                title: 'Tip',
                message: 'You must have more then one layer'
            });
            
            return;
        }

        if(this.active) {
            this.deActivateTool();
        }else {
            this.activateTool();
        }
    }

    setDefaultSelectedIndexes() {
        this.uiRefRightSideSrc.selectedIndex = '0';
        this.uiRefRightSideSrc.selectedIndex = '1';

        return this;
    }

    dispatchChangeEvent() {
        eventDispatcher([
            this.uiRefLeftSideSrc, 
            this.uiRefRightSideSrc
        ], Events.browser.change);
    }

    activateTool() {
        // The active switch must be enabled first
        // Events can be triggered by other tools that should not be handled if the tools is not in use 
        this.active = true;

        this.setDefaultSelectedIndexes().dispatchChangeEvent();

        // Some layer related error, missing or rendering
        // Triggered by eventDispatcher change-event
        if(this.layerLoadingError) {
            this.active = false;
            return;
        }
        
        this.uiRefSplitViewToolbox.classList.add(`${CLASS_TOOLBOX_SECTION}--show`);
        this.uiRefSplitViewSlider.classList.add(`${CLASS_SLIDER}--show`);
        this.button.classList.add(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.active = true;
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

        // Set first layer as the only one visible
        LayerManager.setTopMapLayerAsOnlyVisible();

        this.active = false;
        this.uiRefSplitViewToolbox.classList.remove(`${CLASS_TOOLBOX_SECTION}--show`);
        this.uiRefSplitViewSlider.classList.remove(`${CLASS_SLIDER}--show`);
        this.button.classList.remove(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.active = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    swapSides() {
        const currentRightId = this.uiRefRightSideSrc.value;

        this.uiRefRightSideSrc.value = this.uiRefLeftSideSrc.value;
        this.uiRefLeftSideSrc.value = currentRightId;

        this.dispatchChangeEvent();
    }

    setLoadingError() {
        this.layerLoadingError = true;

        const errorMessage = 'One or both of the layers could not be loaded';
        LogManager.logError(FILENAME, 'setLoadingError', errorMessage);

        Toast.error({
            title: 'Error',
            message: errorMessage
        });
    }

    addMapLayer(layer) {
        layer.setVisible(true);
        this.getMap().addLayer(layer);
    }

    removeMapLayer(layer) {
        layer.setVisible(false);
        this.getMap().removeLayer(layer);
    }

    sourceChange(leftSideSrcId, rightSideSrcId) {
        // Block access for events that are captued when the tool is not activated
        // Example removing a layer in the LayerTool
        if(!this.active) {
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
            this.removeMapLayer(layerWrapper.getLayer());
        });

        // Get layers to view in split-mode
        const leftSideLayerWrapper = LayerManager.getMapLayerById(leftSideSrcId);
        const rightSideLayerWrapper = LayerManager.getMapLayerById(rightSideSrcId);

        // This should not happen, but just in case
        if(!leftSideLayerWrapper || !rightSideLayerWrapper) {
            return this.setLoadingError();
        }

        const leftSideLayer = leftSideLayerWrapper.getLayer();
        const rightSideLayer = rightSideLayerWrapper.getLayer();

        // Left layer config
        this.addMapLayer(leftSideLayer);

         // Right layer config, only if different source than left side
        if(leftSideSrcId !== rightSideSrcId) {
            this.addMapLayer(rightSideLayer);

            // Attach listeners to the right layer. 
            // Pre/Post render will only show part of the right map
            this.onPreRenderListener = rightSideLayer.on(Events.openLayers.preRender, this.onPreRender.bind(this));
            this.onPostRenderListener = rightSideLayer.on(Events.openLayers.postRender, this.onPostRender.bind(this));
        }

        map.render();
    }

    onPreRender(event) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        const context = event.context;
        const mapSize = map.getSize();

        // Calculate offset for the handlebar. 
        // The range slider is not perfectly linear towards the edges. 
        const halfHandleWidth = Config.browser.rem;
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

    onPostRender(event) {
        event.context.restore();
    }
}

export { SplitViewTool };