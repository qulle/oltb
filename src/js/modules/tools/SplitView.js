import LayerManager from '../core/Managers/LayerManager';
import StateManager from '../core/Managers/StateManager';
import Toast from '../common/Toast';
import DOM from '../helpers/Browser/DOM';
import { Control } from 'ol/control';
import { getRenderPixel } from 'ol/render';
import { unByKey } from 'ol/Observable';
import { TOOLBOX_ELEMENT, TOOLBAR_ELEMENT, MAP_ELEMENT } from '../core/ElementReferences';
import { eventDispatcher } from '../helpers/Browser/EventDispatcher';
import { SVG_PATHS, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { SHORTCUT_KEYS } from '../helpers/Constants/ShortcutKeys';
import { EVENTS } from '../helpers/Constants/Events';

const LOCAL_STORAGE_NODE_NAME = 'splitViewTool';
const LOCAL_STORAGE_DEFAULTS = {
    collapsed: false
};

class SplitView extends Control {
    constructor() {
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
                'data-tippy-content': `Split view (${SHORTCUT_KEYS.SplitView})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.button = button;
        this.active = false;

        // Load potential stored data from localStorage
        const localStorageState = JSON.parse(StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME)) || {};
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...localStorageState };

        TOOLBOX_ELEMENT.insertAdjacentHTML('beforeend', `
            <div id="oltb-split-view-toolbox" class="oltb-toolbox-section">
                <div class="oltb-toolbox-section__header">
                    <h4 class="oltb-toolbox-section__title oltb-toggleable" data-oltb-toggleable-target="oltb-split-view-toolbox-collapsed">
                        Split view
                        <span class="oltb-toolbox-section__icon oltb-tippy" title="Toggle section"></span>
                    </h4>
                </div>
                <div class="oltb-toolbox-section__groups" id="oltb-split-view-toolbox-collapsed" style="display: ${this.localStorage.collapsed ? 'none' : 'block'}">
                    <div class="oltb-toolbox-section__group">
                        <label class="oltb-label" for="oltb-left-src">Left side</label>
                        <select id="oltb-left-src" class="oltb-select"></select>
                    </div>
                    <div class="oltb-toolbox-section__group">
                        <label class="oltb-label" for="oltb-right-src">Right side</label>
                        <select id="oltb-right-src" class="oltb-select"></select>
                    </div>
                    <div class="oltb-toolbox-section__group">
                        <button type="button" id="oltb-swap-sides-btn" class="oltb-btn oltb-btn--green-mid oltb-w-100">Swap sides</button>
                    </div>
                </div>
            </div>
        `);

        MAP_ELEMENT.insertAdjacentHTML('beforeend', `
            <input type="range" min="0" max="100" value="50" class="oltb-slider" id="oltb-split-view-slider">
        `);

        this.splitViewToolbox = document.querySelector('#oltb-split-view-toolbox');

        this.leftSrc = this.splitViewToolbox.querySelector('#oltb-left-src');
        this.leftSrc.addEventListener(EVENTS.Browser.Change, () => updateTool());

        this.rightSrc = this.splitViewToolbox.querySelector('#oltb-right-src');
        this.rightSrc.addEventListener(EVENTS.Browser.Change, () => updateTool());

        const toggleableTriggers = this.splitViewToolbox.querySelectorAll('.oltb-toggleable');
        toggleableTriggers.forEach((toggle) => {
            toggle.addEventListener(EVENTS.Browser.Click, (event) => {
                const targetName = toggle.dataset.oltbToggleableTarget;
                document.getElementById(targetName).slideToggle(200, (collapsed) => {
                    this.localStorage.collapsed = collapsed;
                    StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
                });
            });
        });

        const updateTool = () => {
            this.sourceChange(
                parseInt(this.leftSrc.value, 10), 
                parseInt(this.rightSrc.value, 10)
            );
        }

        const swapSidesBtn = this.splitViewToolbox.querySelector('#oltb-swap-sides-btn');
        swapSidesBtn.addEventListener(EVENTS.Browser.Click, (event) => {
            this.swapSides();
        });
        
        this.splitViewSlider = MAP_ELEMENT.querySelector('#oltb-split-view-slider');
        this.splitViewSlider.addEventListener(EVENTS.Browser.Input, (event) => {
            this.getMap().render();
        });

        window.addEventListener(EVENTS.Custom.MapLayerAdded, this.mapLayerAdded.bind(this));
        window.addEventListener(EVENTS.Custom.MapLayerRemoved, this.mapLayerRemoved.bind(this));
        window.addEventListener(EVENTS.Browser.KeyUp, (event) => {
            if(isShortcutKeyOnly(event, SHORTCUT_KEYS.SplitView)) {
                this.handleClick(event);
            }
        });
        window.addEventListener(EVENTS.Custom.SettingsCleared, () => {
            this.localStorage = LOCAL_STORAGE_DEFAULTS;
        });
    }

    mapLayerAdded(event) {
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

    mapLayerRemoved(event) {
        const layerWrapper = event.detail.layerWrapper;

        this.leftSrc.childNodes.forEach((option) => {
            if(parseInt(option.value, 10) === layerWrapper.id) {
                option.remove();
            }
        });

        this.rightSrc.childNodes.forEach((option) => {
            if(parseInt(option.value, 10) === layerWrapper.id) {
                option.remove();
            }
        });

        // Dispatch event so the map can update if an active layer was removed
        eventDispatcher([this.leftSrc, this.rightSrc], 'change');
    }

    handleClick() {
        this.handleSplitView();
    }

    swapSides() {
        const currentRightId = this.rightSrc.value;

        this.rightSrc.value = this.leftSrc.value;
        this.leftSrc.value = currentRightId;

        // Dispatch event so the map can update
        eventDispatcher([this.leftSrc, this.rightSrc], 'change');
    }

    handleSplitView() {
        if(LayerManager.getMapLayerSize() <= 1) {
            Toast.info({text: 'You must have more then one map-layer to use the split view'});
            return;
        }

        const map = this.getMap();

        if(this.active) {
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
        }else {
            this.rightSrc.selectedIndex = '1';

            eventDispatcher([this.rightSrc], 'change');
        }

        if(this.layerLoadingError) {
            return;
        }

        this.active = !this.active;
        this.splitViewToolbox.classList.toggle('oltb-toolbox-section--show');
        this.splitViewSlider.classList.toggle('oltb-slider--show');
        this.button.classList.toggle('oltb-tool-button--active');
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
            map.addLayer(rightLayer);
            rightLayer.setVisible(true);

            // Attach listeners to the right layer. Pre/Post render will only show part of the right map
            this.onPreRenderListener = rightLayer.on(EVENTS.Ol.PreRender, this.onPreRender.bind(this));
            this.onPostRenderListener = rightLayer.on(EVENTS.Ol.PostRender, this.onPostRender.bind(this));
        }

        map.render();
    }

    onPreRender(event) {
        const context = event.context;
        const mapSize = this.getMap().getSize();

        // Calculate offset for the handlebar. The range slider is not perfectly linear with towards the edges. 
        const halfHandleWidth = 16;
        const sliderWidth = this.splitViewSlider.offsetWidth;
        const sliderCenter = sliderWidth / 2;
        const percentOfRange = (this.splitViewSlider.value / (this.splitViewSlider.max - this.splitViewSlider.min));
        const valuePXPosition = percentOfRange * sliderWidth;
        const distFromCenter = valuePXPosition - sliderCenter;
        const percentDistFromCenter = distFromCenter / sliderCenter;
        const offset = percentDistFromCenter * halfHandleWidth;

        const mapWidth = mapSize[0];
        const mapHeight = mapSize[1];

        // Make the calculations for displaying two maps next to each other.
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

export default SplitView;