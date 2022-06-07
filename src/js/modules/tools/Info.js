import 'ol/ol.css';
import EventType from 'ol/events/EventType';
import Modal from '../common/Modal';
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

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('data-tippy-content', 'Info (I)');
        button.className = 'oltb-tool-button';
        button.innerHTML = icon;
        button.addEventListener(
            EventType.CLICK,
            this.handleClick.bind(this),
            false
        );

        this.element.appendChild(button);
        this.options = {...DEFAULT_OPTIONS, ...options};

        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, 'i')) {
                this.handleClick(event);
            }
        });
    }

    handleClick(event) {
        event.preventDefault();
        Modal.create({
            title: this.options.title, 
            content: this.options.content
        });
    }
}

export default Info;