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
const TOOL_BUTTON_CLASS = 'oltb-tool-button';

const DefaultOptions = Object.freeze({
    onlyWhenGetParameter: false,
    click: undefined
});

class DebugInfoTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.bug.stroked,
            class: `${TOOL_BUTTON_CLASS}__icon`
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: TOOL_BUTTON_CLASS,
            attributes: {
                type: 'button',
                'data-tippy-content': `Debug info (${ShortcutKeys.debugInfoTool})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);

        this.button = button;
        this.debugInfoModal = undefined;
        this.options = { ...DefaultOptions, ...options };
        
        // If the tool only should be visible in debug mode
        const isDebug = UrlManager.getParameter(Config.urlParameters.debug) === 'true';

        if(
            Boolean(this.options.onlyWhenGetParameter) &&
            !isDebug
        ) {
            button.classList.add(`${TOOL_BUTTON_CLASS}--hidden`);
        }

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.debugInfoTool)) {
            this.handleClick(event);
        }
    }

    handleClick() {
        LogManager.logDebug(FILENAME, 'handleClick', 'User clicked tool');
        
        // User defined callback from constructor
        if(this.options.click instanceof Function) {
            this.options.click();
        }

        this.momentaryActivation();
    }

    momentaryActivation() {
        if(this.debugInfoModal) {
            return;
        }

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