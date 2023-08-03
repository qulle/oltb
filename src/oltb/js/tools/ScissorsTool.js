import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';
import { Keys } from '../helpers/constants/Keys';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { Draw, Snap } from 'ol/interaction';
import { LogManager } from '../core/managers/LogManager';
import { ToolManager } from '../core/managers/ToolManager';
import { StateManager } from '../core/managers/StateManager';
import { GeometryType } from '../core/ol-types/GeometryType';
import { LayerManager } from '../core/managers/LayerManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../core/managers/ElementManager';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { Fill, Stroke, Circle, Style } from 'ol/style';

const FILENAME = 'tools/ScissorsTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';

const DefaultOptions = Object.freeze({
    strokeWidth: '2.5',
    strokeColor: '#0166A5FF',
    fillColor: '#D7E3FAFF',
    onInitiated: undefined,
    onClicked: undefined,
    onBrowserStateCleared: undefined,
    onStart: undefined,
    onEnd: undefined,
    onAbort: undefined,
    onError: undefined
});

const LocalStorageNodeName = LocalStorageKeys.scissorsTool;
const LocalStorageDefaults = Object.freeze({
    isActive: false
});

/**
 * About:
 * Cut polygon shapes in smaller parts
 * 
 * Description:
 * Draw a line to cut polygon shapes in half.
 */
class ScissorsTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.scissors.filled,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `Polygon Scissors (${ShortcutKeys.scissorsTool})`
            },
            listeners: {
                'click': this.onClickTool.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);
        
        this.button = button;
        this.isActive = false;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        this.interactionDraw = this.generateOLInteractionDraw();
        this.interactionSnap = this.generateOLInteractionSnap();

        this.interactionDraw.on(Events.openLayers.drawStart, this.onDrawStart.bind(this));
        this.interactionDraw.on(Events.openLayers.drawEnd, this.onDrawEnd.bind(this));
        this.interactionDraw.on(Events.openLayers.drawAbort, this.onDrawAbort.bind(this));
        this.interactionDraw.on(Events.openLayers.error, this.onDrawError.bind(this));

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(Events.browser.contentLoaded, this.onDOMContentLoaded.bind(this));
        window.addEventListener(Events.custom.browserStateCleared, this.onWindowBrowserStateCleared.bind(this));

        // Note: Consumer callback
        if(this.options.onInitiated instanceof Function) {
            this.options.onInitiated();
        }
    }

    // -------------------------------------------------------------------
    // # Section: Tool Control
    // -------------------------------------------------------------------

    onClickTool(event) {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');

        if(this.isActive) {
            this.deActivateTool();
        }else {
            this.activateTool();
        }

        // Note: Consumer callback
        if(this.options.onClicked instanceof Function) {
            this.options.onClicked();
        }
    }

    activateTool() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        ToolManager.setActiveTool(this);
        this.doAddDrawInteraction();
        this.doAddSnapInteraction();

        this.isActive = true;
        this.button.classList.add(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.isActive = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deActivateTool() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        ToolManager.removeActiveTool();
        this.doRemoveDrawInteraction();
        this.doRemoveSnapInteraction();

        this.isActive = false;
        this.button.classList.remove(`${CLASS_TOOL_BUTTON}--active`);

        this.localStorage.isActive = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deSelectTool() {
        this.deActivateTool();
    }

    // -------------------------------------------------------------------
    // # Section: Browser Events
    // -------------------------------------------------------------------

    onDOMContentLoaded() {
        if(this.localStorage.isActive) {
            this.activateTool();
        }
    }

    onWindowKeyUp(event) {
        const key = event.key;

        if(key === Keys.valueEscape) {
            if(this.interactionDraw) {
                this.interactionDraw.abortDrawing();
            }
        }else if(event.ctrlKey && key === Keys.valueZ) {
            if(this.interactionDraw) {
                this.interactionDraw.removeLastPoint();
            }
        }else if(isShortcutKeyOnly(event, ShortcutKeys.scissorsTool)) {
            this.onClickTool(event);
        }
    }

    onWindowBrowserStateCleared() {
        if(this.isActive) {
            this.deActivateTool();
        }

        // Note: Consumer callback
        if(this.options.onBrowserStateClear instanceof Function) {
            this.options.onBrowserStateClear();
        }
    }

    // -------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    // -------------------------------------------------------------------

    onDrawStart(event) {
        this.doDrawStart(event);
    }

    onDrawEnd(event) {
        this.doDrawEnd(event);
    }

    onDrawAbort(event) {
        this.doDrawAbort(event);
    }

    onDrawError(event) {
        this.doDrawError(event);
    }

    // -------------------------------------------------------------------
        // # Section: Generator Helpers
    // -------------------------------------------------------------------

    generateOLInteractionDraw() {
        const style = this.generateOLStyleObject();

        return new Draw({
            type: GeometryType.LineString,
            stopClick: true,
            style: style
        });
    }

    generateOLInteractionSnap() {
        const features = LayerManager.getSnapFeatures();

        return new Snap({
            features: features
        });
    }

    generateOLStyleObject() {
        return new Style({
            image: new Circle({
                fill: new Fill({
                    color: this.options.fillColor
                }),
                stroke: new Stroke({
                    color: this.options.strokeColor,
                    width: this.options.strokeWidth
                }),
                radius: 5
            }),
            fill: new Fill({
                color: this.options.fillColor
            }),
            stroke: new Stroke({
                color: this.options.strokeColor,
                width: this.options.strokeWidth
            })
        });
    }

    // -------------------------------------------------------------------
    // # Section: Tool DoActions
    // -------------------------------------------------------------------
    
    doDrawStart(event) {
        // Note: Consumer callback
        if(this.options.onStart instanceof Function) {
            this.options.onStart(event);
        }
    }

    doDrawEnd(event) {
        // Note: Consumer callback
        if(this.options.onEnd instanceof Function) {
            this.options.onEnd(event);
        }
    }

    doDrawAbort(event) {
        // Note: Consumer callback
        if(this.options.onAbort instanceof Function) {
            this.options.onAbort(event);
        }
    }

    doDrawError(event) {
        // Note: Consumer callback
        if(this.options.onError instanceof Function) {
            this.options.onError(event);
        }
    }

    doAddDrawInteraction() {
        this.getMap().addInteraction(this.interactionDraw);
    }

    doRemoveDrawInteraction() {
        this.getMap().removeInteraction(this.interactionDraw);
    }

    doAddSnapInteraction() {
        this.getMap().addInteraction(this.interactionSnap);
    }

    doRemoveSnapInteraction() {
        this.getMap().removeInteraction(this.interactionSnap);
    }
}

export { ScissorsTool };