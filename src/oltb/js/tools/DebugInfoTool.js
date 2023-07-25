import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';
import { Config } from '../core/Config';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { LogManager } from '../core/managers/LogManager';
import { UrlManager } from '../core/managers/UrlManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../core/managers/ElementManager';
import { DebugInfoModal } from './modal-extensions/DebugInfoModal';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';

const FILENAME = 'tools/DebugInfoTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';

const DefaultOptions = Object.freeze({
    onlyWhenGetParameter: false,
    onInitiated: undefined,
    onClicked: undefined
});

/**
 * About:
 * Show debug information and event log
 * 
 * Description: 
 * Errors happen and when they do this tool is a good place to start. 
 * Check browser version, status in localStorage and a complete log of what happened in different parts of the Map.
 */
class DebugInfoTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.bug.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `Debug Info (${ShortcutKeys.debugInfoTool})`
            },
            listeners: {
                'click': this.onClickTool.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);

        this.button = button;
        this.debugInfoModal = undefined;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        
        this.initDebugState();

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));

        // Note: Consumer callback
        if(this.options.onInitiated instanceof Function) {
            this.options.onInitiated();
        }
    }

    // -------------------------------------------------------------------
    // # Section: Init Helpers
    // -------------------------------------------------------------------

    initDebugState() {
        const isDebug = UrlManager.getParameter(Config.urlParameter.debug) === 'true';
        if(!isDebug && this.options.onlyWhenGetParameter) {
            this.button.classList.add(`${CLASS_TOOL_BUTTON}--hidden`);
        }
    }

    // -------------------------------------------------------------------
    // # Section: Tool Control
    // -------------------------------------------------------------------

    onClickTool(event) {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');

        this.momentaryActivation();

        // Note: Consumer callback
        if(this.options.onClicked instanceof Function) {
            this.options.onClicked();
        }
    }

    momentaryActivation() {
        if(this.debugInfoModal) {
            return;
        }

        this.showDebugInfoModal();
    }

    // -------------------------------------------------------------------
    // # Section: Browser Events
    // -------------------------------------------------------------------

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.debugInfoTool)) {
            this.onHandleClick(event);
        }
    }

    // -------------------------------------------------------------------
    // # Section: Tool Actions
    // -------------------------------------------------------------------

    showDebugInfoModal() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        this.debugInfoModal = new DebugInfoModal({
            map: map,
            onClose: () => {
                this.debugInfoModal = undefined;
            }
        });
    }
}

export { DebugInfoTool };