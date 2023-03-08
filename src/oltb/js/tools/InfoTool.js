import { DOM } from '../helpers/browser/DOM';
import { Modal } from '../common/Modal';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { LogManager } from '../core/managers/LogManager';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { TOOLBAR_ELEMENT } from '../core/elements/index';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';

const FILENAME = 'tools/InfoTool.js';
const DEFAULT_OPTIONS = Object.freeze({
    title: 'Hey!',
    content: 'This is the default content, try adding some content of your own.',
    click: undefined
});

class InfoTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.InfoCircle.Stroked,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Info (${SHORTCUT_KEYS.Info})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.infoModal = undefined;
        this.options = { ...DEFAULT_OPTIONS, ...options };

        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.Info)) {
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
        if(Boolean(this.infoModal)) {
            return;
        }

        this.infoModal = Modal.create({
            title: this.options.title, 
            content: this.options.content,
            onClose: () => {
                this.infoModal = undefined;
            }
        });
    }
}

export { InfoTool };