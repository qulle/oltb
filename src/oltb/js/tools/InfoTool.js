import DOM from '../helpers/Browser/DOM';
import Modal from '../common/Modal';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { TOOLBAR_ELEMENT } from '../core/elements/index';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { SVG_PATHS, getIcon } from '../core/icons/SVGIcons';

const DEFAULT_OPTIONS = {
    title: 'Hey!',
    content: 'This is the default content, try adding some content of your own.'
};

class InfoTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.Info,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Info (${SHORTCUT_KEYS.info})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.infoModal = undefined;
        this.options = { ...DEFAULT_OPTIONS, ...options };

        window.addEventListener(EVENTS.browser.keyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.info)) {
            this.handleClick(event);
        }
    }    

    handleClick() {
        // User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }

        this.momentaryActivation();
    }

    momentaryActivation() {
        if(this.infoModal) {
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

export default InfoTool;