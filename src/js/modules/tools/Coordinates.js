import Config from '../core/Config';
import Toast from '../common/Toast';
import DOM from '../helpers/Browser/DOM';
import SettingsManager from '../core/Managers/SettingsManager';
import TooltipManager from '../core/Managers/TooltipManager';
import { Control } from 'ol/control';
import { transform } from 'ol/proj';
import { unByKey } from 'ol/Observable';
import { toolbarElement } from '../core/ElementReferences';
import { copyToClipboard } from '../helpers/Browser/CopyToClipboard';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { toStringHDMS } from 'ol/coordinate';

const DEFAULT_OPTIONS = {};

class Coordinates extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });

        const icon = getIcon({
            path: SVGPaths.Coordinates,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': 'Show coordinates (C)'
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

        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, 'c')) {
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
            this.onPointerMoveListener = map.on('pointermove', this.onPointerMove.bind(this));
            this.onMapClickListener = map.on('click', this.onMapClick.bind(this))
        }

        this.active = !this.active;
        this.button.classList.toggle('oltb-tool-button--active');
    }

    onPointerMove(event) {
        const lonlat = transform(event.coordinate, Config.projection, Config.wgs84Projection);
        const prettyCoords = toStringHDMS(lonlat);

        this.tooltipItem.innerHTML = prettyCoords;
    }

    async onMapClick(event) {
        if(!SettingsManager.getSetting('copy.coordinates.on.click') || window?.oltb?.activeTool != null) {
            return;
        }

        const lonlat = transform(event.coordinate, Config.projection, Config.wgs84Projection);
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
            Toast.success({text: 'Coordinates copied to clipboard', autoremove: 3000});
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