import LayerManager from '../core/managers/LayerManager';
import SettingsManager from '../core/managers/SettingsManager';
import StateManager from '../core/managers/StateManager';
import ToolManager from '../core/managers/ToolManager';
import Toast from '../common/Toast';
import DOM from '../helpers/Browser/DOM';
import Draw, { createBox, createRegularPolygon } from 'ol/interaction/Draw';
import { Control } from 'ol/control';
import { Fill, Stroke, Circle, Style } from 'ol/style';
import { TOOLBOX_ELEMENT, TOOLBAR_ELEMENT } from '../core/ElementReferences';
import { eventDispatcher } from '../helpers/Browser/EventDispatcher';
import { SVG_PATHS, getIcon } from '../core/SVGIcons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { EVENTS } from '../helpers/constants/Events';
import { SETTINGS } from '../helpers/constants/Settings';
import { LinearRing, Polygon } from 'ol/geom';
import { isFeatureIntersectable } from '../helpers/IsFeatureIntersectable';
import { FEATURE_PROPERTIES } from '../helpers/constants/FeatureProperties';

const ID_PREFIX = 'oltb-draw';

const LOCAL_STORAGE_NODE_NAME = 'drawTool';
const LOCAL_STORAGE_DEFAULTS = {
    active: false,
    collapsed: false,
    toolTypeIndex: 5,
    strokeWidthIndex: 4,
    strokeColor: '#4A86B8',
    fillColor: '#D7E3FA80'
};

const DEFAULT_OPTIONS = {};

class DrawTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.Pen,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Draw (${SHORTCUT_KEYS.Draw})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.button = button;
        this.active = false;
        this.intersectedFeatures = [];
        this.options = { ...DEFAULT_OPTIONS, ...options };

        // Load potential stored data from localStorage
        const localStorageState = JSON.parse(StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME)) || {};
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...localStorageState };

        TOOLBOX_ELEMENT.insertAdjacentHTML('beforeend', `
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
                            <option value="false" selected>False</option>
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
            toggle.addEventListener(EVENTS.Browser.Click, this.onToggleToolbox.bind(this, toggle));
        });

        this.toolType = this.drawToolbox.querySelector(`#${ID_PREFIX}-type`);
        this.toolType.addEventListener(EVENTS.Browser.Change, this.updateTool.bind(this));

        this.intersectionEnable = this.drawToolbox.querySelector(`#${ID_PREFIX}-intersection-enable`);
        this.intersectionEnable.addEventListener(EVENTS.Browser.Change, this.updateTool.bind(this));

        this.fillColor = this.drawToolbox.querySelector(`#${ID_PREFIX}-fill-color`);
        this.fillColor.addEventListener(EVENTS.Custom.ColorChange, this.updateTool.bind(this));

        this.strokeWidth = this.drawToolbox.querySelector(`#${ID_PREFIX}-stroke-width`);
        this.strokeWidth.addEventListener(EVENTS.Browser.Change, this.updateTool.bind(this));

        this.strokeColor = this.drawToolbox.querySelector(`#${ID_PREFIX}-stroke-color`);
        this.strokeColor.addEventListener(EVENTS.Custom.ColorChange, this.updateTool.bind(this));

        // Set default selected values
        this.toolType.selectedIndex = this.localStorage.toolTypeIndex;
        this.strokeWidth.selectedIndex  = this.localStorage.strokeWidthIndex;

        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(EVENTS.Custom.SettingsCleared, this.onWindowSettingsCleared.bind(this));
        window.addEventListener(EVENTS.Browser.DOMContentLoaded, this.onDOMContentLoaded.bind(this));
    }

    onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        document.getElementById(targetName).slideToggle(200, (collapsed) => {
            this.localStorage.collapsed = collapsed;
            StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
        });
    }

    onDOMContentLoaded() {
        // Re-activate tool if it was active before the application was reloaded
        if(this.localStorage.active) {
            this.activateTool();
        }
    }

    isIntersectionEnabled() {
        return this.intersectionEnable.value.toLowerCase() === 'true';
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
        }else if(isShortcutKeyOnly(event, SHORTCUT_KEYS.Draw)) {
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
        this.localStorage.strokeWidthIndex = this.strokeWidth.selectedIndex;
        this.localStorage.fillColor = this.fillColor.getAttribute('data-oltb-color');
        this.localStorage.strokeColor = this.strokeColor.getAttribute('data-oltb-color');;

        StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));

        // IntersectionMode doesn't play well when tool is LineString or Point
        if(this.toolType.value === 'LineString' || this.toolType.value === 'Point') {
            this.intersectionEnable.selectedIndex = 0;
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
        // Note: User defined callback from constructor
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
        this.drawToolbox.classList.add('oltb-toolbox-section--show');
        this.button.classList.add('oltb-tool-button--active');

        ToolManager.setActiveTool(this);

        if(SettingsManager.getSetting(SETTINGS.AlwaysNewLayers)) {
            LayerManager.addFeatureLayer('Drawing layer');
        }

        // Triggers activation of the draw tool
        eventDispatcher([this.toolType], EVENTS.Browser.Change);

        this.localStorage.active = true;
        StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
    }

    deActivateTool() {
        this.active = false;
        this.drawToolbox.classList.remove('oltb-toolbox-section--show');
        this.button.classList.remove('oltb-tool-button--active');

        this.getMap().removeInteraction(this.interaction);
        this.interaction = undefined;

        ToolManager.removeActiveTool();

        this.localStorage.active = false;
        StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
    }

    selectDraw(toolType, strokeWidth, fillColor, strokeColor) {
        const map = this.getMap();

        // Remove previous interaction if tool is changed
        if(this.interaction) {
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

        // Note: A normal circle can not be serialized to json, approximated circle as polygon instead. 
        // Also use circle to create square and rectangle
        let geometryFunction = null;
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

        this.interaction.on(EVENTS.Ol.DrawStart, this.onDrawStart.bind(this));
        this.interaction.on(EVENTS.Ol.DrawEnd, this.onDrawEnd.bind(this));
        this.interaction.on(EVENTS.Ol.DrawAbort, this.onDrawAbort.bind(this));
        this.interaction.on(EVENTS.Ol.Error, this.onDrawError.bind(this));
    }

    onDrawStart(event) {
        // Note: User defined callback from constructor
        if(typeof this.options.start === 'function') {
            this.options.start(event);
        }
    }

    onDrawEnd(event) {
        const layerWrapper = LayerManager.getActiveFeatureLayer({
            fallback: 'Drawing layer'
        });

        const source = layerWrapper.layer.getSource();

        if(this.isIntersectionEnabled()) {
            this.onDrawEndIntersection(source, event);
        }else {
            this.onDrawEndNormal(source, event);
        }

        if(!layerWrapper.layer.getVisible()) {
            Toast.info({text: 'You are drawing in a hidden layer', autoremove: 4000});
        }
    }

    onDrawEndNormal(source, event) {
        const feature = event.feature;
        
        feature.setStyle(this.style);
        feature.setProperties({
            oltb: {
                type: FEATURE_PROPERTIES.type.drawing
            }
        });

        source.addFeature(feature);

        // Note: User defined callback from constructor
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
            Toast.info({text: 'No intersecting objects found', autoremove: 4000});
        }

        // Note: User defined callback from constructor
        if(typeof this.options.intersected === 'function') {
            this.options.intersected(event, this.intersectedFeatures);
        }

        this.intersectedFeatures = [];
    }

    onDrawAbort(event) {
        // Note: User defined callback from constructor
        if(typeof this.options.abort === 'function') {
            this.options.abort(event);
        }
    }

    onDrawError(event) {
        // Note: User defined callback from constructor
        if(typeof this.options.error === 'function') {
            this.options.error(event);
        }
    }
}

export default DrawTool;