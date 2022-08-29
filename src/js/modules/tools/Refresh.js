import 'ol/ol.css';
import EventType from 'ol/events/EventType';
import DOM from '../helpers/Browser/DOM';
import { Control } from 'ol/control';
import { toolbarElement } from '../core/ElementReferences';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';

class Refresh extends Control {
    constructor() {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.Refresh,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': 'Refresh page (R)'
            }
        });

        button.addEventListener(
            EventType.CLICK,
            this.handleClick.bind(this),
            false
        );

        this.element.appendChild(button);

        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, 'r')) {
                this.handleClick(event);
            }
        });
    }

    handleClick(event) {
        event.preventDefault();
        window.location.reload();
    }
}

export default Refresh;