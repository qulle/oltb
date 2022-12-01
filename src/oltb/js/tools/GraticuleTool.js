import DOM from '../helpers/Browser/DOM';
import Stroke from 'ol/style/Stroke';
import Graticule from 'ol/layer/Graticule';
import StateManager from '../core/managers/StateManager';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { TOOLBAR_ELEMENT } from '../core/ElementReferences';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { SVG_PATHS, getIcon } from '../core/SVGIcons';
import { LOCAL_STORAGE_KEYS } from '../helpers/constants/LocalStorageKeys';

const LOCAL_STORAGE_NODE_NAME = LOCAL_STORAGE_KEYS.GraticuleTool;
const LOCAL_STORAGE_DEFAULTS = {
    active: false
};

const DEFAULT_OPTIONS = {
    color: 'rgba(59, 67, 82, 0.9)',
    dashed: true,
    width: 2,
    showLabels: true,
    wrapX: true
};

class GraticuleTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.Globe,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Show graticule (${SHORTCUT_KEYS.Graticule})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.button = button;
        this.active = false;
        this.options = { ...DEFAULT_OPTIONS, ...options };

        // Load stored data from localStorage
        const localStorageState = JSON.parse(StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME)) || {};
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...localStorageState };
        
        this.graticule = new Graticule({
            strokeStyle: new Stroke({
                color: this.options.color,
                width: this.options.width,
                lineDash: this.options.dashed ? [1, 4] : [0, 0],
            }),
            showLabels: this.options.showLabels,
            visible: true,
            wrapX: this.options.wrapX,
        });

        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(EVENTS.Browser.DOMContentLoaded, this.onDOMContentLoaded.bind(this));
    }

    onDOMContentLoaded() {
        // Re-activate tool if it was active before the application was reloaded
        if(this.localStorage.active) {
            this.activateTool();
        }
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.Graticule)) {
            this.handleClick(event);
        }
    }    

    handleClick() {
        // Note: User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }

        if(this.active) {
            this.deActivateTool();
        }else {
            this.activateTool();
        }
    }

    activateTool() {
        this.graticule.setMap(this.getMap());

        this.active = true;
        this.button.classList.add('oltb-tool-button--active');

        this.localStorage.active = true;
        StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
    }

    deActivateTool() {
        this.graticule.setMap(null);

        this.active = false;
        this.button.classList.remove('oltb-tool-button--active');

        this.localStorage.active = false;
        StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
    }
}

export default GraticuleTool;