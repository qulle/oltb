import 'ol/ol.css';
import EventType from 'ol/events/EventType';
import Draw from 'ol/interaction/Draw';
import Overlay from 'ol/Overlay';
import LayerManager from '../core/Managers/LayerManager';
import SettingsManager from '../core/Managers/SettingsManager';
import StateManager from '../core/Managers/StateManager';
import { Control } from 'ol/control';
import { Fill, Stroke, Circle, Style } from 'ol/style';
import { unByKey } from 'ol/Observable';
import { toolboxElement, toolbarElement } from '../core/ElementReferences';
import { eventDispatcher } from '../helpers/EventDispatcher';
import { onFeatureChange } from '../helpers/Measure';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';

class MeasureTool extends Control {
    constructor(callbacksObj = {}) {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.Measure,
            class: 'oltb-tool-button__icon'
        });

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('data-tippy-content', 'Measure (M)');
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
        this.callbacksObj = callbacksObj;

        // Load potential stored settings from local storage
        let lsSettings = JSON.parse(StateManager.getStateObject('measureTool')) || {};

        const lsMeasureType = 'measureType' in lsSettings ? lsSettings['measureType'] : '0';
        const lsStrokeColor = 'strokeColor' in lsSettings ? lsSettings['strokeColor'] : '#3B4352';

        toolboxElement.insertAdjacentHTML('beforeend', `
            <div id="oltb-measure-settings-box" class="oltb-toolbox-section">
                <div class="oltb-toolbox-section__group">
                    <h4 class="oltb-toolbox-section__title">Measure tool</h4>
                    <label class="oltb-label" for="oltb-measure-type">Type</label>
                    <select id="oltb-measure-type" class="oltb-select">
                        <option value="LineString">Length</option>
                        <option value="Polygon">Area</option>
                    </select>
                </div>
                <div class="oltb-toolbox-section__group">
                    <label class="oltb-label" for="oltb-measure-stroke-color">Stroke color</label>
                    <div id="oltb-measure-stroke-color" class="oltb-color-input oltb-color-tippy" data-oltb-color-target="#oltb-measure-stroke-color" data-oltb-color="${lsStrokeColor}" tabindex="0">
                        <div class="oltb-color-input__inner" style="background-color: ${lsStrokeColor};"></div>
                    </div>
                </div>
            </div>
        `);

        const measureSettingsBox = document.querySelector('#oltb-measure-settings-box');
        const toolType = measureSettingsBox.querySelector('#oltb-measure-type');
        const strokeColor = measureSettingsBox.querySelector('#oltb-measure-stroke-color');

        toolType.addEventListener('change', () => updateTool());
        strokeColor.addEventListener('color-change', () => updateTool());

        toolType.selectedIndex = lsMeasureType;

        const updateTool = () => {
            // Store current values in local storage
            lsSettings['measureType'] = toolType.selectedIndex;
            lsSettings['strokeColor'] = strokeColor.getAttribute('data-oltb-color');;

            StateManager.updateStateObject('measureTool', JSON.stringify(lsSettings));

            this.selectMeasureTool(
                toolType.value,
                strokeColor.getAttribute('data-oltb-color')
            );
        }

        this.measureSettingsBox = measureSettingsBox;
        this.toolType = toolType;
        this.strokeColor = strokeColor;

        document.addEventListener('keyup', (event) => {
            const key = event.key;

            if(key === 'Escape') {
                if(this.interaction) {
                    this.interaction.abortDrawing();
                }
            }else if(event.ctrlKey && key === 'z') {
                if(this.interaction) {
                    this.interaction.removeLastPoint();
                }
            }else if(isShortcutKeyOnly(event, 'm')) {
                this.handleClick(event);
            }
        });

        window.addEventListener('oltb.settings.cleared', () => {
            lsSettings = {};
        });
    }

    // Called when user changes to another tool that first must deselect/cleanup this tool
    deSelect() {
        this.handleMeasure();
    }

    handleClick(event) {
        event.preventDefault();

        // Check if there is a tool already in use that needs to be deselected
        const activeTool = window?.oltb?.activeTool; 
        if(activeTool && activeTool !== this) {
            activeTool.deSelect();
        }

        // Set this tool as the active global tool
        window.oltb = window.oltb || {};
        window.oltb['activeTool'] = this;

        this.handleMeasure();
    }

    handleMeasure() {
        if(this.active) {
            this.getMap().removeInteraction(this.interaction);

            // Remove this tool as the active global tool
            window.oltb.activeTool = null;
        }else {
            if(SettingsManager.getSetting('alwaysNewLayers')) {
                LayerManager.addFeatureLayer('Measurements layer');
            }

            // Dispatch event to select a tooltype from the settings-box
            // The event then triggers the activation of the measure tool
            eventDispatcher([this.toolType], 'change');
        }

        this.active = !this.active;
        this.measureSettingsBox.classList.toggle('oltb-toolbox-section--show');
        this.button.classList.toggle('oltb-tool-button--active');
    }

    selectMeasureTool(toolType, strokeColor) {
        const map = this.getMap();

        if(this.interaction) {
            map.removeInteraction(this.interaction);
        }
        
        const styles = [
            new Style({
                image: new Circle({
                    fill: new Fill({
                        color: 'rgba(255, 255, 255, 1)'
                    }),
                    stroke: new Stroke({
                        color: strokeColor,
                    }),
                    radius: 5,
                    width: 1.25
                }),
                fill: new Fill({
                    color: 'rgba(255, 255, 255, .5)'
                }),
                stroke: new Stroke({
                    color: strokeColor,
                    lineDash: [2, 5],
                    width: 2
                })
            })
        ];

        this.interaction = new Draw({
            type: toolType,
            style: styles
        });

        map.addInteraction(this.interaction);

        const self = this;

        this.interaction.on('drawstart', function(event) {
            const feature = event.feature;

            const measureTooltipElement = document.createElement('div');
            measureTooltipElement.className = 'oltb-measure-tooltip';
    
            const measureTooltipOverlay = new Overlay({
                element: measureTooltipElement,
                offset: [0, -15],
                positioning: 'bottom-center',
            });
    
            map.addOverlay(measureTooltipOverlay);

            feature.attributes = {
                tooltipElement: measureTooltipElement, 
                tooltipOverlay: measureTooltipOverlay
            };

            feature.getGeometry().on('change', onFeatureChange.bind(feature));

            // User defined callback from constructor
            if(typeof self.callbacksObj.start === 'function') {
                self.callbacksObj.start(event);
            }
        });

        this.interaction.on('drawend', function(event) {
            const feature = event.feature;

            unByKey(feature.attributes.onChangeListener);

            feature.attributes.tooltipElement.className = 'oltb-measure-tooltip oltb-measure-tooltip--ended';
            feature.attributes.tooltipOverlay.setOffset([0, -7]);

            feature.setStyle(styles);

            const layer = LayerManager.getActiveFeatureLayer({ifNoLayerName: 'Measurements layer'}).layer;
            layer.getSource().addFeature(feature);

            // User defined callback from constructor
            if(typeof self.callbacksObj.end === 'function') {
                self.callbacksObj.end(event);
            }
        });

        this.interaction.on('drawabort', function(event) {
            const feature = event.feature;
            map.removeOverlay(feature.attributes.tooltipOverlay);

            // User defined callback from constructor
            if(typeof self.callbacksObj.abort === 'function') {
                self.callbacksObj.abort(event);
            }
        });

        this.interaction.on('error', function(event) {
            // User defined callback from constructor
            if(typeof self.callbacksObj.error === 'function') {
                self.callbacksObj.error(event);
            }
        });
    }
}

export default MeasureTool;