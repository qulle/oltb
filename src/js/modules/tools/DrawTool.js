import 'ol/ol.css';
import LayerManager from '../core/Managers/LayerManager';
import SettingsManager from '../core/Managers/SettingsManager';
import EventType from 'ol/events/EventType';
import StateManager from '../core/Managers/StateManager';
import Draw, { createBox, createRegularPolygon } from 'ol/interaction/Draw';
import { Control } from 'ol/control';
import { Fill, Stroke, Circle, Style } from 'ol/style';
import { toolboxElement, toolbarElement } from '../core/ElementReferences';
import { eventDispatcher } from '../helpers/EventDispatcher';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';

class DrawTool extends Control {
    constructor(callbacksObj = {}) {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.Pen,
            class: 'oltb-tool-button__icon'
        });

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('data-tippy-content', 'Draw (P)');
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
        let lsSettings = JSON.parse(StateManager.getStateObject('drawTool')) || {};

        const lsDrawType = 'drawType' in lsSettings ? lsSettings['drawType'] : '5';
        const lsStrokeColor = 'strokeColor' in lsSettings ? lsSettings['strokeColor'] : '#4A86B8';
        const lsStrokeWidth = 'strokeWidth' in lsSettings ? lsSettings['strokeWidth'] : '2';
        const lsFillColor = 'fillColor' in lsSettings ? lsSettings['fillColor'] : '#FFFFFFFF';

        toolboxElement.insertAdjacentHTML('beforeend', `
            <div id="oltb-drawing-tool-box" class="oltb-toolbox-section">
                <div class="oltb-toolbox-section__group">
                    <h4 class="oltb-toolbox-section__title">Drawing tool</h4>
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
                    <div id="oltb-draw-stroke-color" class="oltb-color-input oltb-color-tippy" data-oltb-color-target="#oltb-draw-stroke-color" data-oltb-color="${lsStrokeColor}" tabindex="0">
                        <div class="oltb-color-input__inner" style="background-color: ${lsStrokeColor};"></div>
                    </div>
                </div>
                <div class="oltb-toolbox-section__group">
                    <label class="oltb-label" for="oltb-draw-fill-color">Fill color</label>
                    <div id="oltb-draw-fill-color" class="oltb-color-input oltb-color-tippy" data-oltb-color-target="#oltb-draw-fill-color" data-oltb-color="${lsFillColor}" tabindex="0">
                        <div class="oltb-color-input__inner" style="background-color: ${lsFillColor};"></div>
                    </div>
                </div>
            </div>
        `);

        const drawToolbox = document.querySelector('#oltb-drawing-tool-box');
        const toolType = drawToolbox.querySelector('#oltb-draw-type');
        const fillColor = drawToolbox.querySelector('#oltb-draw-fill-color');
        const strokeWidth = drawToolbox.querySelector('#oltb-draw-stroke-width');
        const strokeColor = drawToolbox.querySelector('#oltb-draw-stroke-color');

        toolType.addEventListener('change', () => updateTool());
        fillColor.addEventListener('color-change', () => updateTool());
        strokeWidth.addEventListener('change', () => updateTool());
        strokeColor.addEventListener('color-change', () => updateTool());

        toolType.selectedIndex = lsDrawType;
        strokeWidth.selectedIndex = lsStrokeWidth;

        const updateTool = () => {
            // Store current values in local storage
            lsSettings['drawType'] = toolType.selectedIndex;
            lsSettings['fillColor'] = fillColor.getAttribute('data-oltb-color');
            lsSettings['strokeWidth'] = strokeWidth.selectedIndex;
            lsSettings['strokeColor'] = strokeColor.getAttribute('data-oltb-color');;

            StateManager.updateStateObject('drawTool', JSON.stringify(lsSettings));

            // Update the draw tool in the map
            this.selectDrawTool(
                toolType.value,
                fillColor.getAttribute('data-oltb-color'),
                strokeWidth.value,
                strokeColor.getAttribute('data-oltb-color')
            );
        }

        this.drawToolbox = drawToolbox;
        this.toolType = toolType;

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
            }else if(isShortcutKeyOnly(event, 'p')) {
                this.handleClick(event);
            }
        });

        window.addEventListener('oltb.settings.cleared', () => {
            lsSettings = {};
        });
    }

    // Called when user changes to another tool that first must deselect/cleanup this tool
    deSelect() {
        this.handleDraw();
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

        this.handleDraw();
    }

    handleDraw() {
        if(this.active) {
            this.getMap().removeInteraction(this.interaction);

            // Remove this tool as the active global tool
            window.oltb.activeTool = null;
        }else {
            if(SettingsManager.getSetting('alwaysNewLayers')) {
                LayerManager.addFeatureLayer('Drawing layer');
            }

            // Dispatch event to select a tooltype from the settings-box
            // The event then triggers the activation of the draw tool
            eventDispatcher([this.toolType], 'change');
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

        const self = this;

        this.interaction.on('drawstart', function(event) {
            // User defined callback from constructor
            if(typeof self.callbacksObj.start === 'function') {
                self.callbacksObj.start(event);
            }
        });

        this.interaction.on('drawend', function(event) {
            const feature = event.feature;
            feature.setStyle(style);

            const layer = LayerManager.getActiveFeatureLayer({ifNoLayerName: 'Drawing layer'}).layer;
            layer.getSource().addFeature(feature);

            // User defined callback from constructor
            if(typeof self.callbacksObj.end === 'function') {
                self.callbacksObj.end(event);
            }
        });

        this.interaction.on('drawabort', function(event) {
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

export default DrawTool;