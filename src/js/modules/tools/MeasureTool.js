import 'ol/ol.css';
import Draw from 'ol/interaction/Draw';
import Overlay from 'ol/Overlay';
import LayerManager from '../core/Managers/LayerManager';
import SettingsManager from '../core/Managers/SettingsManager';
import StateManager from '../core/Managers/StateManager';
import DOM from '../helpers/Browser/DOM';
import { Control } from 'ol/control';
import { Fill, Stroke, Circle, Style } from 'ol/style';
import { unByKey } from 'ol/Observable';
import { toolboxElement, toolbarElement } from '../core/ElementReferences';
import { eventDispatcher } from '../helpers/Browser/EventDispatcher';
import { onFeatureChange } from '../helpers/olFunctions/Measure';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';

const LOCAL_STORAGE_NODE_NAME = 'measureTool';
const LOCAL_STORAGE_DEFAULTS = {
    collapsed: false,
    toolTypeIndex: 0,
    strokeColor: '#3B4352'
};

class MeasureTool extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.Measure,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': 'Measure (M)'
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.button = button;
        this.active = false;
        this.options = options;
        
        // Load potential stored data from localStorage
        const localStorageState = JSON.parse(StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME)) || {};
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...localStorageState };

        toolboxElement.insertAdjacentHTML('beforeend', `
            <div id="oltb-measure-toolbox" class="oltb-toolbox-section">
                <div class="oltb-toolbox-section__header">
                    <h4 class="oltb-toolbox-section__title oltb-toggleable" data-oltb-toggleable-target="oltb-measure-toolbox-collapsed">
                        Measure tool
                        <span class="oltb-toolbox-section__icon oltb-tippy" title="Toggle section"></span>
                    </h4>
                </div>
                <div class="oltb-toolbox-section__groups" id="oltb-measure-toolbox-collapsed" style="display: ${this.localStorage.collapsed ? 'none' : 'block'}">
                    <div class="oltb-toolbox-section__group">
                        <label class="oltb-label" for="oltb-measure-type">Type</label>
                        <select id="oltb-measure-type" class="oltb-select">
                            <option value="LineString">Length</option>
                            <option value="Polygon">Area</option>
                        </select>
                    </div>
                    <div class="oltb-toolbox-section__group">
                        <label class="oltb-label" for="oltb-measure-stroke-color">Stroke color</label>
                        <div id="oltb-measure-stroke-color" class="oltb-color-input oltb-color-tippy" data-oltb-color-target="#oltb-measure-stroke-color" data-oltb-color="${this.localStorage.strokeColor}" tabindex="0">
                            <div class="oltb-color-input__inner" style="background-color: ${this.localStorage.strokeColor};"></div>
                        </div>
                    </div>
                </div>
            </div>
        `);

        const measureToolbox = document.querySelector('#oltb-measure-toolbox');
        const toolType = measureToolbox.querySelector('#oltb-measure-type');
        const strokeColor = measureToolbox.querySelector('#oltb-measure-stroke-color');

        const toggleableTriggers = measureToolbox.querySelectorAll('.oltb-toggleable');
        toggleableTriggers.forEach(toggle => {
            toggle.addEventListener('click', (event) => {
                event.preventDefault();
                
                const targetName = toggle.dataset.oltbToggleableTarget;
                document.getElementById(targetName).slideToggle(200, (collapsed) => {
                    this.localStorage.collapsed = collapsed;
                    StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
                });
            });
        });

        toolType.addEventListener('change', () => updateTool());
        strokeColor.addEventListener('color-change', () => updateTool());

        toolType.selectedIndex = this.localStorage.toolTypeIndex;

        const updateTool = () => {
            // Store current values in local storage
            this.localStorage.toolTypeIndex = toolType.selectedIndex;
            this.localStorage.strokeColor = strokeColor.getAttribute('data-oltb-color');;

            StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));

            this.selectMeasureTool(
                toolType.value,
                strokeColor.getAttribute('data-oltb-color')
            );
        }

        this.measureToolbox = measureToolbox;
        this.toolType = toolType;
        this.strokeColor = strokeColor;

        document.addEventListener('keyup', (event) => {
            const key = event.key.toLowerCase();

            if(key === 'escape') {
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
            this.localStorage = LOCAL_STORAGE_DEFAULTS;
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
        this.measureToolbox.classList.toggle('oltb-toolbox-section--show');
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
            
            const measureTooltipElement = DOM.createElement({
                element: 'div',
                class: 'oltb-measure-tooltip'
            });
    
            const measureTooltipOverlay = new Overlay({
                element: measureTooltipElement,
                offset: [0, -15],
                positioning: 'bottom-center',
            });
    
            map.addOverlay(measureTooltipOverlay);

            feature.properties = {
                tooltipElement: measureTooltipElement, 
                tooltipOverlay: measureTooltipOverlay
            };

            feature.getGeometry().on('change', onFeatureChange.bind(feature));

            // User defined callback from constructor
            if(typeof self.options.start === 'function') {
                self.options.start(event);
            }
        });

        this.interaction.on('drawend', function(event) {
            const feature = event.feature;

            unByKey(feature.properties.onChangeListener);

            feature.properties.tooltipElement.className = 'oltb-measure-tooltip oltb-measure-tooltip--ended';
            feature.properties.tooltipOverlay.setOffset([0, -7]);

            feature.setStyle(styles);

            const layer = LayerManager.getActiveFeatureLayer({ifNoLayerName: 'Measurements layer'}).layer;
            layer.getSource().addFeature(feature);

            // User defined callback from constructor
            if(typeof self.options.end === 'function') {
                self.options.end(event);
            }
        });

        this.interaction.on('drawabort', function(event) {
            const feature = event.feature;
            map.removeOverlay(feature.properties.tooltipOverlay);

            // User defined callback from constructor
            if(typeof self.options.abort === 'function') {
                self.options.abort(event);
            }
        });

        this.interaction.on('error', function(event) {
            // User defined callback from constructor
            if(typeof self.options.error === 'function') {
                self.options.error(event);
            }
        });
    }
}

export default MeasureTool;