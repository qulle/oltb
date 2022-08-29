import 'ol/ol.css';
import EventType from 'ol/events/EventType';
import DOM from '../helpers/Browser/DOM';
import { Control, ScaleLine } from 'ol/control';
import { toolbarElement } from '../core/ElementReferences';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';

const DEFAULT_OPTIONS = {
    units: 'metric'
};

class ScaleLineTool extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.ScaleLine,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': 'Scale line (K)'
            }
        });

        button.addEventListener(
            EventType.CLICK,
            this.handleClick.bind(this),
            false
        );

        this.element.appendChild(button);
        this.button = button;
        this.active = false;
        this.scaleLine = null;
        this.options = { ...DEFAULT_OPTIONS, ...options };

        this.scaleLine = new ScaleLine({units: this.options.units});
        
        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, 'k')) {
                this.handleClick(event);
            }
        });
    }

    handleClick(event) {
        event.preventDefault();

        if(this.active) {
            this.scaleLine.setMap(null);
        }else {
            this.scaleLine.setMap(this.getMap());
        }

        this.active = !this.active;
        this.button.classList.toggle('oltb-tool-button--active');
    }
}

export default ScaleLineTool;