import DebugInfoModal from './ModalExtensions/DebugInfoModal';
import DOM from '../helpers/Browser/DOM';
import { Control } from 'ol/control';
import { toolbarElement } from '../core/ElementReferences';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { URIGet } from '../helpers/Browser/URIGet';
import { projections } from '../epsg/Projections';
import { SHORTCUT_KEYS } from '../helpers/Constants/ShortcutKeys';
import { EVENTS } from '../helpers/Constants/Events';

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
                'data-tippy-content': `Debug info (${SHORTCUT_KEYS.DebugInfo})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.debugInfoModal = undefined;
        this.options = { ...DEFAULT_OPTIONS, ...options };
        
        // Check if the tool only should be visible if the get parameter ?debug=true exists
        const debugParameter = URIGet('debug') === 'true';

        if(this.options.showWhenGetParameter) {
            if(!debugParameter || debugParameter !== true) {
                button.classList.add('oltb-tool-button--hidden');
            }
        }

        window.addEventListener(EVENTS.Browser.KeyUp, (event) => {
            if(isShortcutKeyOnly(event, SHORTCUT_KEYS.DebugInfo)) {
                this.handleClick(event);
            }
        });
    }

    handleClick() {
        if(this.debugInfoModal) {
            return;
        }

        const map = this.getMap();
        const view = map.getView();

        const information = {
            zoom: view.getZoom(),
            location: view.getCenter(),
            rotation: view.getRotation(),
            projection: view.getProjection(),
            proj4Defs: projections
        };

        this.debugInfoModal = new DebugInfoModal({
            map: map,
            information: information,
            onClose: () => {
                this.debugInfoModal = undefined;
            }
        });
    }
}

export default DebugInfo;