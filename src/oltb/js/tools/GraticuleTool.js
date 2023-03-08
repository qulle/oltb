import { DOM } from '../helpers/browser/DOM';
import { Stroke } from 'ol/style';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { Graticule } from 'ol/layer';
import { LogManager } from '../core/managers/LogManager';
import { StateManager } from '../core/managers/StateManager';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { TOOLBAR_ELEMENT } from '../core/elements/index';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';
import { LOCAL_STORAGE_KEYS } from '../helpers/constants/LocalStorageKeys';

const FILENAME = 'tools/GraticuleTool.js';
const DEFAULT_OPTIONS = Object.freeze({
    color: 'rgba(59, 67, 82, 0.9)',
    dashed: true,
    width: 2,
    showLabels: true,
    wrapX: true,
    click: undefined
});

const LOCAL_STORAGE_NODE_NAME = LOCAL_STORAGE_KEYS.GraticuleTool;
const LOCAL_STORAGE_DEFAULTS = Object.freeze({
    active: false
});

class GraticuleTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.Globe.Stroked,
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
        const localStorageState = StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME);
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
        window.addEventListener(EVENTS.Browser.ContentLoaded, this.onDOMContentLoaded.bind(this));
    }

    onDOMContentLoaded() {
        if(Boolean(this.localStorage.active)) {
            this.activateTool();
        }
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.Graticule)) {
            this.handleClick(event);
        }
    }    

    handleClick() {
        LogManager.logDebug(FILENAME, 'handleClick', 'User clicked tool');

        // User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }

        if(Boolean(this.active)) {
            this.deActivateTool();
        }else {
            this.activateTool();
        }
    }

    activateTool() {
        const map = this.getMap();
        if(!Boolean(map)) {
            return;
        }

        this.graticule.setMap(map);

        this.active = true;
        this.button.classList.add('oltb-tool-button--active');

        this.localStorage.active = true;
        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, this.localStorage);
    }

    deActivateTool() {
        this.graticule.setMap(null);

        this.active = false;
        this.button.classList.remove('oltb-tool-button--active');

        this.localStorage.active = false;
        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, this.localStorage);
    }
}

export { GraticuleTool };