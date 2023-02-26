import { DOM } from '../helpers/browser/DOM';
import { EVENTS } from '../helpers/constants/Events';
import { StateManager } from '../core/managers/StateManager';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { TOOLBAR_ELEMENT } from '../core/elements/index';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { Control, ScaleLine } from 'ol/control';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';
import { LOCAL_STORAGE_KEYS } from '../helpers/constants/LocalStorageKeys';

const FILENAME = 'tools/ScaleLineTool.js';
const LOCAL_STORAGE_NODE_NAME = LOCAL_STORAGE_KEYS.ScaleLineTool;
const LOCAL_STORAGE_DEFAULTS = Object.freeze({
    active: false
});

const DEFAULT_OPTIONS = Object.freeze({
    units: 'metric'
});

class ScaleLineTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.ScaleLine.Stroked,
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

        // Load stored data from localStorage
        const localStorageState = StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME);
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...localStorageState };
        
        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(EVENTS.Browser.ContentLoaded, this.onDOMContentLoaded.bind(this));
    }

    onDOMContentLoaded() {
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
        // User defined callback from constructor
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
        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, this.localStorage);
    }

    deActivateTool() {
        this.scaleLine.setMap(null);

        this.active = false;
        this.button.classList.remove('oltb-tool-button--active');

        this.localStorage.active = false;
        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, this.localStorage);
    }
}

export { ScaleLineTool };