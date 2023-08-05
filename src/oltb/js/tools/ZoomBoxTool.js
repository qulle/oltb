import _, { uniqueId } from 'lodash';
import { DOM } from '../helpers/browser/DOM';
import { Keys } from '../helpers/constants/Keys';
import { click } from 'ol/events/condition';
import { Config } from '../core/Config';
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
import { TooltipManager } from '../core/managers/TooltipManager';

const FILENAME = 'tools/ZoomBoxTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const KEY_TOOLTIP = 'tool.zoombox';

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
 * Note that this tools functionality is also available by pressing Shift + Drag without having the tool active.
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
        this.isSpaceKeyPressed = false;
        this.tooltip = undefined;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        this.interactionDragZoom = this.generateOLInteractionDragZoom();

        this.interactionDragZoom.on(Events.openLayers.boxStart, this.onBoxDragStart.bind(this));
        this.interactionDragZoom.on(Events.openLayers.boxEnd, this.onBoxDragEnd.bind(this));
        this.interactionDragZoom.on(Events.openLayers.boxDrag, this.onBoxDragDrag.bind(this));
        this.interactionDragZoom.on(Events.openLayers.boxCancel, this.onBoxDragCancel.bind(this));
        this.interactionDragZoom.on(Events.openLayers.error, this.onBoxDragError.bind(this));

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(Events.browser.keyDown, this.onWindowKeyDown.bind(this));
        window.addEventListener(Events.browser.contentLoaded, this.onDOMContentLoaded.bind(this));
        window.addEventListener(Events.custom.browserStateCleared, this.onWindowBrowserStateCleared.bind(this));

        // Note: Consumer callback
        if(this.options.onInitiated instanceof Function) {
            this.options.onInitiated();
        }
    }

    getName() {
        return FILENAME;
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
        this.doAddTooltip();

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
        this.doRemoveTooltip();

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
        this.isSpaceKeyPressed = false;

        // Note: Setting the internal OL variable
        // Option 1: Re-create the interaction to set the inverted out value
        // Option 2: Have two interactions that are swapped with one beeing active at the time
        this.interactionDragZoom['out_'] = false;

        if(isShortcutKeyOnly(event, ShortcutKeys.zoomBoxTool)) {
            this.onClickTool(event);
        }
    }

    onWindowKeyDown(event) {
        const key = event.key;

        if(key === Keys.valueSpace) {
            this.isSpaceKeyPressed = true;
        }

        // Note: Setting the internal OL variable
        // Option 1: Re-create the interaction to set the inverted out value
        // Option 2: Have two interactions that are swapped with one beeing active at the time
        if(event.ctrlKey) {
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

    onBoxDragStart(event) {
        this.doBoxDragStart(event);
    }

    onBoxDragEnd(event) {
        this.doBoxDragEnd(event);
    }

    onBoxDragDrag(event) {
        this.doBoxDragDrag(event);
    }

    onBoxDragCancel(event) {
        this.doBoxDragCancel(event);
    }

    onBoxDragError(event) {
        this.doBoxDragError(event);
    }

    // -------------------------------------------------------------------
    // # Section: Generator Helpers
    // -------------------------------------------------------------------

    generateOLInteractionDragZoom() {
        return new DragZoom({
            duration: Config.animationDuration.normal,           
            condition: (event) => {
                return click && !this.isSpaceKeyPressed;
            },
            out: false
        });
    }

    // -------------------------------------------------------------------
    // # Section: Tool DoActions
    // -------------------------------------------------------------------
    
    doBoxDragStart(event) {
        // Note: Consumer callback
        if(this.options.onStart instanceof Function) {
            this.options.onStart(event);
        }
    }

    doBoxDragEnd(event) {
        // Note: Consumer callback
        if(this.options.onEnd instanceof Function) {
            this.options.onEnd(event);
        }
    }

    doBoxDragDrag(event) {
        // Note: Consumer callback
        if(this.options.onDrag instanceof Function) {
            this.options.onDrag(event);
        }
    }

    doBoxDragCancel(event) {
        // Note: Consumer callback
        if(this.options.onCancel instanceof Function) {
            this.options.onCancel(event);
        }
    }

    doBoxDragError(event) {
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

    doAddTooltip() {
        this.tooltip = TooltipManager.push(KEY_TOOLTIP);
        this.tooltip.innerHTML = 'Drag To Zoom';
    }

    doRemoveTooltip() {
        TooltipManager.pop(KEY_TOOLTIP);
        this.tooltip = undefined;
    }
}

export { ZoomBoxTool };