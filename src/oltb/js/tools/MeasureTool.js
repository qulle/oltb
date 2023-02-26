import { DOM } from '../helpers/browser/DOM';
import { Draw } from 'ol/interaction';
import { KEYS } from '../helpers/constants/Keys';
import { Toast } from '../common/Toast';
import { CONFIG } from '../core/Config';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { unByKey } from 'ol/Observable';
import { SETTINGS } from '../helpers/constants/Settings';
import { ToolManager } from '../core/managers/ToolManager';
import { LayerManager } from '../core/managers/LayerManager';
import { StateManager } from '../core/managers/StateManager';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { TooltipManager } from '../core/managers/TooltipManager';
import { SettingsManager } from '../core/managers/SettingsManager';
import { generateTooltip } from '../generators/GenerateTooltip';
import { eventDispatcher } from '../helpers/browser/EventDispatcher';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { FEATURE_PROPERTIES } from '../helpers/constants/FeatureProperties';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';
import { LOCAL_STORAGE_KEYS } from '../helpers/constants/LocalStorageKeys';
import { Fill, Stroke, Circle, Style } from 'ol/style';
import { TOOLBOX_ELEMENT, TOOLBAR_ELEMENT } from '../core/elements/index';
import { getMeasureCoordinates, getMeasureValue } from '../helpers/Measurements';

const FILENAME = 'tools/MeasureTool.js';
const ID_PREFIX = 'oltb-measure';
const DEFAULT_OPTIONS = Object.freeze({});

const LOCAL_STORAGE_NODE_NAME = LOCAL_STORAGE_KEYS.MeasureTool;
const LOCAL_STORAGE_DEFAULTS = Object.freeze({
    active: false,
    collapsed: false,
    toolTypeIndex: 0,
    strokeColor: '#3B4352',
    fillColor: '#D7E3FA80'
});

class MeasureTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.Rulers.Mixed,
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
        
        // Load stored data from localStorage
        const localStorageState = StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME);
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...localStorageState };

        TOOLBOX_ELEMENT.insertAdjacentHTML('beforeend', `
            <div id="${ID_PREFIX}-toolbox" class="oltb-toolbox-section">
                <div class="oltb-toolbox-section__header">
                    <h4 class="oltb-toolbox-section__title oltb-toggleable" data-oltb-toggleable-target="${ID_PREFIX}-toolbox-collapsed">
                        Measure tool
                        <span class="oltb-toolbox-section__icon oltb-tippy" title="Toggle section"></span>
                    </h4>
                </div>
                <div class="oltb-toolbox-section__groups" id="${ID_PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.collapsed ? 'none' : 'block'}">
                    <div class="oltb-toolbox-section__group">
                        <label class="oltb-label" for="${ID_PREFIX}-type">Type</label>
                        <select id="${ID_PREFIX}-type" class="oltb-select">
                            <option value="LineString">Length</option>
                            <option value="Polygon">Area</option>
                        </select>
                    </div>
                    <div class="oltb-toolbox-section__group">
                        <label class="oltb-label" for="${ID_PREFIX}-stroke-color">Stroke color</label>
                        <div id="${ID_PREFIX}-stroke-color" class="oltb-color-input oltb-color-tippy" data-oltb-color-target="#${ID_PREFIX}-stroke-color" data-oltb-color="${this.localStorage.strokeColor}" tabindex="0">
                            <div class="oltb-color-input__inner" style="background-color: ${this.localStorage.strokeColor};"></div>
                        </div>
                    </div>
                    <div class="oltb-toolbox-section__group">
                        <label class="oltb-label" for="${ID_PREFIX}-fill-color">Fill color</label>
                        <div id="${ID_PREFIX}-fill-color" class="oltb-color-input oltb-color-tippy" data-oltb-color-target="#${ID_PREFIX}-fill-color" data-oltb-color="${this.localStorage.fillColor}" tabindex="0">
                            <div class="oltb-color-input__inner" style="background-color: ${this.localStorage.fillColor};"></div>
                        </div>
                    </div>
                </div>
            </div>
        `);

        this.measureToolbox = document.querySelector(`#${ID_PREFIX}-toolbox`);

        const toggleableTriggers = this.measureToolbox.querySelectorAll('.oltb-toggleable');
        toggleableTriggers.forEach((toggle) => {
            toggle.addEventListener(EVENTS.Browser.Click, this.onToggleToolbox.bind(this, toggle));
        });

        this.toolType = this.measureToolbox.querySelector(`#${ID_PREFIX}-type`);
        this.toolType.addEventListener(EVENTS.Browser.Change, this.updateTool.bind(this));

        this.fillColor = this.measureToolbox.querySelector(`#${ID_PREFIX}-fill-color`);
        this.fillColor.addEventListener(EVENTS.Custom.ColorChange, this.updateTool.bind(this));

        this.strokeColor = this.measureToolbox.querySelector(`#${ID_PREFIX}-stroke-color`);
        this.strokeColor.addEventListener(EVENTS.Custom.ColorChange, this.updateTool.bind(this));

        // Set default selected values
        this.toolType.selectedIndex = this.localStorage.toolTypeIndex; 

        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(EVENTS.Custom.SettingsCleared, this.onWindowSettingsCleared.bind(this));
        window.addEventListener(EVENTS.Browser.ContentLoaded, this.onDOMContentLoaded.bind(this));
    }

    onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        document.getElementById(targetName).slideToggle(CONFIG.AnimationDuration.Fast, (collapsed) => {
            this.localStorage.collapsed = collapsed;
            StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, this.localStorage);
        });
    }

    onDOMContentLoaded() {
        if(this.localStorage.active) {
            this.activateTool();
        }
    }

    onWindowKeyUp(event) {
        const key = event.key.toLowerCase();

        if(key === KEYS.Escape) {
            if(this.interaction) {
                this.interaction.abortDrawing();
            }
        }else if(event.ctrlKey && key === KEYS.Z) {
            if(this.interaction) {
                this.interaction.removeLastPoint();
            }
        }else if(isShortcutKeyOnly(event, SHORTCUT_KEYS.Measure)) {
            this.handleClick(event);
        }
    }
    
    onWindowSettingsCleared() {
        // Update runtime copy of localStorage to default
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS };

        // Rest UI components
        this.fillColor.setAttribute('data-oltb-color', this.localStorage.fillColor);
        this.fillColor.firstElementChild.style.backgroundColor = this.localStorage.fillColor;

        this.strokeColor.setAttribute('data-oltb-color', this.localStorage.strokeColor);
        this.strokeColor.firstElementChild.style.backgroundColor = this.localStorage.strokeColor;

        // Update the tool to use the correct colors
        if(this.active) {
            this.updateTool();
        }
    }

    updateTool() {
        // Store current values in local storage
        this.localStorage.toolTypeIndex = this.toolType.selectedIndex;
        this.localStorage.fillColor = this.fillColor.getAttribute('data-oltb-color');
        this.localStorage.strokeColor = this.strokeColor.getAttribute('data-oltb-color');;

        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, this.localStorage);

        this.selectMeasure(
            this.toolType.value,
            this.fillColor.getAttribute('data-oltb-color'),
            this.strokeColor.getAttribute('data-oltb-color')
        );
    }

    deSelect() {
        this.deActivateTool();
    }

    handleClick() {
        // User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }
        
        if(this.active) {
            this.deActivateTool();
        }else {
            this.activateTool();
        }   
    }

    activateTool() {
        this.active = true;
        this.measureToolbox.classList.add('oltb-toolbox-section--show');
        this.button.classList.add('oltb-tool-button--active'); 

        ToolManager.setActiveTool(this);

        if(SettingsManager.getSetting(SETTINGS.AlwaysNewLayers)) {
            LayerManager.addFeatureLayer('Measurements layer');
        }

        // Triggers activation of the measure tool
        eventDispatcher([this.toolType], EVENTS.Browser.Change);

        this.localStorage.active = true;
        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, this.localStorage);
    }

    deActivateTool() {
        this.active = false;
        this.measureToolbox.classList.remove('oltb-toolbox-section--show');
        this.button.classList.remove('oltb-tool-button--active'); 

        this.getMap().removeInteraction(this.interaction);
        this.interaction = undefined;

        ToolManager.removeActiveTool();

        this.localStorage.active = false;
        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, this.localStorage);
    }

    selectMeasure(toolType, fillColor, strokeColor) {
        const map = this.getMap();

        // Remove previous interaction if tool is changed
        if(this.interaction) {
            map.removeInteraction(this.interaction);
        }
        
        this.styles = [
            new Style({
                image: new Circle({
                    fill: new Fill({
                        color: fillColor
                    }),
                    stroke: new Stroke({
                        color: strokeColor,
                        width: 2
                    }),
                    radius: 5
                }),
                fill: new Fill({
                    color: fillColor
                }),
                stroke: new Stroke({
                    color: strokeColor,
                    lineDash: [2, 5],
                    width: 2.5
                })
            })
        ];

        this.interaction = new Draw({
            type: toolType,
            stopClick: true,
            style: this.styles
        });

        map.addInteraction(this.interaction);

        this.interaction.on(EVENTS.OpenLayers.DrawStart, this.onDrawStart.bind(this));
        this.interaction.on(EVENTS.OpenLayers.DrawEnd, this.onDrawEnd.bind(this));
        this.interaction.on(EVENTS.OpenLayers.DrawAbort, this.onDrawAbort.bind(this));
        this.interaction.on(EVENTS.OpenLayers.Error, this.onDrawEnd.bind(this));
    }

    onDrawStart(event) {
        const feature = event.feature;
        const tooltipItem = TooltipManager.push('measure');
        
        this.onChangeListener = feature.getGeometry().on(EVENTS.OpenLayers.Change, (event) => {
            tooltipItem.innerHTML = getMeasureValue(event.target);
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
        const tooltip = generateTooltip();

        feature.setProperties({
            oltb: {
                type: FEATURE_PROPERTIES.Type.Measurement,
                tooltip: tooltip.getOverlay()
            }
        });
        
        const geometry = feature.getGeometry();
        tooltip.setPosition(getMeasureCoordinates(geometry));
        tooltip.setData(getMeasureValue(geometry));

        const layerWrapper = LayerManager.getActiveFeatureLayer({
            fallback: 'Measurements layer'
        });
        
        layerWrapper.layer.getSource().addFeature(feature);
        
        if(!layerWrapper.layer.getVisible()) {
            Toast.info({
                title: 'Tip',
                message: 'You are measuring in a hidden layer', 
                autoremove: CONFIG.AutoRemovalDuation.Normal
            });
        }

        map.addOverlay(tooltip.getOverlay());

        // The layer might be hidden, check if the tooltip also should be hidden
        if(layerWrapper.layer.getVisible()) {
            tooltip.getOverlay().setMap(map);
        }else {
            tooltip.getOverlay().setMap(null);
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

export { MeasureTool };