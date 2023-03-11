import { DOM } from '../helpers/browser/DOM';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { LogManager } from '../core/managers/LogManager';
import { UrlManager } from '../core/managers/UrlManager';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../core/managers/ElementManager';
import { DebugInfoModal } from './modal-extensions/DebugInfoModal';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';

const FILENAME = 'tools/DebugInfoTool.js';
const DEFAULT_OPTIONS = Object.freeze({
    onlyWhenGetParameter: false,
    click: undefined
});

class DebugInfoTool extends Control {
    constructor(options = {}) {
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SVG_PATHS.Bug.Stroked,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Debug info (${SHORTCUT_KEYS.DebugInfo})`
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
        this.options = { ...DEFAULT_OPTIONS, ...options };
        
        // If the tool only should be visible in debug mode (?debug=true)
        const isDebug = UrlManager.getParameter('debug') === 'true';

        if(
            Boolean(this.options.onlyWhenGetParameter) &&
            !Boolean(isDebug)
        ) {
            button.classList.add('oltb-tool-button--hidden');
        }

        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.DebugInfo)) {
            this.handleClick(event);
        }
    }

    handleClick() {
        LogManager.logDebug(FILENAME, 'handleClick', 'User clicked tool');
        
        // User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }

        this.momentaryActivation();
    }

    momentaryActivation() {
        if(Boolean(this.debugInfoModal)) {
            return;
        }

        const map = this.getMap();
        if(!Boolean(map)) {
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