import DOM from '../helpers/Browser/DOM';
import Toast from '../common/Toast';
import CONFIG from '../core/Config';
import ToolManager from '../core/managers/ToolManager';
import StateManager from '../core/managers/StateManager';
import TooltipManager from '../core/managers/TooltipManager';
import SettingsManager from '../core/managers/SettingsManager';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { unByKey } from 'ol/Observable';
import { SETTINGS } from '../helpers/constants/Settings';
import { transform } from 'ol/proj';
import { toStringHDMS } from 'ol/coordinate';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { TOOLBAR_ELEMENT } from '../core/elements/index';
import { copyToClipboard } from '../helpers/Browser/CopyToClipboard';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { SVG_PATHS, getIcon } from '../core/icons/SVGIcons';
import { LOCAL_STORAGE_KEYS } from '../helpers/constants/LocalStorageKeys';

const LOCAL_STORAGE_NODE_NAME = LOCAL_STORAGE_KEYS.coordinateTool;
const LOCAL_STORAGE_DEFAULTS = {
    active: false
};

const DEFAULT_OPTIONS = {};

class CoordinateTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });

        const icon = getIcon({
            path: SVG_PATHS.Coordinate,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Show coordinates (${SHORTCUT_KEYS.coordinate})`
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

        SettingsManager.addSetting(SETTINGS.copyCoordinateOnClick, {
            state: true, 
            text: 'Coordinate tool - Copy coordinates on click'
        });

        window.addEventListener(EVENTS.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(EVENTS.browser.contentLoaded, this.onDOMContentLoaded.bind(this));
    }

    onDOMContentLoaded() {
        if(this.localStorage.active) {
            this.activateTool();
        }
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.coordinate)) {
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
        this.onPointerMoveListener = map.on(EVENTS.ol.pointerMove, this.onPointerMove.bind(this));
        this.onMapClickListener = map.on(EVENTS.browser.click, this.onMapClick.bind(this));

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
            CONFIG.projection.default, 
            CONFIG.projection.wgs84
        );
        
        const prettyCoords = toStringHDMS(lonlat);
        this.tooltipItem.innerHTML = prettyCoords;
    }

    async onMapClick(event) {
        if(
            !SettingsManager.getSetting(SETTINGS.copyCoordinateOnClick) || 
            ToolManager.hasActiveTool()
        ) {
            return;
        }

        const lonlat = transform(
            event.coordinate, 
            CONFIG.projection.default, 
            CONFIG.projection.wgs84
        );

        const lon = lonlat[0];
        const lat = lonlat[1];
        const prettyCoords = toStringHDMS(lonlat);

        const coordinate = {
            decimal: {
                lon: lon, 
                lat: lat
            },
            degree: prettyCoords
        };

        copyToClipboard(prettyCoords)
            .then(() => {
                Toast.success({text: 'Coordinate copied to clipboard', autoremove: 4000});
            })
            .catch((error) => {
                console.error('Error copying coordinates', error);
                Toast.error({text: 'Failed to copy coordinates'});
            });
        
        // User defined callback from constructor
        if(typeof this.options.mapClicked === 'function') {
            this.options.mapClicked(coordinate);
        }
    }
}

export default CoordinateTool;