import Modal from '../common/Modal';
import DOM from '../helpers/Browser/DOM';
import { Control } from 'ol/control';
import { TOOLBAR_ELEMENT } from '../core/ElementReferences';
import { SVG_PATHS, getIcon } from '../core/SVGIcons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { EVENTS } from '../helpers/constants/Events';

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
        // Note: User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }

        this.handleInfo();
    }

    handleInfo() {
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