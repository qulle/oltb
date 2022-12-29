import { DOM } from '../helpers/browser/DOM';
import { Toast } from '../common/Toast';
import { CONFIG } from '../core/Config';
import { Dialog } from '../common/Dialog';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { easeOut } from 'ol/easing';
import { fromLonLat } from 'ol/proj';
import { toStringHDMS } from 'ol/coordinate';
import { LayerManager } from '../core/managers/LayerManager';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { generateMarker } from '../generators/GenerateMarker';
import { TOOLBAR_ELEMENT } from '../core/elements/index';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { InfoWindowManager } from '../core/managers/InfoWindowManager';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';
import { isFullScreen, exitFullScreen } from '../helpers/browser/Fullscreen';

const ID_PREFIX = 'oltb-info-window-marker';

const DEFAULT_OPTIONS = Object.freeze({
    enableHighAccuracy: true,
    timeout: 10000
});

class MyLocationTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
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
                'data-tippy-content': `My location (${SHORTCUT_KEYS.MyLocation})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.options = { ...DEFAULT_OPTIONS, ...options };

        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.MyLocation)) {
            this.handleClick(event);
        }
    }

    handleClick() {
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
                            this.getGEOLocation();
                        })
                        .catch((error) => {
                            console.error(`Error exiting fullscreen [${error}]`);
                        });
                }
            });
        }else {
            this.getGEOLocation();
        }
    }

    getGEOLocation() {
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
        const lat = location.coords.latitude;
        const lon = location.coords.longitude;
        const prettyCoords = toStringHDMS([lon, lat]);

        const icon = getIcon({
            path: SVG_PATHS.Person.Filled,
            width: 20,
            height: 20,
            fill: 'rgb(255, 255, 255)'
        });

        const infoWindow = `
            <h3 class="oltb-text-center">My location</h3>
            <p class="oltb-text-center">${prettyCoords}</p>
            <div class="oltb-d-flex oltb-justify-content-center">
                <button class="oltb-func-btn oltb-func-btn--delete oltb-tippy" title="Delete marker" id="${ID_PREFIX}-remove"></button>
                <button class="oltb-func-btn oltb-func-btn--copy oltb-tippy" title="Copy marker text" id="${ID_PREFIX}-copy-location" data-copy="My location ${prettyCoords}"></button>
            </div>
        `;
        
        const marker = new generateMarker({
            lat: lat,
            lon: lon,
            icon: icon,
            notSelectable: true,
            infoWindow: infoWindow
        });

        const layerWrapper = LayerManager.addFeatureLayer('My location');
        layerWrapper.layer.getSource().addFeature(marker);

        // Center map over location
        const view = this.getMap().getView();

        if(view.getAnimating()) {
            view.cancelAnimations();
        }

        view.animate({
            center: fromLonLat([lon, lat]),
            zoom: 6,
            duration: CONFIG.AnimationDuration.Normal,
            easing: easeOut
        });

        // Trigger InfoWindow to show
        setTimeout(() => {
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