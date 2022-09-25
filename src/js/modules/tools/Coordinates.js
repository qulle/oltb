import CONFIG from '../core/Config';
import Toast from '../common/Toast';
import DOM from '../helpers/Browser/DOM';
import SettingsManager from '../core/Managers/SettingsManager';
import TooltipManager from '../core/Managers/TooltipManager';
import { Control } from 'ol/control';
import { transform } from 'ol/proj';
import { unByKey } from 'ol/Observable';
import { TOOLBAR_ELEMENT } from '../core/ElementReferences';
import { copyToClipboard } from '../helpers/Browser/CopyToClipboard';
import { SVG_PATHS, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { toStringHDMS } from 'ol/coordinate';
import { SHORTCUT_KEYS } from '../helpers/Constants/ShortcutKeys';
import { EVENTS } from '../helpers/Constants/Events';

const DEFAULT_OPTIONS = {};

class Coordinates extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });

        const icon = getIcon({
            path: SVG_PATHS.Coordinates,
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
        this.tooltipItem;
        this.options = { ...DEFAULT_OPTIONS, ...options };

        SettingsManager.addSetting('copy.coordinates.on.click', {
            state: true, 
            text: 'Coordinates tool - Copy coordinates on click'
        });

        window.addEventListener(EVENTS.Browser.KeyUp, (event) => {
            if(isShortcutKeyOnly(event, SHORTCUT_KEYS.Coordinates)) {
                this.handleClick(event);
            }
        });
    }

    handleClick() {
        this.handleCoordinateTooltip();
    }

    handleCoordinateTooltip() {
        const map = this.getMap();

        if(this.active) {
            const poppedTooltip = TooltipManager.pop('coordinates');
            unByKey(this.onPointerMoveListener);
            unByKey(this.onMapClickListener);
        }else {
            this.tooltipItem = TooltipManager.push('coordinates');
            this.onPointerMoveListener = map.on(EVENTS.Ol.PointerMove, this.onPointerMove.bind(this));
            this.onMapClickListener = map.on(EVENTS.Browser.Click, this.onMapClick.bind(this))
        }

        this.active = !this.active;
        this.button.classList.toggle('oltb-tool-button--active');
    }

    onPointerMove(event) {
        const lonlat = transform(event.coordinate, CONFIG.projection, CONFIG.wgs84Projection);
        const prettyCoords = toStringHDMS(lonlat);

        this.tooltipItem.innerHTML = prettyCoords;
    }

    async onMapClick(event) {
        if(!SettingsManager.getSetting('copy.coordinates.on.click') || window?.oltb?.activeTool != null) {
            return;
        }

        const lonlat = transform(event.coordinate, CONFIG.projection, CONFIG.wgs84Projection);
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

        const didCopy = await copyToClipboard(prettyCoords);

        if(didCopy) {
            Toast.success({text: 'Coordinates copied to clipboard', autoremove: 4000});
        }else {
            Toast.error({text: 'Failed to copy coordinates'});
        }
        
        // User defined callback from constructor
        if(typeof this.options.clicked === 'function') {
            this.options.clicked(coordinate);
        }
    }
}

export default Coordinates;