import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';
import { click } from 'ol/events/condition';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { DragZoom } from 'ol/interaction';
import { LogManager } from '../core/managers/LogManager';
import { ToolManager } from '../core/managers/ToolManager';
import { StateManager } from '../core/managers/StateManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../core/managers/ElementManager';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { Config } from '../core/Config';

const FILENAME = 'tools/ZoomBoxTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';

const DefaultOptions = Object.freeze({
    onInitiated: undefined,
    onClicked: undefined,
    onBrowserStateCleared: undefined,
    onStart: undefined,
    onEnd: undefined,
    onDrag: undefined,
    onCancel: undefined,
    onError: undefined
});

const LocalStorageNodeName = LocalStorageKeys.zoomBoxTool;
const LocalStorageDefaults = Object.freeze({
    isActive: false
});

/**
 * About:
 * Zoom using dragging a bounding box
 * 
 * Description:
 * Increase or reduce zoom by dragging a bounding box selection. Hold down Ctrl to zoom out.
 */
class ZoomBoxTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.boundingBoxCircles.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `Zoom Box (${ShortcutKeys.zoomBoxTool})`
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

        this.interactionDragZoom = this.generateOLInteractionDragZoom();

        this.interactionDragZoom.on(Events.openLayers.boxStart, this.onStart.bind(this));
        this.interactionDragZoom.on(Events.openLayers.boxEnd, this.onEnd.bind(this));
        this.interactionDragZoom.on(Events.openLayers.boxDrag, this.onDrag.bind(this));
        this.interactionDragZoom.on(Events.openLayers.boxCancel, this.onCancel.bind(this));
        this.interactionDragZoom.on(Events.openLayers.error, this.onError.bind(this));

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(Events.browser.keyDown, this.onWindowKeyDown.bind(this));
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
        this.doAddDragZoom();

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
        this.doRemoveDragZoom();

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
        // Note: Setting the internal OL variable
        // Other solutions are to re-create the interaction or have two interactions that are swapped with one beeing active
        this.interactionDragZoom['out_'] = false;

        if(isShortcutKeyOnly(event, ShortcutKeys.zoomBoxTool)) {
            this.onClickTool(event);
        }
    }

    onWindowKeyDown(event) {
        if(event.ctrlKey) {
            // Note: Setting the internal OL variable
            // Other solutions are to re-create the interaction or have two interactions that are swapped with one beeing active
            this.interactionDragZoom['out_'] = true;
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

    onStart(event) {
        this.doStart(event);
    }

    onEnd(event) {
        this.doEnd(event);
    }

    onDrag(event) {
        this.doDrag(event);
    }

    onCancel(event) {
        this.doCancel(event);
    }

    onError(event) {
        this.doError(event);
    }

    // -------------------------------------------------------------------
    // # Section: Generator Helpers
    // -------------------------------------------------------------------

    generateOLInteractionDragZoom() {
        return new DragZoom({
            duration: Config.animationDuration.normal,           
            condition: (event) => {
                return click;
            },
            out: false
        });
    }

    // -------------------------------------------------------------------
    // # Section: Tool DoActions
    // -------------------------------------------------------------------
    
    doStart(event) {
        // Note: Consumer callback
        if(this.options.onStart instanceof Function) {
            this.options.onStart(event);
        }
    }

    doEnd(event) {
        // Note: Consumer callback
        if(this.options.onEnd instanceof Function) {
            this.options.onEnd(event);
        }
    }

    doDrag(event) {
        // Note: Consumer callback
        if(this.options.onDrag instanceof Function) {
            this.options.onDrag(event);
        }
    }

    doCancel(event) {
        // Note: Consumer callback
        if(this.options.onCancel instanceof Function) {
            this.options.onCancel(event);
        }
    }

    doError(event) {
        // Note: Consumer callback
        if(this.options.onError instanceof Function) {
            this.options.onError(event);
        }
    }

    doAddDragZoom() {
        this.getMap().addInteraction(this.interactionDragZoom);
    }

    doRemoveDragZoom() {
        this.getMap().removeInteraction(this.interactionDragZoom);
    }
}

export { ZoomBoxTool };