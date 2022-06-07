import 'ol/ol.css';
import EventType from 'ol/events/EventType';
import Toast from '../common/Toast';
import { Control } from 'ol/control';
import { toolbarElement } from '../core/ElementReferences';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';

const DEFAULT_OPTIONS = {
    url: 'https://github.com/qulle/oltb',
    target: '_blank'
};

class Help extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.Help,
            class: 'oltb-tool-button__icon'
        });

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('data-tippy-content', 'Help (J)');
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
            if(isShortcutKeyOnly(event, 'j')) {
                this.handleClick(event);
            }
        });
    }

    handleClick(event) {
        event.preventDefault();
        try {
            window.open(this.options.url, this.options.target).focus();
        }catch(error) {
            Toast.info({text: 'Action was blocked by browser, try open with mouse'});
        }
    }
}

export default Help;