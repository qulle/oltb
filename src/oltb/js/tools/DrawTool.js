import { DOM } from '../helpers/browser/DOM';
import { Draw } from 'ol/interaction';
import { Keys } from '../helpers/constants/Keys';
import { Toast } from '../common/Toast';
import { Config } from '../core/Config';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { Settings } from '../helpers/constants/Settings';
import { LogManager } from '../core/managers/LogManager';
import { ToolManager } from '../core/managers/ToolManager';
import { StateManager } from '../core/managers/StateManager';
import { LayerManager } from '../core/managers/LayerManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../core/managers/ElementManager';
import { SettingsManager } from '../core/managers/SettingsManager';
import { eventDispatcher } from '../helpers/browser/EventDispatcher';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { FeatureProperties } from '../helpers/constants/FeatureProperties';
import { LinearRing, Polygon } from 'ol/geom';
import { isFeatureIntersectable } from '../helpers/IsFeatureIntersectable';
import { Fill, Stroke, Circle, Style } from 'ol/style';
import { createBox, createRegularPolygon } from 'ol/interaction/Draw';

const FILENAME = 'tools/DrawTool.js';
const ID_PREFIX = 'oltb-draw';

const DefaultOptions = Object.freeze({
    click: undefined,
    start: undefined,
    end: undefined,
    abort: undefined,
    error: undefined,
    intersected: undefined
});

const LocalStorageNodeName = LocalStorageKeys.drawTool;
const LocalStorageDefaults = Object.freeze({
    active: false,
    collapsed: false,
    toolType: 'Polygon',
    strokeWidth: '2.5',
    strokeColor: '#4A86B8FF',
    fillColor: '#D7E3FA80'
});

class DrawTool extends Control {
    constructor(options = {}) {
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.vectorPen.mixed,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Draw (${ShortcutKeys.drawTool})`
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
        this.intersectedFeatures = [];
        this.options = { ...DefaultOptions, ...options };

        // Load stored data from localStorage
        const localStorageState = StateManager.getStateObject(LocalStorageNodeName);
        this.localStorage = { ...LocalStorageDefaults, ...localStorageState };

        const toolboxElement = ElementManager.getToolboxElement();
        toolboxElement.insertAdjacentHTML('beforeend', `
            <div id="${ID_PREFIX}-toolbox" class="oltb-toolbox-section">
                <div class="oltb-toolbox-section__header">
                    <h4 class="oltb-toolbox-section__title oltb-toggleable" data-oltb-toggleable-target="${ID_PREFIX}-toolbox-collapsed">
                        Draw tool
                        <span class="oltb-toolbox-section__icon oltb-tippy" title="Toggle section"></span>
                    </h4>
                </div>
                <div class="oltb-toolbox-section__groups" id="${ID_PREFIX}-toolbox-collapsed" style="display: ${this.localStorage.collapsed ? 'none' : 'block'}">
                    <div class="oltb-toolbox-section__group">
                        <label class="oltb-label" for="${ID_PREFIX}-type">Shape</label>
                        <select id="${ID_PREFIX}-type" class="oltb-select">
                            <option value="Circle">Circle</option>
                            <option value="Square">Square</option>
                            <option value="Rectangle">Rectangle</option>
                            <option value="LineString">Line</option>
                            <option value="Point">Point</option>
                            <option value="Polygon">Polygon</option>
                        </select>
                    </div>
                    <div class="oltb-toolbox-section__group">
                        <label class="oltb-label" for="${ID_PREFIX}-intersection-enable">Intersection</label>
                        <select id="${ID_PREFIX}-intersection-enable" class="oltb-select">
                            <option value="false">False</option>
                            <option value="true">True</option>
                        </select>
                    </div>
                    <div class="oltb-toolbox-section__group">
                        <label class="oltb-label" for="${ID_PREFIX}-stroke-width">Stroke width</label>
                        <select id="${ID_PREFIX}-stroke-width" class="oltb-select">
                            <option value="1">1</option>
                            <option value="1.25">1.25</option>
                            <option value="1.5">1.5</option>
                            <option value="2">2</option>
                            <option value="2.5">2.5</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                            <option value="10">10</option>
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

        this.drawToolbox = document.querySelector(`#${ID_PREFIX}-toolbox`);

        const toggleableTriggers = this.drawToolbox.querySelectorAll('.oltb-toggleable');
        toggleableTriggers.forEach((toggle) => {
            toggle.addEventListener(Events.browser.click, this.onToggleToolbox.bind(this, toggle));
        });

        this.toolType = this.drawToolbox.querySelector(`#${ID_PREFIX}-type`);
        this.toolType.addEventListener(Events.browser.change, this.updateTool.bind(this));

        this.intersectionEnable = this.drawToolbox.querySelector(`#${ID_PREFIX}-intersection-enable`);
        this.intersectionEnable.addEventListener(Events.browser.change, this.updateTool.bind(this));

        this.fillColor = this.drawToolbox.querySelector(`#${ID_PREFIX}-fill-color`);
        this.fillColor.addEventListener(Events.custom.colorChange, this.updateTool.bind(this));

        this.strokeWidth = this.drawToolbox.querySelector(`#${ID_PREFIX}-stroke-width`);
        this.strokeWidth.addEventListener(Events.browser.change, this.updateTool.bind(this));

        this.strokeColor = this.drawToolbox.querySelector(`#${ID_PREFIX}-stroke-color`);
        this.strokeColor.addEventListener(Events.custom.colorChange, this.updateTool.bind(this));

        // Set default selected values
        this.toolType.value = this.localStorage.toolType;
        this.strokeWidth.value  = this.localStorage.strokeWidth;
        this.intersectionEnable.value = 'false';

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
        if(Boolean(this.localStorage.active)) {
            this.activateTool();
        }
    }

