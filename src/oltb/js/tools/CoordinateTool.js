import { DOM } from '../helpers/browser/DOM';
import { Toast } from '../common/Toast';
import { CONFIG } from '../core/Config';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { unByKey } from 'ol/Observable';
import { SETTINGS } from '../helpers/constants/Settings';
import { transform } from 'ol/proj';
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

const LOCAL_STORAGE_NODE_NAME = LOCAL_STORAGE_KEYS.CoordinateTool;
const LOCAL_STORAGE_DEFAULTS = Object.freeze({
    active: false
});

const DEFAULT_OPTIONS = Object.freeze({});

class CoordinateTool extends Control {
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
                'data-tippy-content': `Show coordinates (${SHORTCUT_KEYS.Coordinate})`
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
        const localStorageState = JSON.parse(StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME)) || {};
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...localStorageState };

        SettingsManager.addSetting(SETTINGS.CopyCoordinateOnClick, {
            state: true, 
            text: 'Coordinate tool - Copy coordinates on click'
        });

        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(EVENTS.Browser.ContentLoaded, this.onDOMContentLoaded.bind(this));
    }

    onDOMContentLoaded() {
        if(this.localStorage.active) {
            this.activateTool();
        }
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.Coordinate)) {
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
        const map = this.getMap();

        this.tooltipItem = TooltipManager.push('coordinates');
        this.onPointerMoveListener = map.on(EVENTS.OpenLayers.PointerMove, this.onPointerMove.bind(this));
        this.onMapClickListener = map.on(EVENTS.Browser.Click, this.onMapClick.bind(this));

        this.active = true;
        this.button.classList.add('oltb-tool-button--active');

        this.localStorage.active = true;
        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
    }

    deActivateTool() {
        const poppedTooltip = TooltipManager.pop('coordinates');
        
        unByKey(this.onPointerMoveListener);
        unByKey(this.onMapClickListener);

        this.active = false;
        this.button.classList.remove('oltb-tool-button--active');

        this.localStorage.active = false;
        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
    }

    onPointerMove(event) {
        const lonlat = transform(
            event.coordinate, 
            CONFIG.Projection.Default, 
            CONFIG.Projection.WGS84
        );
        
        const prettyCoords = toStringHDMS(lonlat);
        this.tooltipItem.innerHTML = prettyCoords;
    }

    async onMapClick(event) {
        if(
            !SettingsManager.getSetting(SETTINGS.CopyCoordinateOnClick) || 
            ToolManager.hasActiveTool()
        ) {
            return;
        }

        const lonlat = transform(
            event.coordinate, 
            CONFIG.Projection.Default, 
            CONFIG.Projection.WGS84
        );

        const lon = lonlat[0];
        const lat = lonlat[1];
        const prettyCoords = toStringHDMS(lonlat);

        const coordinate = {
            data: {
                lon: lon, 
                lat: lat
            },
            pretty: prettyCoords
        };

        copyToClipboard(prettyCoords)
            .then(() => {
                Toast.success({
                    title: 'Copied',
                    message: 'Coordinate copied to clipboard', 
                    autoremove: 4000
                });
            })
            .catch((error) => {
                const errorMessage = 'Failed to copy coordinates';

                console.error(errorMessage, error);
                Toast.error({
                    title: 'Error',
                    message: errorMessage
                });
            });
        
        // User defined callback from constructor
        if(typeof this.options.mapClicked === 'function') {
            this.options.mapClicked(coordinate);
        }
    }
}

export { CoordinateTool };