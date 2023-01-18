import DOM from '../helpers/browser/DOM';
import StateManager from '../core/managers/StateManager';
import { Control, ScaleLine } from 'ol/control';
import { TOOLBAR_ELEMENT } from '../core/ElementReferences';
import { SVG_PATHS, getIcon } from '../core/SVGIcons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { EVENTS } from '../helpers/constants/Events';

const LOCAL_STORAGE_NODE_NAME = 'scaleLineTool';
const LOCAL_STORAGE_DEFAULTS = {
    active: false
};

const DEFAULT_OPTIONS = {
    units: 'metric'
};

class ScaleLineTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.ScaleLine,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Scale line (${SHORTCUT_KEYS.ScaleLine})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.button = button;
        this.active = false;
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.scaleLine = new ScaleLine({units: this.options.units});

        // Load potential stored data from localStorage
        const localStorageState = JSON.parse(StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME)) || {};
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...localStorageState };
        
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
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.ScaleLine)) {
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
        this.scaleLine.setMap(this.getMap());

        this.active = true;
        this.button.classList.add('oltb-tool-button--active');

        this.localStorage.active = true;
        StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
    }

    deActivateTool() {
        this.scaleLine.setMap(null);

        this.active = false;
        this.button.classList.remove('oltb-tool-button--active');

        this.localStorage.active = false;
        StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
    }
}

export default ScaleLineTool;