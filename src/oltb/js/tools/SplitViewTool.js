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
const RADIX = 10;
const ID_PREFIX = 'oltb-split-view';

const DefaultOptions = Object.freeze({
    click: undefined
});

const LocalStorageNodeName = LocalStorageKeys.splitViewTool;
const LocalStorageDefaults = Object.freeze({
    active: false,
    collapsed: false
});

class SplitViewTool extends Control {
    constructor(options = {}) {
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.arrowsExpandVertical.stroked,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Split view (${ShortcutKeys.splitViewTool})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);
        
        this.button = button;
        this.active = false;
        this.options = { ...DefaultOptions, ...options };

        // Load stored data from localStorage
        const localStorageState = StateManager.getStateObject(LocalStorageNodeName);
        this.localStorage = { ...LocalStorageDefaults, ...localStorageState };

        const mapElement = ElementManager.getMapElement();
        const toolboxElement = ElementManager.getToolboxElement();
        toolboxElement.insertAdjacentHTML('beforeend', `
            <div id="${ID_PREFIX}-toolbox" class="oltb-toolbox-section">
                <div class="oltb-toolbox-section__header">
                    <h4 class="oltb-toolbox-section__title oltb-toggleable" data-oltb-toggleable-target="${ID_PREFIX}-toolbox-collapsed">
                        Split view
                        <span class="oltb-toolbox-section__icon oltb-tippy" title="Toggle section"></span>
                    </h4>
                </div>
                <div class="oltb-toolbox-section__groups" id="${ID_PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.collapsed ? 'none' : 'block'}">
                    <div class="oltb-toolbox-section__group">
                        <label class="oltb-label" for="${ID_PREFIX}-left-src">Left side</label>
                        <select id="${ID_PREFIX}-left-src" class="oltb-select"></select>
                    </div>
                    <div class="oltb-toolbox-section__group">
                        <label class="oltb-label" for="${ID_PREFIX}-src">Right side</label>
                        <select id="${ID_PREFIX}-right-src" class="oltb-select"></select>
                    </div>
                    <div class="oltb-toolbox-section__group">
                        <button type="button" id="${ID_PREFIX}-swap-button" class="oltb-btn oltb-btn--green-mid oltb-w-100">Swap sides</button>
                    </div>
                </div>
            </div>
        `);

        mapElement.insertAdjacentHTML('beforeend', `
            <input type="range" min="0" max="100" value="50" class="oltb-slider" id="${ID_PREFIX}-slider">
        `);

        this.splitViewToolbox = document.querySelector(`#${ID_PREFIX}-toolbox`);

        this.leftSideSrc = this.splitViewToolbox.querySelector(`#${ID_PREFIX}-left-src`);
        this.leftSideSrc.addEventListener(Events.browser.change, this.updateTool.bind(this));

        this.rightSideSrc = this.splitViewToolbox.querySelector(`#${ID_PREFIX}-right-src`);
        this.rightSideSrc.addEventListener(Events.browser.change, this.updateTool.bind(this));

        const toggleableTriggers = this.splitViewToolbox.querySelectorAll('.oltb-toggleable');
        toggleableTriggers.forEach((toggle) => {
            toggle.addEventListener(Events.browser.click, this.onToggleToolbox.bind(this, toggle));
        });

        const swapSidesButton = this.splitViewToolbox.querySelector(`#${ID_PREFIX}-swap-button`);
        swapSidesButton.addEventListener(Events.browser.click, (event) => {
            this.swapSides();
        });
        
        this.splitViewSlider = mapElement.querySelector(`#${ID_PREFIX}-slider`);
        this.splitViewSlider.addEventListener(Events.browser.input, this.onSliderInput.bind(this));

