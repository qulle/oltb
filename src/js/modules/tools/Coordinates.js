import 'ol/ol.css';
import EventType from 'ol/events/EventType';
import Overlay from 'ol/Overlay';
import Config from '../core/Config';
import Toast from '../common/Toast';
import SettingsManager from '../core/Managers/SettingsManager';
import { Control } from 'ol/control';
import { transform } from 'ol/proj';
import { unByKey } from 'ol/Observable';
import { toolbarElement } from '../core/ElementReferences';
import { copyToClipboard } from '../helpers/Browser/CopyToClipboard';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { toStringHDMS } from 'ol/coordinate';

class Coordinates extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });

        const icon = getIcon({
            path: SVGPaths.Coordinates,
            class: 'oltb-tool-button__icon'
        });

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('data-tippy-content', 'Show coordinates (C)');
        button.className = 'oltb-tool-button';
        button.innerHTML = icon;
        button.addEventListener(
            EventType.CLICK,
            this.handleClick.bind(this),
            false
        );

        this.element.appendChild(button);
        this.button = button;
        this.active = false;
        this.options = options;

        const tooltipElement = document.createElement('span');
        tooltipElement.className = 'oltb-coordinate-tooltip';
        this.tooltipElement = tooltipElement;

        const tooltipOverlay = new Overlay({
            element: tooltipElement,
            offset: [0, -11],
            positioning: 'bottom-center'
        });

        this.tooltipOverlay = tooltipOverlay;

        SettingsManager.addSetting('copyCoordinatesOnClick', {state: true, text: 'Coordinates tool - Copy coordinates on click'});

        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, 'c')) {
                this.handleClick(event);
            }
        });
    }

    handleClick(event) {
        event.preventDefault();
        this.handleCoordinateTooltip();
    }

    handleCoordinateTooltip() {
        const map = this.getMap();
    
        if(this.active) {
            map.removeOverlay(this.tooltipOverlay);
            unByKey(this.onPointerMoveListener);
            unByKey(this.onMapClickListener);
            this.tooltipOverlay.setPosition(null);
        }else {
            map.addOverlay(this.tooltipOverlay);
            this.onPointerMoveListener = map.on('pointermove', this.onPointerMove.bind(this));
            this.onMapClickListener = map.on('click', this.onMapClick.bind(this))
        }

        this.active = !this.active;
        this.button.classList.toggle('oltb-tool-button--active');
    }

    onPointerMove(event) {
        const lonlat = transform(event.coordinate, Config.baseProjection, Config.wgs84Projection);
        const prettyCoords = toStringHDMS(lonlat);

        this.tooltipOverlay.setPosition(event.coordinate);
        this.tooltipElement.innerHTML = prettyCoords;
    }

    onMapClick(event) {
        if(!SettingsManager.getSetting('copyCoordinatesOnClick') || window?.oltb?.activeTool != null) {
            return;
        }

        const lonlat = transform(event.coordinate, Config.baseProjection, Config.wgs84Projection);
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

        const copyStatus = copyToClipboard(prettyCoords);

        if(copyStatus) {
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