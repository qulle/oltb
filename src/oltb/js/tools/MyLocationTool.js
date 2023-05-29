import { DOM } from '../helpers/browser/DOM';
import { Toast } from '../common/Toast';
import { Config } from '../core/Config';
import { Dialog } from '../common/Dialog';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { goToView } from '../helpers/GoToView';
import { fromLonLat } from 'ol/proj';
import { LogManager } from '../core/managers/LogManager';
import { toStringHDMS } from 'ol/coordinate';
import { LayerManager } from '../core/managers/LayerManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { generateMarker } from '../generators/GenerateMarker';
import { ElementManager } from '../core/managers/ElementManager';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { InfoWindowManager } from '../core/managers/InfoWindowManager';
import { isFullScreen, exitFullScreen } from '../helpers/browser/Fullscreen';

const FILENAME = 'tools/MyLocationTool.js';
const TOOL_BUTTON_CLASS = 'oltb-tool-button';
const ID_PREFIX = 'oltb-info-window-marker';

const DefaultOptions = Object.freeze({
    title: 'My Location',
    enableHighAccuracy: true,
    timeout: 10000,
    description: 'This is the location that the browser was able to find. It might not be your actual location.',
    click: undefined,
    location: undefined,
    error: undefined
});

class MyLocationTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.geoMarker.stroked,
            class: `${TOOL_BUTTON_CLASS}__icon`
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: TOOL_BUTTON_CLASS,
            attributes: {
                type: 'button',
                'data-tippy-content': `My Location (${ShortcutKeys.myLocationTool})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);

        this.button = button;
        this.options = { ...DefaultOptions, ...options };

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.myLocationTool)) {
            this.handleClick(event);
        }
    }

    handleClick() {
        LogManager.logDebug(FILENAME, 'handleClick', 'User clicked tool');
        
        // User defined callback from constructor
        if(this.options.click instanceof Function) {
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
        if(this.loadingToast) {
            return;
        }

        if(navigator.geolocation) {
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
        if(!map) {
            return;
        }

        const lat = location.coords.latitude;
        const lon = location.coords.longitude;
        const prettyCoordinates = toStringHDMS([lon, lat]);

        const infoWindow = {
            title: this.options.title,
            content: `
                <p>${this.options.description}</p>
            `,
            footer: `
                <span class="oltb-info-window__coordinates">${prettyCoordinates}</span>
                <div class="oltb-info-window__buttons-wrapper">
                    <button class="oltb-func-btn oltb-func-btn--delete oltb-tippy" title="Delete marker" id="${ID_PREFIX}-remove"></button>
                    <button class="oltb-func-btn oltb-func-btn--crosshair oltb-tippy" title="Copy marker coordinates" id="${ID_PREFIX}-copy-coordinates" data-coordinates="${prettyCoordinates}"></button>
                    <button class="oltb-func-btn oltb-func-btn--copy oltb-tippy" title="Copy marker text" id="${ID_PREFIX}-copy-text" data-copy="${this.options.description}"></button>
                </div>
            `
        };
        
        const marker = new generateMarker({
            lon: lon,
            lat: lat,
            title: this.options.title,
            description: this.options.description,
            icon: 'person.filled',
            infoWindow: infoWindow
        });

        const layerWrapper = LayerManager.addFeatureLayer(this.options.title);
        layerWrapper.getLayer().getSource().addFeature(marker);

        const zoom = 6;
        goToView(map, [lon, lat], zoom);

        // Trigger InfoWindow to show
        window.setTimeout(() => {
            InfoWindowManager.showOverly(marker, fromLonLat([lon, lat]));
        }, Config.animationDuration.normal);

        // User defined callback from constructor
        if(this.options.location instanceof Function) {
            this.options.location(location);
        }

        this.loadingToast.remove();
    }

    onError(error, ptrToast = Toast.error) {
        LogManager.logError(FILENAME, 'onError', error.message);

        ptrToast({
            title: 'Error',
            message: error.message
        });
        
        // User defined callback from constructor
        if(this.options.error instanceof Function) {
            this.options.error(error);
        }

        this.loadingToast.remove();
    }
}

export { MyLocationTool };