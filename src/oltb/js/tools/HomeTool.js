import { DOM } from '../helpers/browser/DOM';
import { Toast } from '../common/Toast';
import { CONFIG } from '../core/Config';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { toLonLat } from 'ol/proj';
import { goToView } from '../helpers/GoToView';
import { LogManager } from '../core/managers/LogManager';
import { ContextMenu } from '../common/ContextMenu';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { TOOLBAR_ELEMENT } from '../core/elements/index';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';

const FILENAME = 'tools/HomeTool.js';
const DEFAULT_OPTIONS = Object.freeze({
    lon: 18.1201,
    lat: 35.3518,
    zoom: 3,
    click: undefined,
    home: undefined
});

class HomeTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.House.Stroked,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Zoom home (${SHORTCUT_KEYS.Home})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.options = { ...DEFAULT_OPTIONS, ...options };

        this.homeLocation = [this.options.lon, this.options.lat];
        this.homeZoom = this.options.zoom;
        
        this.userDefinedHomeLocation = null;
        this.userDefinedHomeZoom = null;

        ContextMenu.addItem({
            icon: icon, 
            name: 'Set as home', 
            fn: this.onContextMenuSetHomeLocation.bind(this)
        });

        window.addEventListener(EVENTS.Custom.SettingsCleared, this.onWindowSettingsCleared.bind(this));
        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.Home)) {
            this.handleClick(event);
        }
    }

    handleClick() {
        LogManager.logDebug(FILENAME, 'handleClick', 'User clicked tool');

        // User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }
        
        this.momentaryActivation();
    }

    momentaryActivation() {
        const map = this.getMap();
        if(!Boolean(map)) {
            return;
        }
        
        const zoom = this.userDefinedHomeZoom
            ? this.userDefinedHomeZoom 
            : this.homeZoom;

        const coordiantes = this.userDefinedHomeLocation 
            ? this.userDefinedHomeLocation 
            : this.homeLocation;

        goToView(map, coordiantes, zoom);

        window.setTimeout(() => {
            // User defined callback from constructor
            if(typeof this.options.home === 'function') {
                this.options.home();
            }
        }, CONFIG.AnimationDuration.Normal);
    }

    onWindowSettingsCleared() {
        this.userDefinedHomeLocation = null;
        this.userDefinedHomeZoom = null;
    }

    onContextMenuSetHomeLocation() {
        const map = this.getMap();
        if(!Boolean(map)) {
            return;
        }

        const view = map.getView();

        this.userDefinedHomeZoom = view.getZoom();
        this.userDefinedHomeLocation = toLonLat(view.getCenter());

        Toast.success({
            title: 'New home',
            message: 'New location was set as home',
            autoremove: CONFIG.AutoRemovalDuation.Normal
        });
    }
}

export { HomeTool };