        window.addEventListener(Events.custom.mapLayerAdded, this.onWindowMapLayerAdded.bind(this));
        window.addEventListener(Events.custom.mapLayerRemoved, this.onWindowMapLayerRemoved.bind(this));
        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(Events.custom.settingsCleared, this.onWindowSettingsCleared.bind(this));
        window.addEventListener(Events.browser.contentLoaded, this.onDOMContentLoaded.bind(this));
    }

    onSliderInput(event) {
        const map = this.getMap();
        if(!Boolean(map)) {
            return;
        }

        map.render();
    }

    onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        document.getElementById(targetName)?.slideToggle(Config.animationDuration.fast, (collapsed) => {
            this.localStorage.collapsed = collapsed;
            StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
        });
    }

    onDOMContentLoaded() {
        if(Boolean(this.localStorage.active)) {
            this.activateTool();
        }
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.splitViewTool)) {
            this.handleClick(event);
        }
    }
    
    onWindowSettingsCleared() {
        this.localStorage = { ...LocalStorageDefaults };
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

        DOM.appendChildren(this.leftSideSrc, [
            leftOption
        ]);

        DOM.appendChildren(this.rightSideSrc, [
            rightOption
        ]);
    }

    onWindowMapLayerRemoved(event) {
        const layerWrapper = event.detail.layerWrapper;

        this.leftSideSrc.childNodes.forEach((option) => {
            if(parseInt(option.value, RADIX) === layerWrapper.getId()) {
                option.remove();
            }
        });

        this.rightSideSrc.childNodes.forEach((option) => {
            if(parseInt(option.value, RADIX) === layerWrapper.getId()) {
                option.remove();
            }
        });

        eventDispatcher([this.leftSideSrc, this.rightSideSrc], Events.browser.change);
    }

    updateTool() {
        this.sourceChange(
            parseInt(this.leftSideSrc.value, RADIX), 
            parseInt(this.rightSideSrc.value, RADIX)
        );
    }

    handleClick() {
        LogManager.logDebug(FILENAME, 'handleClick', 'User clicked tool');

        // User defined callback from constructor
        if(this.options.click instanceof Function) {
            this.options.click();
        }

        if(LayerManager.getMapLayerSize() <= 1) {
            Toast.info({
                title: 'Tip',
                message: 'You must have more then one layer'
            });
            
            return;
        }

        if(Boolean(this.active)) {
            this.deActivateTool();
        }else {
            this.activateTool();
        }
    }

    activateTool() {
        this.rightSideSrc.selectedIndex = '1';

        eventDispatcher([this.rightSideSrc], Events.browser.change);

        if(Boolean(this.layerLoadingError)) {
            return;
        }

        this.active = true;
        this.splitViewToolbox.classList.add('oltb-toolbox-section--show');
        this.splitViewSlider.classList.add('oltb-slider--show');
        this.button.classList.add('oltb-tool-button--active');

        this.localStorage.active = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deActivateTool() {
        const map = this.getMap();
        if(!Boolean(map)) {
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
        this.splitViewToolbox.classList.remove('oltb-toolbox-section--show');
        this.splitViewSlider.classList.remove('oltb-slider--show');
        this.button.classList.remove('oltb-tool-button--active');

        this.localStorage.active = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    swapSides() {
        const currentRightId = this.rightSideSrc.value;

        this.rightSideSrc.value = this.leftSideSrc.value;
        this.leftSideSrc.value = currentRightId;

        eventDispatcher([this.leftSideSrc, this.rightSideSrc], Events.browser.change);
    }

    sourceChange(leftSideSrcId, rightSideSrcId) {
        const map = this.getMap();
        if(!Boolean(map)) {
            return;
        }

        // Remove previously added listeners
        unByKey(this.onPreRenderListener);
        unByKey(this.onPostRenderListener);

        // Remove current layers from the map
        // Only the left and right layer will be added later
        LayerManager.getMapLayers().forEach((layerWrapper) => {
            const layer = layerWrapper.getLayer();

            map.removeLayer(layer);
            layer.setVisible(false);
        });

        // Get layers to view in split-mode
        const leftSideLayerWrapper = LayerManager.getMapLayerById(leftSideSrcId);
        const rightSideLayerWrapper = LayerManager.getMapLayerById(rightSideSrcId);

        // This should not happen, but just in case
        if(
            !Boolean(leftSideLayerWrapper) || 
            !Boolean(rightSideLayerWrapper)
        ) {
            this.layerLoadingError = true;

            const errorMessage = 'One or both of the layers could not be loaded';
            LogManager.logError(FILENAME, 'onContextMenuSetRotation', {
                message: errorMessage,
                layers: {
                    left: leftSideLayerWrapper,
                    right: rightSideLayerWrapper
                }
            });

            Toast.error({
                title: 'Error',
                message: errorMessage
            });

            return;
        }

        const leftSideLayer = leftSideLayerWrapper.getLayer();
        const rightSideLayer = rightSideLayerWrapper.getLayer();

        // Left layer config
        leftSideLayer.setVisible(true);
        map.addLayer(leftSideLayer);

        if(leftSideSrcId !== rightSideSrcId) {
            // Right layer config, only if different source than left side
            rightSideLayer.setVisible(true);
            map.addLayer(rightSideLayer);

            // Attach listeners to the right layer. 
            // Pre/Post render will only show part of the right map
            this.onPreRenderListener = rightSideLayer.on(Events.openLayers.preRender, this.onPreRender.bind(this));
            this.onPostRenderListener = rightSideLayer.on(Events.openLayers.postRender, this.onPostRender.bind(this));
        }

        map.render();
    }

    onPreRender(event) {
        const map = this.getMap();
        if(!Boolean(map)) {
            return;
        }

        const context = event.context;
        const mapSize = map.getSize();

        // Calculate offset for the handlebar. 
        // The range slider is not perfectly linear towards the edges. 
        const halfHandleWidth = Config.browser.rem;
        const sliderWidth = this.splitViewSlider.offsetWidth;
        const sliderCenter = sliderWidth / 2;
        const percentOfRange = (this.splitViewSlider.value / (this.splitViewSlider.max - this.splitViewSlider.min));
        const valuePxPosition = percentOfRange * sliderWidth;
        const distFromCenter = valuePxPosition - sliderCenter;
        const percentDistFromCenter = distFromCenter / sliderCenter;
        const offset = percentDistFromCenter * halfHandleWidth;

        const mapWidth = mapSize[0];
        const mapHeight = mapSize[1];

        // Displaying two maps next to each other.
        const width = mapWidth * (this.splitViewSlider.value / this.splitViewSlider.max) - offset;
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