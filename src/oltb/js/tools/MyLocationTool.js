import { DOM } from '../helpers/browser/DOM';
import { Toast } from '../common/Toast';
import { CONFIG } from '../core/Config';
import { Dialog } from '../common/Dialog';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { goToView } from '../helpers/GoToView';
import { fromLonLat } from 'ol/proj';
import { LogManager } from '../core/managers/LogManager';
import { toStringHDMS } from 'ol/coordinate';
import { LayerManager } from '../core/managers/LayerManager';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { generateMarker } from '../generators/GenerateMarker';
import { ElementManager } from '../core/managers/ElementManager';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { InfoWindowManager } from '../core/managers/InfoWindowManager';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';
import { isFullScreen, exitFullScreen } from '../helpers/browser/Fullscreen';

const FILENAME = 'tools/MyLocationTool.js';
const ID_PREFIX = 'oltb-info-window-marker';

const DEFAULT_OPTIONS = Object.freeze({
    title: 'My Location',
    enableHighAccuracy: true,
    timeout: 10000,
    infoWindowDescription: 'This is the location that the browser was able to find. It might not be your actual location.',
    click: undefined,
    location: undefined,
    error: undefined
});

class MyLocationTool extends Control {
    constructor(options = {}) {
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SVG_PATHS.GeoMarker.Stroked,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `${DEFAULT_OPTIONS.title} (${SHORTCUT_KEYS.MyLocation})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);
        this.options = { ...DEFAULT_OPTIONS, ...options };

        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.MyLocation)) {
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
        if(isFullScreen()) {
            Dialog.confirm({
                title: 'Exit fullscreen',
                message: 'To use geolocation you must exit fullscreen',
                confirmClass: Dialog.Success,
                confirmText: 'Exit fullscreen',
                onConfirm: () => {
                    exitFullScreen()
                        .then(() => {
                            this.getGeoLocation();
                        })
                        .catch((error) => {
                            LogManager.logError(FILENAME, 'momentaryActivation', {
                                message: 'Error exiting fullscreen',
                                error: error
                            });
                        });
                }
            });
        }else {
            this.getGeoLocation();
        }
    }

    getGeoLocation() {
        if(Boolean(this.loadingToast)) {
            return;
        }

        if(Boolean(navigator.geolocation)) {
            this.loadingToast = Toast.info({
                title: 'Searching',
                message: 'Trying to find your location...', 
                clickToRemove: false,
                spinner: true,
                onRemove: () => {
                    this.loadingToast = undefined;
                }
            });

            navigator.geolocation.getCurrentPosition(
                this.onSuccess.bind(this), 
                this.onError.bind(this), 
                {
                    enableHighAccuracy: this.options.enableHighAccuracy,
                    timeout: this.options.timeout
                }
            );
        }else { 
            this.onError({
                message: 'Geolocation is not supported'
            }, Toast.error);
        }
    }

    onSuccess(location) {
        const map = this.getMap();
        if(!Boolean(map)) {
            return;
        }

        const lat = location.coords.latitude;
        const lon = location.coords.longitude;
        const prettyCoordinates = toStringHDMS([lon, lat]);

        const infoWindow = {
            title: DEFAULT_OPTIONS.title,
            content: `
                <p>${this.options.infoWindowDescription}</p>
            `,
            footer: `
                <span class="oltb-info-window__coordinates">${prettyCoordinates}</span>
                <div class="oltb-info-window__buttons-wrapper">
                    <button class="oltb-func-btn oltb-func-btn--delete oltb-tippy" title="Delete marker" id="${ID_PREFIX}-remove"></button>
                    <button class="oltb-func-btn oltb-func-btn--crosshair oltb-tippy" title="Copy marker coordinates" id="${ID_PREFIX}-copy-coordinates" data-coordinates="${prettyCoordinates}"></button>
                    <button class="oltb-func-btn oltb-func-btn--copy oltb-tippy" title="Copy marker text" id="${ID_PREFIX}-copy-text" data-copy="${this.options.infoWindowDescription}"></button>
                </div>
            `
        };
        
        const marker = new generateMarker({
            lon: lon,
            lat: lat,
            title: DEFAULT_OPTIONS.title,
            description: this.options.infoWindowDescription,
            icon: 'Person.Filled',
            infoWindow: infoWindow
        });

        const layerWrapper = LayerManager.addFeatureLayer(DEFAULT_OPTIONS.title);
        layerWrapper.getLayer().getSource().addFeature(marker);

        goToView(map, [lon, lat], 6);

        // Trigger InfoWindow to show
        window.setTimeout(() => {
            InfoWindowManager.showOverly(marker, fromLonLat([lon, lat]));
        }, CONFIG.AnimationDuration.Normal);

        // User defined callback from constructor
        if(typeof this.options.location === 'function') {
            this.options.location(location);
        }

        this.loadingToast.remove();
    }

    onError(error, ptrToast = Toast.error) {
        ptrToast({
            title: 'Error',
            message: error.message
        });
        
        // User defined callback from constructor
        if(typeof this.options.error === 'function') {
            this.options.error(error);
        }

        this.loadingToast.remove();
    }
}

export { MyLocationTool };