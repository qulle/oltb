import Toast from '../common/Toast';
import Dialog from '../common/Dialog';
import LayerManager from '../core/Managers/LayerManager';
import CONFIG from '../core/Config';
import DOM from '../helpers/Browser/DOM';
import { Control } from 'ol/control';
import { TOOLBAR_ELEMENT } from '../core/ElementReferences';
import { isFullScreen, exitFullScreen } from '../helpers/Browser/Fullscreen';
import { generateMarker } from '../helpers/olFunctions/GenerateMarker';
import { easeOut } from 'ol/easing';
import { fromLonLat } from 'ol/proj';
import { SVG_PATHS, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { toStringHDMS } from 'ol/coordinate';
import { SHORTCUT_KEYS } from '../helpers/Constants/ShortcutKeys';
import { EVENTS } from '../helpers/Constants/Events';

const ID_PREFIX = 'oltb-info-window-marker';

const DEFAULT_OPTIONS = {
    enableHighAccuracy: true,
    timeout: 5000
};

class MyLocationTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.GeoMarker,
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
        
        if(isFullScreen()) {
            Dialog.confirm({
                text: 'To use geolocation you must exit fullscreen',
                confirmClass: Dialog.Success,
                confirmText: 'Exit fullscreen',
                onConfirm: () => {
                    exitFullScreen();

                    // Delay to let the browser exit full screen for better experience
                    setTimeout(() => {
                        this.handleGEOLocation();
                    }, 800);
                }
            });
        }else {
            this.handleGEOLocation();
        }
    }

    handleGEOLocation() {
        if(this.loadingToast) {
            return;
        }

        if(navigator.geolocation) {
            // Show loading toast
            this.loadingToast = Toast.info({
                text: 'Trying to find your location...', 
                clickToClose: false,
                spinner: true
            });

            // The browser geolocation api
            navigator.geolocation.getCurrentPosition(
                this.onSuccess.bind(this), 
                this.onError.bind(this), 
                {
                    enableHighAccuracy: this.options.enableHighAccuracy,
                    timeout: this.options.timeout
                }
            );
        }else { 
            this.onError({message: 'Geolocation is not supported by this browser.'}, Toast.error);
        }
    }

    onSuccess(location) {
        const lat = location.coords.latitude;
        const lon = location.coords.longitude;
        const prettyCoords = toStringHDMS([lon, lat]);

        const icon = getIcon({
            path: SVG_PATHS.GeoMarkerFilled,
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

        const layerWrapper = LayerManager.addFeatureLayer('My location');
        layerWrapper.layer.getSource().addFeature(
            new generateMarker({
                lat: lat,
                lon: lon,
                icon: icon,
                notSelectable: true,
                infoWindow: infoWindow
            })
        );

        // Center map over location
        const view = this.getMap().getView();

        if(view.getAnimating()) {
            view.cancelAnimations();
        }

        view.animate({
            center: fromLonLat([lon, lat]),
            duration: CONFIG.animationDuration,
            easing: easeOut
        });

        // User defined callback from constructor
        if(typeof this.options.location === 'function') {
            this.options.location(location);
        }

        this.loadingToast.remove();
    }

    onError(error, ptrToast = Toast.error) {
        ptrToast({text: error.message});
        
        // User defined callback from constructor
        if(typeof this.options.error === 'function') {
            this.options.error(error);
        }

        this.loadingToast.remove();
    }
}

export default MyLocationTool;