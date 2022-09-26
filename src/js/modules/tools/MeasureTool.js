import Draw from 'ol/interaction/Draw';
import Overlay from 'ol/Overlay';
import LayerManager from '../core/Managers/LayerManager';
import SettingsManager from '../core/Managers/SettingsManager';
import StateManager from '../core/Managers/StateManager';
import TooltipManager from '../core/Managers/TooltipManager';
import DOM from '../helpers/Browser/DOM';
import { Control } from 'ol/control';
import { Fill, Stroke, Circle, Style } from 'ol/style';
import { TOOLBOX_ELEMENT, TOOLBAR_ELEMENT } from '../core/ElementReferences';
import { eventDispatcher } from '../helpers/Browser/EventDispatcher';
import { getMeasureTooltipCoordinates, getMeasureTooltipValue } from '../helpers/olFunctions/Measurements';
import { SVG_PATHS, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { setActiveTool } from '../helpers/ActiveTool';
import { unByKey } from 'ol/Observable';
import { SHORTCUT_KEYS } from '../helpers/Constants/ShortcutKeys';
import { EVENTS } from '../helpers/Constants/Events';

const LOCAL_STORAGE_NODE_NAME = 'measureTool';
const LOCAL_STORAGE_DEFAULTS = {
    collapsed: false,
    toolTypeIndex: 0,
    strokeColor: '#3B4352'
};

const DEFAULT_OPTIONS = {};

class MeasureTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.Measure,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Measure (${SHORTCUT_KEYS.Measure})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.button = button;
        this.active = false;
        this.options = { ...DEFAULT_OPTIONS, ...options };
        
        // Load potential stored data from localStorage
        const localStorageState = JSON.parse(StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME)) || {};
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...localStorageState };

        TOOLBOX_ELEMENT.insertAdjacentHTML('beforeend', `
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

        this.measureToolbox = document.querySelector('#oltb-measure-toolbox');
        this.strokeColor = this.measureToolbox.querySelector('#oltb-measure-stroke-color');
        this.toolType = this.measureToolbox.querySelector('#oltb-measure-type');
        this.toolType.selectedIndex = this.localStorage.toolTypeIndex;

        const toggleableTriggers = this.measureToolbox.querySelectorAll('.oltb-toggleable');
        toggleableTriggers.forEach((toggle) => {
            toggle.addEventListener(EVENTS.Browser.Click, (event) => {
                const targetName = toggle.dataset.oltbToggleableTarget;
                document.getElementById(targetName).slideToggle(200, (collapsed) => {
                    this.localStorage.collapsed = collapsed;
                    StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
                });
            });
        });

        this.toolType.addEventListener(EVENTS.Browser.Change, this.updateTool.bind(this));
        this.strokeColor.addEventListener(EVENTS.Custom.ColorChange, this.updateTool.bind(this));

        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(EVENTS.Custom.SettingsCleared, this.onWindowSettingsCleared.bind(this));
    }

    onWindowKeyUp(event) {
        const key = event.key.toLowerCase();

        if(key === 'escape') {
            if(this.interaction) {
                this.interaction.abortDrawing();
            }
        }else if(event.ctrlKey && key === 'z') {
            if(this.interaction) {
                this.interaction.removeLastPoint();
            }
        }else if(isShortcutKeyOnly(event, SHORTCUT_KEYS.Measure)) {
            this.handleClick(event);
        }
    }
    
    onWindowSettingsCleared() {
        this.localStorage = LOCAL_STORAGE_DEFAULTS;
    }

    updateTool() {
        // Store current values in local storage
        this.localStorage.toolTypeIndex = this.toolType.selectedIndex;
        this.localStorage.strokeColor = this.strokeColor.getAttribute('data-oltb-color');;

        StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));

        this.selectMeasureTool(
            this.toolType.value,
            this.strokeColor.getAttribute('data-oltb-color')
        );
    }

    // Called when the user activates a tool that cannot be used with this tool
    deSelect() {
        this.handleMeasure();
    }

    handleClick() {
        setActiveTool(this);
        this.handleMeasure();
    }

    handleMeasure() {
        if(this.active) {
            this.getMap().removeInteraction(this.interaction);

            // Remove this tool as the active global tool
            window.oltb.activeTool = null;
        }else {
            if(SettingsManager.getSetting('always.new.layers')) {
                LayerManager.addFeatureLayer('Measurements layer');
            }

            // Dispatch event to select a tooltype from the settings-box
            // The event then triggers the activation of the measure tool
            eventDispatcher([this.toolType], EVENTS.Browser.Change);
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
        
        this.styles = [
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
            style: this.styles
        });

        map.addInteraction(this.interaction);

        this.interaction.on(EVENTS.Ol.DrawStart, this.onDrawStart.bind(this));
        this.interaction.on(EVENTS.Ol.DrawEnd, this.onDrawEnd.bind(this));
        this.interaction.on(EVENTS.Ol.DrawAbort, this.onDrawAbort.bind(this));
        this.interaction.on(EVENTS.Ol.Error, this.onDrawEnd.bind(this));
    }

    onDrawStart(event) {
        const feature = event.feature;
        const tooltipItem = TooltipManager.push('measure');
        
        this.onChangeListener = feature.getGeometry().on(EVENTS.Ol.Change, (event) => {
            tooltipItem.innerHTML = getMeasureTooltipValue(event.target);
        });

        // User defined callback from constructor
        if(typeof this.options.start === 'function') {
            this.options.start(event);
        }
    }

    onDrawEnd(event) {
        unByKey(this.onChangeListener);

        const map = this.getMap();
        const feature = event.feature;
        feature.setStyle(this.styles);
        
        const poppedTooltip = TooltipManager.pop('measure');

        const tooltipWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-overlay-tooltip'
        });

        const tooltipItem = DOM.createElement({
            element: 'span',
            class: 'oltb-overlay-tooltip__item'
        });

        tooltipWrapper.appendChild(tooltipItem);

        const tooltipOverlay = new Overlay({
            element: tooltipWrapper,
            offset: [0, -7],
            positioning: 'bottom-center'
        });

        feature.setProperties({
            tooltipOverlay: tooltipOverlay
        });
        
        const geometry = feature.getGeometry();
        tooltipOverlay.setPosition(getMeasureTooltipCoordinates(geometry));
        tooltipItem.innerHTML = getMeasureTooltipValue(geometry);

        const layerWrapper = LayerManager.getActiveFeatureLayer({
            fallback: 'Measurements layer'
        });
        
        layerWrapper.layer.getSource().addFeature(feature);
        map.addOverlay(tooltipOverlay);

        // The layer might be hidden, check if the tooltip also should be hidden
        if(layerWrapper.layer.getVisible()) {
            tooltipOverlay.setMap(map);
        }else {
            tooltipOverlay.setMap(null);
        }

        // User defined callback from constructor
        if(typeof this.options.end === 'function') {
            this.options.end(event);
        }
    }

    onDrawAbort(event) {
        unByKey(this.onChangeListener);
        
        const tooltipItem = TooltipManager.pop('measure');

        // User defined callback from constructor
        if(typeof this.options.abort === 'function') {
            this.options.abort(event);
        }
    }

    onDrawError(event) {
        // User defined callback from constructor
        if(typeof this.options.error === 'function') {
            this.options.error(event);
        }
    }
}

export default MeasureTool;