    isIntersectionEnabled() {
        return this.intersectionEnable.value.toLowerCase() === 'true';
    }

    onWindowKeyUp(event) {
        const key = event.key;

        if(key === Keys.valueEscape) {
            if(Boolean(this.interaction)) {
                this.interaction.abortDrawing();
            }
        }else if(Boolean(event.ctrlKey) && key === Keys.valueZ) {
            if(Boolean(this.interaction)) {
                this.interaction.removeLastPoint();
            }
        }else if(isShortcutKeyOnly(event, ShortcutKeys.drawTool)) {
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
        if(Boolean(this.active)) {
            this.updateTool();
        }
    }

    updateTool() {
        // Store current values in local storage
        this.localStorage.toolType = this.toolType.value;
        this.localStorage.strokeWidth = this.strokeWidth.value;
        this.localStorage.fillColor = this.fillColor.getAttribute('data-oltb-color');
        this.localStorage.strokeColor = this.strokeColor.getAttribute('data-oltb-color');;

        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);

        // IntersectionMode doesn't play well when tool is LineString or Point
        if(
            this.toolType.value === 'LineString' || 
            this.toolType.value === 'Point'
        ) {
            this.intersectionEnable.value = 'false';
            this.intersectionEnable.disabled = true;
        }else {
            this.intersectionEnable.disabled = false;
        }

        // Update the draw tool in the map
        this.selectDraw(
            this.toolType.value,
            this.strokeWidth.value,
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
        if(typeof this.options.click === 'function') {
            this.options.click();
        }

        if(Boolean(this.active)) {
            this.deActivateTool();
        }else {
            this.activateTool();
        }
    }

    activateTool() {
        this.active = true;
        this.drawToolbox.classList.add('oltb-toolbox-section--show');
        this.button.classList.add('oltb-tool-button--active');

        ToolManager.setActiveTool(this);

        if(SettingsManager.getSetting(Settings.alwaysNewLayers)) {
            LayerManager.addFeatureLayer('Drawing layer');
        }

        // Triggers activation of the tool
        eventDispatcher([this.toolType], Events.browser.change);

        this.localStorage.active = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deActivateTool() {
        const map = this.getMap();
        if(!Boolean(map)) {
            return;
        }

        this.active = false;
        this.drawToolbox.classList.remove('oltb-toolbox-section--show');
        this.button.classList.remove('oltb-tool-button--active');

        map.removeInteraction(this.interaction);
        this.interaction = undefined;

        ToolManager.removeActiveTool();

        this.localStorage.active = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    selectDraw(toolType, strokeWidth, fillColor, strokeColor) {
        const map = this.getMap();
        if(!Boolean(map)) {
            return;
        }

        // Remove previous interaction if tool is changed
        if(Boolean(this.interaction)) {
            map.removeInteraction(this.interaction);
        }

        this.style = new Style({
            image: new Circle({
                fill: new Fill({
                    color: fillColor
                }),
                stroke: new Stroke({
                    color: strokeColor,
                    width: strokeWidth
                }),
                radius: 5
            }),
            fill: new Fill({
                color: fillColor
            }),
            stroke: new Stroke({
                color: strokeColor,
                width: strokeWidth
            })
        });

        // A normal circle can not be serialized to json, approximated circle as polygon instead. 
        // Also use circle to create square and rectangle
        let geometryFunction = undefined;
        if(toolType === 'Square') {
            geometryFunction = createRegularPolygon(4);
            toolType = 'Circle';
        }else if(toolType === 'Rectangle') {
            geometryFunction = createBox();
            toolType = 'Circle';
        }else if(toolType === 'Circle') {
            geometryFunction = createRegularPolygon(32);
        }

        this.interaction = new Draw({
            type: toolType,
            style: this.style,
            stopClick: true,
            geometryFunction: geometryFunction
        });

        map.addInteraction(this.interaction);

        this.interaction.on(Events.openLayers.drawStart, this.onDrawStart.bind(this));
        this.interaction.on(Events.openLayers.drawEnd, this.onDrawEnd.bind(this));
        this.interaction.on(Events.openLayers.drawAbort, this.onDrawAbort.bind(this));
        this.interaction.on(Events.openLayers.error, this.onDrawError.bind(this));
    }

    onDrawStart(event) {
        // User defined callback from constructor
        if(typeof this.options.start === 'function') {
            this.options.start(event);
        }
    }

    onDrawEnd(event) {
        const layerWrapper = LayerManager.getActiveFeatureLayer({
            fallback: 'Drawing layer'
        });

        const layer = layerWrapper.getLayer();
        const source = layer.getSource();

        if(this.isIntersectionEnabled()) {
            this.onDrawEndIntersection(source, event);
        }else {
            this.onDrawEndNormal(source, event);
        }

        if(!layer.getVisible()) {
            Toast.info({
                title: 'Tip',
                message: 'You are drawing in a hidden layer', 
                autoremove: Config.autoRemovalDuation.normal
            });
        }
    }

    onDrawEndNormal(source, event) {
        const feature = event.feature;
        
        feature.setStyle(this.style);
        feature.setProperties({
            oltb: {
                type: FeatureProperties.type.drawing
            }
        });

        source.addFeature(feature);

        // User defined callback from constructor
        if(typeof this.options.end === 'function') {
            this.options.end(event);
        }
    }

    onDrawEndIntersection(source, event) {
        const feature = event.feature;
        const featureGeometry = feature.getGeometry();

        source.forEachFeatureIntersectingExtent(featureGeometry.getExtent(), (intersectedFeature) => {
            const type = intersectedFeature.getProperties()?.oltb?.type;
            const geometry = intersectedFeature.getGeometry();

            if(isFeatureIntersectable(type, geometry)) {
                this.intersectedFeatures.push(intersectedFeature);
            }
        });

        this.intersectedFeatures.forEach((intersected) => {
            const coordinates = intersected.getGeometry().getCoordinates();
            const geometry    = new Polygon(coordinates.slice(0, coordinates.length));
            const linearRing  = new LinearRing(featureGeometry.getCoordinates()[0]);

            geometry.appendLinearRing(linearRing);
            intersected.setGeometry(geometry);
        });

        if(this.intersectedFeatures.length === 0) {
            Toast.info({
                title: 'Oops',
                message: 'No intersecting objects found', 
                autoremove: Config.autoRemovalDuation.normal
            });
        }

        // User defined callback from constructor
        if(typeof this.options.intersected === 'function') {
            this.options.intersected(event, this.intersectedFeatures);
        }

        this.intersectedFeatures = [];
    }

    onDrawAbort(event) {
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

export { DrawTool };