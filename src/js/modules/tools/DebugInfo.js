import DebugInfoModal from './ModalExtensions/DebugInfoModal';
import DOM from '../helpers/Browser/DOM';
import { Control } from 'ol/control';
import { toolbarElement } from '../core/ElementReferences';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { URIGet } from '../helpers/Browser/URIGet';

const DEFAULT_OPTIONS = {
    showWhenGetParameter: false
};

class DebugInfo extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.Debug,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': 'Debug info (Y)'
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.options = { ...DEFAULT_OPTIONS, ...options };
        
        // Check if the tool only should be visible if the get parameter ?debug=true exists
        const debugParameter = URIGet('debug') === 'true';

        if(this.options.showWhenGetParameter) {
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

    handleClick() {
        const map = this.getMap();
        const view = map.getView();

        const information = {
            zoom: view.getZoom(),
            location: view.getCenter(),
            rotation: view.getRotation(),
            projection: view.getProjection()
        };

        const debugInfoModal = new DebugInfoModal(map, information);
    }
}

export default DebugInfo;