import 'ol/ol.css';
import EventType from 'ol/events/EventType';
import { Control, ScaleLine } from 'ol/control';
import { toolbarElement } from '../core/ElementReferences';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';

class ScaleLineTool extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.ScaleLine,
            class: 'oltb-tool-button__icon'
        });

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('data-tippy-content', 'Scale line (K)');
        button.className = 'oltb-tool-button';
        button.innerHTML = icon;
        button.addEventListener(
            EventType.CLICK,
            this.handleClick.bind(this),
            false
        );

        this.element.appendChild(button);
        this.button = button;
        this.active = false;
        this.scaleLine = null;

        const { units = 'metric' } = options;
        this.units = units;

        this.scaleLine = new ScaleLine({units: this.units});
        
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