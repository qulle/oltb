import { DOM } from '../helpers/browser/DOM';
import { CONFIG } from '../core/Config';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { URLManager } from '../core/managers/URLManager';
import { PROJECTIONS } from '../epsg/Projections';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { DebugInfoModal } from './modal-extensions/DebugInfoModal';
import { TOOLBAR_ELEMENT } from '../core/elements/index';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';

const DEFAULT_OPTIONS = Object.freeze({
    onlyWhenGetParameter: false
});

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
        
        // If the tool only should be visible in debug mode (?debug=true)
        const isDebug = URLManager.getParameter('debug') === 'true';

        if(this.options.onlyWhenGetParameter) {
            if(!isDebug || isDebug !== true) {
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
        // User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }

        this.momentaryActivation();
    }

    momentaryActivation() {
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

export { DebugInfoTool };