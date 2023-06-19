import { DOM } from '../helpers/browser/DOM';
import { Draw } from 'ol/interaction';
import { Keys } from '../helpers/constants/Keys';
import { Toast } from '../common/Toast';
import { Config } from '../core/Config';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { unByKey } from 'ol/Observable';
import { Settings } from '../helpers/constants/Settings';
import { LogManager } from '../core/managers/LogManager';
import { ToolManager } from '../core/managers/ToolManager';
import { GeometryType } from '../core/ol-types/GeometryType';
import { LayerManager } from '../core/managers/LayerManager';
import { StateManager } from '../core/managers/StateManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../core/managers/ElementManager';
import { TooltipManager } from '../core/managers/TooltipManager';
import { generateTooltip } from '../generators/GenerateTooltip';
import { SettingsManager } from '../core/managers/SettingsManager';
import { eventDispatcher } from '../helpers/browser/EventDispatcher';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { FeatureProperties } from '../helpers/constants/FeatureProperties';
import { Fill, Stroke, Circle, Style } from 'ol/style';
import { getMeasureCoordinates, getMeasureValue } from '../helpers/Measurements';

const FILENAME = 'tools/MeasureTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const CLASS_TOOLBOX_SECTION = 'oltb-toolbox-section';
const ID_PREFIX = 'oltb-measure';
const KEY_TOOLTIP = 'measure';

const DefaultOptions = Object.freeze({
    click: undefined,
    start: undefined,
    end: undefined,
    abort: undefined,
    error: undefined
});

const LocalStorageNodeName = LocalStorageKeys.measureTool;
const LocalStorageDefaults = Object.freeze({
    active: false,
    collapsed: false,
    toolType: GeometryType.LineString,
    strokeColor: '#3B4352FF',
    fillColor: '#D7E3FA80'
});

class MeasureTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.rulers.mixed,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                type: 'button',
                'data-tippy-content': `Measure (${ShortcutKeys.measureTool})`
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
        
        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        const toolboxElement = ElementManager.getToolboxElement();
        toolboxElement.insertAdjacentHTML('beforeend', `
            <div id="${ID_PREFIX}-toolbox" class="${CLASS_TOOLBOX_SECTION}">
                <div class="${CLASS_TOOLBOX_SECTION}__header">
                    <h4 class="${CLASS_TOOLBOX_SECTION}__title oltb-toggleable" data-oltb-toggleable-target="${ID_PREFIX}-toolbox-collapsed">
                        Measure tool
                        <span class="${CLASS_TOOLBOX_SECTION}__icon oltb-tippy" title="Toggle section"></span>
                    </h4>
                </div>
                <div class="${CLASS_TOOLBOX_SECTION}__groups" id="${ID_PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.collapsed ? 'none' : 'block'}">
                    <div class="${CLASS_TOOLBOX_SECTION}__group">
                        <label class="oltb-label" for="${ID_PREFIX}-type">Type</label>
                        <select id="${ID_PREFIX}-type" class="oltb-select">
                            <option value="LineString">Length</option>
                            <option value="Polygon">Area</option>
                        </select>
                    </div>
                    <div class="${CLASS_TOOLBOX_SECTION}__group">
                        <label class="oltb-label" for="${ID_PREFIX}-stroke-color">Stroke color</label>
                        <div id="${ID_PREFIX}-stroke-color" class="oltb-color-input oltb-color-tippy" data-oltb-color-target="#${ID_PREFIX}-stroke-color" data-oltb-color="${this.localStorage.strokeColor}" tabindex="0">
                            <div class="oltb-color-input__inner" style="background-color: ${this.localStorage.strokeColor};"></div>
                        </div>
                    </div>
                    <div class="${CLASS_TOOLBOX_SECTION}__group">
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
            toggle.addEventListener(Events.browser.click, this.onToggleToolbox.bind(this, toggle));
        });

        this.toolType = this.measureToolbox.querySelector(`#${ID_PREFIX}-type`);
        this.toolType.addEventListener(Events.browser.change, this.updateTool.bind(this));

        this.fillColor = this.measureToolbox.querySelector(`#${ID_PREFIX}-fill-color`);
        this.fillColor.addEventListener(Events.custom.colorChange, this.updateTool.bind(this));

        this.strokeColor = this.measureToolbox.querySelector(`#${ID_PREFIX}-stroke-color`);
        this.strokeColor.addEventListener(Events.custom.colorChange, this.updateTool.bind(this));

        // Set default selected values
        this.toolType.value = this.localStorage.toolType; 

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(Events.custom.settingsCleared, this.onWindowSettingsCleared.bind(this));
        window.addEventListener(Events.browser.contentLoaded, this.onDOMContentLoaded.bind(this));
    }

    onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        document.getElementById(targetName)?.slideToggle(Config.animationDuration.fast, (collapsed) => {
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
        const key = event.key;

        if(key === Keys.valueEscape) {
            if(this.interaction) {
                this.interaction.abortDrawing();
            }
        }else if(Boolean(event.ctrlKey) && key === Keys.valueZ) {
            if(this.interaction) {
                this.interaction.removeLastPoint();
            }
        }else if(isShortcutKeyOnly(event, ShortcutKeys.measureTool)) {
            this.handleClick(event);
        }
    }
    
    onWindowSettingsCleared() {
        // Update runtime copy of localStorage to default
        this.localStorage = { ...LocalStorageDefaults };

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
        this.localStorage.toolType = this.toolType.value;
        this.localStorage.fillColor = this.fillColor.getAttribute('data-oltb-color');
        this.localStorage.strokeColor = this.strokeColor.getAttribute('data-oltb-color');

        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);

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
        LogManager.logDebug(FILENAME, 'handleClick', 'User clicked tool');

        // User defined callback from constructor
        if(this.options.click instanceof Function) {
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
        this.measureToolbox.classList.add(`${CLASS_TOOLBOX_SECTION}--show`);
        this.button.classList.add(`${CLASS_TOOL_BUTTON}--active`); 

        ToolManager.setActiveTool(this);

        if(SettingsManager.getSetting(Settings.alwaysNewLayers)) {
            LayerManager.addFeatureLayer({
                name: 'Measurements layer'
            });
        }

        // Triggers activation of the measure tool
        eventDispatcher([this.toolType], Events.browser.change);

        this.localStorage.active = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deActivateTool() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        this.active = false;
        this.measureToolbox.classList.remove(`${CLASS_TOOLBOX_SECTION}--show`);
        this.button.classList.remove(`${CLASS_TOOL_BUTTON}--active`); 

        map.removeInteraction(this.interaction);
        this.interaction = undefined;

        ToolManager.removeActiveTool();

        this.localStorage.active = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    selectMeasure(toolType, fillColor, strokeColor) {
        const map = this.getMap();
        if(!map) {
            return;
        }

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

        this.interaction.on(Events.openLayers.drawStart, this.onDrawStart.bind(this));
        this.interaction.on(Events.openLayers.drawEnd, this.onDrawEnd.bind(this));
        this.interaction.on(Events.openLayers.drawAbort, this.onDrawAbort.bind(this));
        this.interaction.on(Events.openLayers.error, this.onDrawEnd.bind(this));
    }

    onDrawStart(event) {
        const feature = event.feature;
        const tooltipItem = TooltipManager.push(KEY_TOOLTIP);
        
        this.onChangeListener = feature.getGeometry().on(Events.openLayers.change, (event) => {
            const measureValue = getMeasureValue(event.target);
            tooltipItem.innerHTML = `${measureValue.value} ${measureValue.unit}`;
        });

        // User defined callback from constructor
        if(this.options.start instanceof Function) {
            this.options.start(event);
        }
    }

    onDrawEnd(event) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        unByKey(this.onChangeListener);

        const feature = event.feature;
        feature.setStyle(this.styles);
        
        TooltipManager.pop(KEY_TOOLTIP);
        const tooltip = generateTooltip();

        feature.setProperties({
            oltb: {
                type: FeatureProperties.type.measurement,
                tooltip: tooltip.getOverlay()
            }
        });
        
        const geometry = feature.getGeometry();
        tooltip.setPosition(getMeasureCoordinates(geometry));
        
        const measureValue = getMeasureValue(geometry);
        tooltip.setData(`${measureValue.value} ${measureValue.unit}`);

        const layerWrapper = LayerManager.getActiveFeatureLayer({
            fallback: 'Measurements layer'
        });
        
        const layer = layerWrapper.getLayer();
        layer.getSource().addFeature(feature);
        
        if(!layer.getVisible()) {
            Toast.info({
                title: 'Tip',
                message: 'You are measuring in a hidden layer', 
                autoremove: Config.autoRemovalDuation.normal
            });
        }

        map.addOverlay(tooltip.getOverlay());

        // The layer might be hidden, check if the tooltip also should be hidden
        if(layer.getVisible()) {
            tooltip.getOverlay().setMap(map);
        }else {
            tooltip.getOverlay().setMap(null);
        }

        // User defined callback from constructor
        if(this.options.end instanceof Function) {
            this.options.end(event);
        }
    }

    onDrawAbort(event) {
        unByKey(this.onChangeListener);
        
        TooltipManager.pop(KEY_TOOLTIP);

        // User defined callback from constructor
        if(this.options.abort instanceof Function) {
            this.options.abort(event);
        }
    }

    onDrawError(event) {
        // User defined callback from constructor
        if(this.options.error instanceof Function) {
            this.options.error(event);
        }
    }
}

export { MeasureTool };