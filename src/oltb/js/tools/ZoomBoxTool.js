import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';
import { Keys } from '../helpers/constants/Keys';
import { click } from 'ol/events/condition';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { DragZoom } from 'ol/interaction';
import { LogManager } from '../managers/LogManager';
import { ToolManager } from '../managers/ToolManager';
import { StateManager } from '../managers/StateManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ConfigManager } from '../managers/ConfigManager';
import { TooltipManager } from '../managers/TooltipManager';
import { ElementManager } from '../managers/ElementManager';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { TranslationManager } from '../managers/TranslationManager';

const FILENAME = 'tools/ZoomboxTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const KEY_TOOLTIP = 'tools.zoomboxTool';
const I18N_BASE = 'tools.zoomboxTool';
const OL_INTERNAL_OUT = 'out_';

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

const LocalStorageNodeName = LocalStorageKeys.zoomboxTool;
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
class ZoomboxTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.boundingBoxCircles.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N_BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.zoomboxTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.zoomboxTool})`,
                'data-oltb-i18n': `${I18N_BASE}.title`
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
        window.addEventListener(Events.custom.ready, this.onOLTBReady.bind(this));
        window.addEventListener(Events.custom.browserStateCleared, this.onWindowBrowserStateCleared.bind(this));

        // Note: 
        // @Consumer callback
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
            this.deactivateTool();
        }else {
            this.activateTool();
        }

        // Note: 
        // @Consumer callback
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

    deactivateTool() {
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

    deselectTool() {
        this.deactivateTool();
    }

    // -------------------------------------------------------------------
    // # Section: Browser Events
    // -------------------------------------------------------------------

    onOLTBReady(event) {
        if(this.localStorage.isActive) {
            this.activateTool();
        }
    }

    onWindowKeyUp(event) {
        this.isSpaceKeyPressed = false;

        // Note: 
        // Setting the internal OL variable
        // Option 1: Re-create the interaction to set the inverted out value
        // Option 2: Have two interactions that are swapped with one beeing active at the time
        this.interactionDragZoom[OL_INTERNAL_OUT] = false;

        if(isShortcutKeyOnly(event, ShortcutKeys.zoomboxTool)) {
            this.onClickTool(event);
        }
    }

    onWindowKeyDown(event) {
        const key = event.key;

        if(key === Keys.valueSpace) {
            this.isSpaceKeyPressed = true;
        }

        // Note: 
        // Setting the internal OL variable
        // Option 1: Re-create the interaction to set the inverted out value
        // Option 2: Have two interactions that are swapped with one beeing active at the time
        if(event.ctrlKey) {
            this.interactionDragZoom[OL_INTERNAL_OUT] = true;
        }
    }

    onWindowBrowserStateCleared() {
        this.doClearState();

        if(this.isActive) {
            this.deactivateTool();
        }

        // Note: 
        // @Consumer callback
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
        const duration = ConfigManager.getConfig().animationDuration.normal;
        
        return new DragZoom({
            duration: duration,           
            condition: (event) => {
                return click && !this.isSpaceKeyPressed;
            },
            out: false
        });
    }

    // -------------------------------------------------------------------
    // # Section: Tool DoActions
    // -------------------------------------------------------------------
    
    doClearState() {
        this.localStorage = _.cloneDeep(LocalStorageDefaults);
        StateManager.setStateObject(LocalStorageNodeName, LocalStorageDefaults);
    }

    doBoxDragStart(event) {
        // Note: 
        // @Consumer callback
        if(this.options.onStart instanceof Function) {
            this.options.onStart(event);
        }
    }

    doBoxDragEnd(event) {
        // Note: 
        // @Consumer callback
        if(this.options.onEnd instanceof Function) {
            this.options.onEnd(event);
        }
    }

    doBoxDragDrag(event) {
        // Note: 
        // @Consumer callback
        if(this.options.onDrag instanceof Function) {
            this.options.onDrag(event);
        }
    }

    doBoxDragCancel(event) {
        // Note: 
        // @Consumer callback
        if(this.options.onCancel instanceof Function) {
            this.options.onCancel(event);
        }
    }

    doBoxDragError(event) {
        // Note: 
        // @Consumer callback
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
        const i18n = TranslationManager.get(`${I18N_BASE}.tooltips`);

        this.tooltip = TooltipManager.push(KEY_TOOLTIP);
        this.tooltip.innerHTML = i18n.dragToZoom;
    }

    doRemoveTooltip() {
        TooltipManager.pop(KEY_TOOLTIP);
        this.tooltip = undefined;
    }
}

export { ZoomboxTool };