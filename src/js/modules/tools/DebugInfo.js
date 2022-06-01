import 'ol/ol.css';
import DebugInfoModal from './ModalExtensions/DebugInfoModal';
import EventType from 'ol/events/EventType';
import { Control } from 'ol/control';
import { toolbarElement } from '../core/ElementReferences';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { URIGet } from '../helpers/Browser/URIGet';

class DebugInfo extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.Debug,
            class: 'oltb-tool-button__icon'
        });

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('data-tippy-content', 'Debug info (Y)');
        button.className = 'oltb-tool-button';
        button.innerHTML = icon;
        button.addEventListener(
            EventType.CLICK,
            this.handleClick.bind(this),
            false
        );

        this.element.appendChild(button);
        
        // Check if the tool only should be visible if the get parameter ?debug=true exists
        const debugParameter = URIGet('debug') === 'true';

        if(options.showWhenGetParameter) {
            if(!debugParameter || debugParameter !== true) {
                button.classList.add('oltb-tool-button--hidden');
            }
        }

        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, 'y')) {
                this.handleClick(event);
            }
        });
    }

    handleClick(event) {
        event.preventDefault();

        // Gather debug information
        const map = this.getMap();
        const view = map.getView();

        const information = {
            zoom: view.getZoom(),
            location: view.getCenter(),
            rotation: view.getRotation(),
            projection: view.getProjection()
        };

        new DebugInfoModal(map, information);
    }
}

export default DebugInfo;