import { DOM } from '../helpers/browser/DOM';
import { Toast } from '../common/Toast';
import { CONFIG } from '../core/Config';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { unByKey } from 'ol/Observable';
import { SETTINGS } from '../helpers/constants/Settings';
import { transform } from 'ol/proj';
import { LogManager } from '../core/managers/LogManager';
import { ToolManager } from '../core/managers/ToolManager';
import { toStringHDMS } from 'ol/coordinate';
import { StateManager } from '../core/managers/StateManager';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { TooltipManager } from '../core/managers/TooltipManager';
import { SettingsManager } from '../core/managers/SettingsManager';
import { TOOLBAR_ELEMENT } from '../core/elements/index';
import { copyToClipboard } from '../helpers/browser/CopyToClipboard';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';
import { LOCAL_STORAGE_KEYS } from '../helpers/constants/LocalStorageKeys';

const FILENAME = 'tools/CoordiantesTool.js';
const LOCAL_STORAGE_NODE_NAME = LOCAL_STORAGE_KEYS.CoordinatesTool;
const LOCAL_STORAGE_DEFAULTS = Object.freeze({
    active: false
});

const DEFAULT_OPTIONS = Object.freeze({});

class CoordinatesTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });

        const icon = getIcon({
            path: SVG_PATHS.Crosshair.Stroked,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Show coordinates (${SHORTCUT_KEYS.Coordinates})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.button = button;
        this.active = false;
        this.tooltipItem = undefined;
        this.options = { ...DEFAULT_OPTIONS, ...options };

        // Load stored data from localStorage
        const localStorageState = StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME);
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...localStorageState };

        SettingsManager.addSetting(SETTINGS.CopyCoordinatesOnClick, {
            state: true, 
            text: 'Coordinates tool - Copy coordinates on click'
        });

        window.addEventListener(EVENTS.Browser.KeyDown, this.onWindowKeyDown.bind(this));
        window.addEventListener(EVENTS.Browser.ContentLoaded, this.onDOMContentLoaded.bind(this));
    }

    onDOMContentLoaded() {
        if(Boolean(this.localStorage.active)) {
            this.activateTool();
        }
    }

    onWindowKeyDown(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.Coordinates)) {
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

        this.tooltipItem = TooltipManager.push('coordinates');
        this.onPointerMoveListener = map.on(EVENTS.OpenLayers.PointerMove, this.onPointerMove.bind(this));
        this.onMapClickListener = map.on(EVENTS.Browser.Click, this.onMapClick.bind(this));

        this.active = true;
        this.button.classList.add('oltb-tool-button--active');

        this.localStorage.active = true;
        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, this.localStorage);
    }

    deActivateTool() {
        const poppedTooltip = TooltipManager.pop('coordinates');
        
        unByKey(this.onPointerMoveListener);
        unByKey(this.onMapClickListener);

        this.active = false;
        this.button.classList.remove('oltb-tool-button--active');

        this.localStorage.active = false;
        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, this.localStorage);
    }

    onPointerMove(event) {
        const coordinates = transform(
            event.coordinate, 
            CONFIG.Projection.Default, 
            CONFIG.Projection.WGS84
        );
        
        const prettyCoordinates = toStringHDMS(coordinates);
        this.tooltipItem.innerHTML = prettyCoordinates;
    }

    async onMapClick(event) {
        if(
            !SettingsManager.getSetting(SETTINGS.CopyCoordinatesOnClick) || 
            ToolManager.hasActiveTool()
        ) {
            return;
        }

        const coordinates = transform(
            event.coordinate, 
            CONFIG.Projection.Default, 
            CONFIG.Projection.WGS84
        );

        const prettyCoordinates = toStringHDMS(coordinates);

        copyToClipboard(prettyCoordinates)
            .then(() => {
                Toast.success({
                    title: 'Copied',
                    message: 'Coordinates copied to clipboard', 
                    autoremove: CONFIG.AutoRemovalDuation.Normal
                });
            })
            .catch((error) => {
                const errorMessage = 'Failed to copy coordinates';
                LogManager.logError(FILENAME, 'onMapClick', {
                    message: errorMessage,
                    error: error
                });
                Toast.error({
                    title: 'Error',
                    message: errorMessage
                });
            });
        
        const lon = coordinates[0];
        const lat = coordinates[1];
        const response = {
            data: {
                lon: lon, 
                lat: lat
            },
            pretty: prettyCoordinates
        };

        // User defined callback from constructor
        if(typeof this.options.mapClicked === 'function') {
            this.options.mapClicked(response);
        }
    }
}

export { CoordinatesTool };