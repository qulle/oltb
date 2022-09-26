import LayerManager from '../core/Managers/LayerManager';
import SettingsManager from '../core/Managers/SettingsManager';
import StateManager from '../core/Managers/StateManager';
import DOM from '../helpers/Browser/DOM';
import Draw, { createBox, createRegularPolygon } from 'ol/interaction/Draw';
import { Control } from 'ol/control';
import { Fill, Stroke, Circle, Style } from 'ol/style';
import { TOOLBOX_ELEMENT, TOOLBAR_ELEMENT } from '../core/ElementReferences';
import { eventDispatcher } from '../helpers/Browser/EventDispatcher';
import { SVG_PATHS, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { setActiveTool } from '../helpers/ActiveTool';
import { SHORTCUT_KEYS } from '../helpers/Constants/ShortcutKeys';
import { EVENTS } from '../helpers/Constants/Events';

const LOCAL_STORAGE_NODE_NAME = 'drawTool';
const LOCAL_STORAGE_DEFAULTS = {
    collapsed: false,
    toolTypeIndex: 5,
    strokeColor: '#4A86B8',
    strokeWidth: 2,
    fillColor: '#FFFFFFFF'
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
        this.options = { ...DEFAULT_OPTIONS, ...options };

        // Load potential stored data from localStorage
        const localStorageState = JSON.parse(StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME)) || {};
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...localStorageState };

        TOOLBOX_ELEMENT.insertAdjacentHTML('beforeend', `
            <div id="oltb-drawing-tool-box" class="oltb-toolbox-section">
                <div class="oltb-toolbox-section__header">
                    <h4 class="oltb-toolbox-section__title oltb-toggleable" data-oltb-toggleable-target="oltb-drawing-toolbox-collapsed">
                        Drawing tool
                        <span class="oltb-toolbox-section__icon oltb-tippy" title="Toggle section"></span>
                    </h4>
                </div>
                <div class="oltb-toolbox-section__groups" id="oltb-drawing-toolbox-collapsed" style="display: ${this.localStorage.collapsed ? 'none' : 'block'}">
                    <div class="oltb-toolbox-section__group">
                        <label class="oltb-label" for="oltb-draw-type">Shape</label>
                        <select id="oltb-draw-type" class="oltb-select">
                            <option value="Circle">Circle</option>
                            <option value="Square">Square</option>
                            <option value="Rectangle">Rectangle</option>
                            <option value="LineString">Line</option>
                            <option value="Point">Point</option>
                            <option value="Polygon" selected>Polygon</option>
                        </select>
                    </div>
                    <div class="oltb-toolbox-section__group">
                        <label class="oltb-label" for="oltb-draw-stroke-width">Stroke width</label>
                        <select id="oltb-draw-stroke-width" class="oltb-select">
                            <option value="1">1</option>
                            <option value="1.25">1.25</option>
                            <option value="1.5">1.5</option>
                            <option value="2">2</option>
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
                        <label class="oltb-label" for="oltb-draw-stroke-color">Stroke color</label>
                        <div id="oltb-draw-stroke-color" class="oltb-color-input oltb-color-tippy" data-oltb-color-target="#oltb-draw-stroke-color" data-oltb-color="${this.localStorage.strokeColor}" tabindex="0">
                            <div class="oltb-color-input__inner" style="background-color: ${this.localStorage.strokeColor};"></div>
                        </div>
                    </div>
                    <div class="oltb-toolbox-section__group">
                        <label class="oltb-label" for="oltb-draw-fill-color">Fill color</label>
                        <div id="oltb-draw-fill-color" class="oltb-color-input oltb-color-tippy" data-oltb-color-target="#oltb-draw-fill-color" data-oltb-color="${this.localStorage.fillColor}" tabindex="0">
                            <div class="oltb-color-input__inner" style="background-color: ${this.localStorage.fillColor};"></div>
                        </div>
                    </div>
                </div>
            </div>
        `);

        this.drawToolbox = document.querySelector('#oltb-drawing-tool-box');

        const toggleableTriggers = this.drawToolbox.querySelectorAll('.oltb-toggleable');
        toggleableTriggers.forEach((toggle) => {
            toggle.addEventListener(EVENTS.Browser.Click, (event) => {
                const targetName = toggle.dataset.oltbToggleableTarget;
                document.getElementById(targetName).slideToggle(200, (collapsed) => {
                    this.localStorage.collapsed = collapsed;
                    StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
                });
            });
        });

        this.toolType = this.drawToolbox.querySelector('#oltb-draw-type');
        this.toolType.addEventListener(EVENTS.Browser.Change, this.updateTool.bind(this));

        this.fillColor = this.drawToolbox.querySelector('#oltb-draw-fill-color');
        this.fillColor.addEventListener(EVENTS.Custom.ColorChange, this.updateTool.bind(this));

        this.strokeWidth = this.drawToolbox.querySelector('#oltb-draw-stroke-width');
        this.strokeWidth.addEventListener(EVENTS.Browser.Change, this.updateTool.bind(this));

        this.strokeColor = this.drawToolbox.querySelector('#oltb-draw-stroke-color');
        this.strokeColor.addEventListener(EVENTS.Custom.ColorChange, this.updateTool.bind(this));

        this.toolType.selectedIndex = this.localStorage.toolTypeIndex;
        this.strokeWidth.selectedIndex = this.localStorage.strokeWidth;

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
        }else if(isShortcutKeyOnly(event, SHORTCUT_KEYS.Draw)) {
            this.handleClick(event);
        }
    }

    onWindowSettingsCleared() {
        this.localStorage = LOCAL_STORAGE_DEFAULTS;
    }

    updateTool() {
        // Store current values in local storage
        this.localStorage.toolTypeIndex = this.toolType.selectedIndex;
        this.localStorage.fillColor = this.fillColor.getAttribute('data-oltb-color');
        this.localStorage.strokeWidth = this.strokeWidth.selectedIndex;
        this.localStorage.strokeColor = this.strokeColor.getAttribute('data-oltb-color');;

        StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));

        // Update the draw tool in the map
        this.selectDrawTool(
            this.toolType.value,
            this.fillColor.getAttribute('data-oltb-color'),
            this.strokeWidth.value,
            this.strokeColor.getAttribute('data-oltb-color')
        );
    }

    // Called when the user activates a tool that cannot be used with this tool
    deSelect() {
        this.handleDraw();
    }

    handleClick() {
        setActiveTool(this);
        this.handleDraw();
    }

    handleDraw() {
        if(this.active) {
            this.getMap().removeInteraction(this.interaction);

            // Remove this tool as the active global tool
            window.oltb.activeTool = null;
        }else {
            if(SettingsManager.getSetting('always.new.layers')) {
                LayerManager.addFeatureLayer('Drawing layer');
            }

            // Dispatch event to select a tooltype from the settings-box
            // The event then triggers the activation of the draw tool
            eventDispatcher([this.toolType], EVENTS.Browser.Change);
        }

        this.active = !this.active;
        this.drawToolbox.classList.toggle('oltb-toolbox-section--show');
        this.button.classList.toggle('oltb-tool-button--active');
    }

    selectDrawTool(toolType, fillColor, strokeWidth, strokeColor) {
        const map = this.getMap();

        // Remove previous interaction if tool is changed
        if(this.interaction) {
            map.removeInteraction(this.interaction);
        }

        const stroke = new Stroke({
            color: strokeColor,
            width: strokeWidth
        });

        const style = new Style({
            image: new Circle({
                fill: new Fill({
                    color: fillColor
                }),
                stroke: stroke,
                radius: 5
            }),
            fill: new Fill({
                color: fillColor
            }),
            stroke: stroke
        });

        // A normal circle can not be serialized to json, approximated circle as polygon instead. 
        // Also use circle to create square and rectangle
        let geometryFunction = null;
        if(toolType === 'Square') {
            geometryFunction = createRegularPolygon(4);
            toolType = 'Circle';
        }else if(toolType === 'Rectangle') {
            geometryFunction = createBox();
            toolType = 'Circle';
        }else if(toolType === 'Circle') {
            geometryFunction = createRegularPolygon();
        }

        this.interaction = new Draw({
            type: toolType,
            style: style,
            geometryFunction: geometryFunction
        });

        map.addInteraction(this.interaction);

        this.interaction.on(EVENTS.Ol.DrawStart, (event) => {
            // User defined callback from constructor
            if(typeof this.options.start === 'function') {
                this.options.start(event);
            }
        });

        this.interaction.on(EVENTS.Ol.DrawEnd, (event) => {
            const feature = event.feature;
            feature.setStyle(style);

            const layerWrapper = LayerManager.getActiveFeatureLayer({
                fallback: 'Drawing layer'
            });
            
            layerWrapper.layer.getSource().addFeature(feature);

            // User defined callback from constructor
            if(typeof this.options.end === 'function') {
                this.options.end(event);
            }
        });

        this.interaction.on(EVENTS.Ol.DrawAbort, (event) => {
            // User defined callback from constructor
            if(typeof this.options.abort === 'function') {
                this.options.abort(event);
            }
        });

        this.interaction.on(EVENTS.Ol.Error, (event) => {
            // User defined callback from constructor
            if(typeof this.options.error === 'function') {
                this.options.error(event);
            }
        });
    }
}

export default DrawTool;