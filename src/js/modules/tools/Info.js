import Modal from '../common/Modal';
import DOM from '../helpers/Browser/DOM';
import { Control } from 'ol/control';
import { toolbarElement } from '../core/ElementReferences';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';

const DEFAULT_OPTIONS = {
    title: 'Hey!',
    content: 'This is the default content, try adding some content of your own.'
};

class Info extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.Info,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': 'Info (I)'
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.infoModal = undefined;
        this.options = { ...DEFAULT_OPTIONS, ...options };

        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, 'i')) {
                this.handleClick(event);
            }
        });
    }

    handleClick() {
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

export default Info;