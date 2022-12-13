import DOM from '../helpers/Browser/DOM';
import Toast from '../common/Toast';
import CONFIG from '../core/Config';
import LayerManager from '../core/managers/LayerManager';
import StateManager from '../core/managers/StateManager';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { unByKey } from 'ol/Observable';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { getRenderPixel } from 'ol/render';
import { eventDispatcher } from '../helpers/Browser/EventDispatcher';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { SVG_PATHS, getIcon } from '../core/icons/SVGIcons';
import { LOCAL_STORAGE_KEYS } from '../helpers/constants/LocalStorageKeys';
import { TOOLBOX_ELEMENT, TOOLBAR_ELEMENT, MAP_ELEMENT } from '../core/elements/index';

const RADIX = 10;
const ID_PREFIX = 'oltb-split-view';
const DEFAULT_OPTIONS = {};

const LOCAL_STORAGE_NODE_NAME = LOCAL_STORAGE_KEYS.splitViewTool;
const LOCAL_STORAGE_DEFAULTS = {
    active: false,
    collapsed: false
};

class SplitViewTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.SplitView,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Split view (${SHORTCUT_KEYS.splitView})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.button = button;
        this.active = false;
        this.options = { ...DEFAULT_OPTIONS, ...options };

        // Load stored data from localStorage
        const localStorageState = JSON.parse(StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME)) || {};
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...localStorageState };

        TOOLBOX_ELEMENT.insertAdjacentHTML('beforeend', `
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
                        <button type="button" id="${ID_PREFIX}-swap-btn" class="oltb-btn oltb-btn--green-mid oltb-w-100">Swap sides</button>
                    </div>
                </div>
            </div>
        `);

        MAP_ELEMENT.insertAdjacentHTML('beforeend', `
            <input type="range" min="0" max="100" value="50" class="oltb-slider" id="${ID_PREFIX}-slider">
        `);

        this.splitViewToolbox = document.querySelector(`#${ID_PREFIX}-toolbox`);

        this.leftSrc = this.splitViewToolbox.querySelector(`#${ID_PREFIX}-left-src`);
        this.leftSrc.addEventListener(EVENTS.browser.change, this.updateTool.bind(this));

        this.rightSrc = this.splitViewToolbox.querySelector(`#${ID_PREFIX}-right-src`);
        this.rightSrc.addEventListener(EVENTS.browser.change, this.updateTool.bind(this));

        const toggleableTriggers = this.splitViewToolbox.querySelectorAll('.oltb-toggleable');
        toggleableTriggers.forEach((toggle) => {
            toggle.addEventListener(EVENTS.browser.click, this.onToggleToolbox.bind(this, toggle));
        });

        const swapSidesButton = this.splitViewToolbox.querySelector(`#${ID_PREFIX}-swap-btn`);
        swapSidesButton.addEventListener(EVENTS.browser.click, (event) => {
            this.swapSides();
        });
        
        this.splitViewSlider = MAP_ELEMENT.querySelector(`#${ID_PREFIX}-slider`);
        this.splitViewSlider.addEventListener(EVENTS.browser.input, (event) => {
            this.getMap().render();
        });

        window.addEventListener(EVENTS.custom.mapLayerAdded, this.onWindowMapLayerAdded.bind(this));
        window.addEventListener(EVENTS.custom.mapLayerRemoved, this.onWindowMapLayerRemoved.bind(this));
        window.addEventListener(EVENTS.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(EVENTS.custom.settingsCleared, this.onWindowSettingsCleared.bind(this));
        window.addEventListener(EVENTS.browser.contentLoaded, this.onDOMContentLoaded.bind(this));
    }

    onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        document.getElementById(targetName).slideToggle(CONFIG.animationDuration.fast, (collapsed) => {
            this.localStorage.collapsed = collapsed;
            StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
        });
    }

    onDOMContentLoaded() {
        if(this.localStorage.active) {
            this.activateTool();
        }
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.splitView)) {
            this.handleClick(event);
        }
    }
    
    onWindowSettingsCleared() {
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS };
    }

    onWindowMapLayerAdded(event) {
        const layerWrapper = event.detail.layerWrapper;

        const leftOption = DOM.createElement({
            element: 'option',
            text: layerWrapper.name,
            value: layerWrapper.id.toString()
        });

        const rightOption = DOM.createElement({
            element: 'option',
            text: layerWrapper.name,
            value: layerWrapper.id.toString()
        });

        this.leftSrc.appendChild(leftOption);
        this.rightSrc.appendChild(rightOption);
    }

    onWindowMapLayerRemoved(event) {
        const layerWrapper = event.detail.layerWrapper;

        this.leftSrc.childNodes.forEach((option) => {
            if(parseInt(option.value, RADIX) === layerWrapper.id) {
                option.remove();
            }
        });

        this.rightSrc.childNodes.forEach((option) => {
            if(parseInt(option.value, RADIX) === layerWrapper.id) {
                option.remove();
            }
        });

        // Dispatch event so the map can update if an active layer was removed
        eventDispatcher([this.leftSrc, this.rightSrc], EVENTS.browser.change);
    }

    updateTool() {
        this.sourceChange(
            parseInt(this.leftSrc.value, RADIX), 
            parseInt(this.rightSrc.value, RADIX)
        );
    }

    handleClick() {
        // User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }

        if(LayerManager.getMapLayerSize() <= 1) {
            Toast.info({text: 'You must have more then one layer'});
            return;
        }

        if(this.active) {
            this.deActivateTool();
        }else {
            this.activateTool();
        }
    }

    activateTool() {
        this.rightSrc.selectedIndex = '1';

        eventDispatcher([this.rightSrc], EVENTS.browser.change);

        if(this.layerLoadingError) {
            return;
        }

        this.active = true;
        this.splitViewToolbox.classList.add('oltb-toolbox-section--show');
        this.splitViewSlider.classList.add('oltb-slider--show');
        this.button.classList.add('oltb-tool-button--active');

        this.localStorage.active = true;
        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
    }

    deActivateTool() {
        const map = this.getMap();

        // Remove previosly added listeners
        unByKey(this.onPreRenderListener);
        unByKey(this.onPostRenderListener);

        // Remove the ol-split-view-layers from the map
        LayerManager.getMapLayers().forEach((layerWrapper) => {
            map.removeLayer(layerWrapper.layer);
        });

        // Add back all the original layers to the map
        LayerManager.getMapLayers().forEach((layerWrapper) => {
            map.addLayer(layerWrapper.layer);
        });

        // Set first layer as the only one visible
        LayerManager.setTopMapLayerAsOnlyVisible();

        this.active = false;
        this.splitViewToolbox.classList.remove('oltb-toolbox-section--show');
        this.splitViewSlider.classList.remove('oltb-slider--show');
        this.button.classList.remove('oltb-tool-button--active');

        this.localStorage.active = false;
        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
    }

    swapSides() {
        const currentRightId = this.rightSrc.value;

        this.rightSrc.value = this.leftSrc.value;
        this.leftSrc.value = currentRightId;

        // Dispatch event so the map can update
        eventDispatcher([this.leftSrc, this.rightSrc], EVENTS.browser.change);
    }

    sourceChange(leftSrcId, rightSrcId) {
        // Remove previously added listeners
        unByKey(this.onPreRenderListener);
        unByKey(this.onPostRenderListener);

        const map = this.getMap();

        // Remove current layers from the map
        // Only the left and right layer will be added later
        LayerManager.getMapLayers().forEach((layerWrapper) => {
            map.removeLayer(layerWrapper.layer);
            layerWrapper.layer.setVisible(false);
        });

        // Get layers to view in split-mode
        const leftlayerWrapper = LayerManager.getMapLayerById(leftSrcId);
        const rightlayerWrapper = LayerManager.getMapLayerById(rightSrcId);

        // This should not happen, but just in case
        if(!leftlayerWrapper || !rightlayerWrapper) {
            Toast.error({text: 'One or both of the selected layers could not be loaded'});
            this.layerLoadingError = true;
            return;
        }

        const leftLayer = leftlayerWrapper.layer;
        const rightLayer = rightlayerWrapper.layer;

        // Left layer config
        leftLayer.setVisible(true);
        map.addLayer(leftLayer);

        if(leftSrcId !== rightSrcId) {
            // Right layer config, only if different source than left side
            rightLayer.setVisible(true);
            map.addLayer(rightLayer);

            // Attach listeners to the right layer. 
            // Pre/Post render will only show part of the right map
            this.onPreRenderListener = rightLayer.on(EVENTS.ol.preRender, this.onPreRender.bind(this));
            this.onPostRenderListener = rightLayer.on(EVENTS.ol.postRender, this.onPostRender.bind(this));
        }

        map.render();
    }

    onPreRender(event) {
        const context = event.context;
        const mapSize = this.getMap().getSize();

        // Calculate offset for the handlebar. 
        // The range slider is not perfectly linear towards the edges. 
        const halfHandleWidth = CONFIG.rem;
        const sliderWidth = this.splitViewSlider.offsetWidth;
        const sliderCenter = sliderWidth / 2;
        const percentOfRange = (this.splitViewSlider.value / (this.splitViewSlider.max - this.splitViewSlider.min));
        const valuePXPosition = percentOfRange * sliderWidth;
        const distFromCenter = valuePXPosition - sliderCenter;
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

export default SplitViewTool;