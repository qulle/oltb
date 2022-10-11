import CONFIG from '../core/Config';
import DebugInfoModal from './modal-extensions/DebugInfoModal';
import URLManager from '../core/managers/URLManager';
import DOM from '../helpers/Browser/DOM';
import { Control } from 'ol/control';
import { TOOLBAR_ELEMENT } from '../core/ElementReferences';
import { SVG_PATHS, getIcon } from '../core/SVGIcons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { PROJECTIONS } from '../epsg/Projections';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { EVENTS } from '../helpers/constants/Events';

const DEFAULT_OPTIONS = {
    showWhenGetParameter: false
};

class DebugInfoTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.Debug,
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
        const debugParameter = URLManager.getParameter('debug') === 'true';

        if(this.options.showWhenGetParameter) {
            if(!debugParameter || debugParameter !== true) {
                button.classList.add('oltb-tool-button--hidden');
            }
        }

        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.DebugInfo)) {
            this.handleClick(event);
        }
    }

    handleClick() {
        // Note: User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }

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
            proj4Defs: PROJECTIONS,
            defaultConfig: CONFIG
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

export default DebugInfoTool;