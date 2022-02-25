import 'ol/ol.css';
import EventType from 'ol/events/EventType';
import LayerManager from '../core/Managers/LayerManager';
import Toast from '../common/Toast';
import { Control } from 'ol/control';
import { getRenderPixel } from 'ol/render';
import { unByKey } from 'ol/Observable';
import { toolboxElement, toolbarElement, mapElement } from '../core/ElementReferences';
import { eventDispatcher } from '../helpers/EventDispatcher';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';

class SplitView extends Control {
    constructor() {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.SplitView,
            class: 'oltb-tool-button__icon'
        });

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('data-tippy-content', 'Split view (S)');
        button.className = 'oltb-tool-button';
        button.innerHTML = icon;
        button.addEventListener(
            EventType.CLICK,
            this.handleClick.bind(this),
            false
        );

        this.element.appendChild(button);
        this.button = button;
        this.active = false;

        toolboxElement.insertAdjacentHTML('beforeend', `
            <div id="oltb-split-view-settings-box" class="oltb-toolbox-section">
                <div class="oltb-toolbox-section__group">
                    <h4 class="oltb-toolbox-section__title">Split view</h4>
                    <label class="oltb-label" for="oltb-left-src">Left side</label>
                    <select id="oltb-left-src" class="oltb-select"></select>
                </div>
                <div class="oltb-toolbox-section__group">
                    <label class="oltb-label" for="oltb-right-src">Right side</label>
                    <select id="oltb-right-src" class="oltb-select"></select>
                </div>
                <div class="oltb-toolbox-section__group">
                    <button type="button" id="oltb-swap-sides-btn" class="oltb-btn oltb-btn--dark-green oltb-w-100">Swap sides</button>
                </div>
            </div>
        `);

        mapElement.insertAdjacentHTML('beforeend', `
            <input type="range" min="0" max="100" value="50" class="oltb-slider" id="oltb-split-view-slider">
        `);

        const splitView = document.querySelector('#oltb-split-view-settings-box');
        this.splitView = splitView;

        const leftSrc = splitView.querySelector('#oltb-left-src');
        leftSrc.addEventListener('change', () => updateTool());
        this.leftSrc = leftSrc;

        const rightSrc = splitView.querySelector('#oltb-right-src');
        rightSrc.addEventListener('change', () => updateTool());
        this.rightSrc = rightSrc;

        const updateTool = () => {
            this.sourceChange(
                parseInt(leftSrc.value, 10), 
                parseInt(rightSrc.value, 10)
            );
        }

        const swapSidesBtn = splitView.querySelector('#oltb-swap-sides-btn');
        swapSidesBtn.addEventListener('click', (event) => {
            this.swapSides();
        });
        
        const splitViewSlider = mapElement.querySelector('#oltb-split-view-slider');
        splitViewSlider.addEventListener('input', (event) => {
            this.getMap().render();
        });
        
        this.splitViewSlider = splitViewSlider;

        window.addEventListener('oltb.mapLayer.added', this.mapLayerAdded.bind(this));
        window.addEventListener('oltb.mapLayer.removed', this.mapLayerRemoved.bind(this));

        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, 's')) {
                this.handleClick(event);
            }
        });
    }

    mapLayerAdded(event) {
        const layerObject = event.detail.layerObject;
    
        const leftOption = document.createElement('option');
        leftOption.innerText = layerObject.name;
        leftOption.value = layerObject.id;

        const rightOption = document.createElement('option');
        rightOption.innerText = layerObject.name;
        rightOption.value = layerObject.id;

        this.leftSrc.appendChild(leftOption);
        this.rightSrc.appendChild(rightOption);
    }

    mapLayerRemoved(event) {
        const layerObject = event.detail.layerObject;

        this.leftSrc.childNodes.forEach((option) => {
            if(parseInt(option.value, 10) === layerObject.id) {
                option.remove();
            }
        });

        this.rightSrc.childNodes.forEach((option) => {
            if(parseInt(option.value, 10) === layerObject.id) {
                option.remove();
            }
        });

        // Dispatch event so the map can update if an active layer was removed
        eventDispatcher([this.leftSrc, this.rightSrc], 'change');
    }

    handleClick(event) {
        event.preventDefault();
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
            LayerManager.getMapLayers().forEach(layerObject => {
                map.removeLayer(layerObject.layer);
            });

            // Add back all the original layers to the map
            LayerManager.getMapLayers().forEach(layerObject => {
                map.addLayer(layerObject.layer);
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
        this.splitView.classList.toggle('oltb-toolbox-section--show');
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
        LayerManager.getMapLayers().forEach(layerObject => {
            map.removeLayer(layerObject.layer);
            layerObject.layer.setVisible(false);
        });

        // Get layers to view in split-mode
        const leftLayerObject = LayerManager.getMapLayerById(leftSrcId);
        const rightLayerObject = LayerManager.getMapLayerById(rightSrcId);

        // This should not happen. But just in case
        if(!leftLayerObject || !rightLayerObject) {
            Toast.error({text: 'One or both of the selected layers could not be loaded'});
            this.layerLoadingError = true;
            return;
        }

        const leftLayer = leftLayerObject.layer;
        const rightLayer = rightLayerObject.layer;

        // Left layer config
        leftLayer.setVisible(true);
        map.addLayer(leftLayer);

        if(leftSrcId !== rightSrcId) {
            // Right layer config, only if different source than left side
            map.addLayer(rightLayer);
            rightLayer.setVisible(true);

            // Attach listeners to the right layer. Pre/Post render will only show part of the right map
            this.onPreRenderListener = rightLayer.on('prerender', this.onPreRender.bind(this));
            this.onPostRenderListener = rightLayer.on('postrender', this.onPostRender.bind(this));
        }

        // Render the map to se the ol-split-view
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