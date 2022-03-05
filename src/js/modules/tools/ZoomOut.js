import 'ol/ol.css';
import EventType from 'ol/events/EventType';
import Config from '../core/Config';
import { Control } from 'ol/control';
import { easeOut } from 'ol/easing';
import { toolbarElement } from '../core/ElementReferences';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';

class ZoomOut extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.ZoomOut,
            class: 'oltb-tool-button__icon'
        });

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('data-tippy-content', 'Zoom out (W)');
        button.className = 'oltb-tool-button';
        button.innerHTML = icon;
        button.addEventListener(
            EventType.CLICK,
            this.handleClick.bind(this),
            false
        );

        this.element.appendChild(button);
        this.options = options;
        this.delta = -1;

        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, 'w')) {
                this.handleZoomByDelta();
            }
        });
    }

    handleClick(event) {
        event.preventDefault();
        this.handleZoomByDelta();
    }

    handleZoomByDelta() {
        const view = this.getMap().getView();

        const currentZoom = view.getZoom();
        const newZoom = view.getConstrainedZoom(currentZoom + this.delta);
            
        if(view.getAnimating()) {
            view.cancelAnimations();
        }

        view.animate({
            zoom: newZoom,
            duration: Config.animationDuration,
            easing: easeOut
        });

        setTimeout(() => {
            // User defined callback from constructor
            if(typeof this.options.zoomed === 'function') {
                this.options.zoomed();
            }
        }, Config.animationDuration);
    }
}

export default ZoomOut;