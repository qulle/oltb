import 'ol/ol.css';
import Toast from '../common/Toast';
import Dialog from '../common/Dialog';
import LayerManager from '../core/Managers/LayerManager';
import Config from '../core/Config';
import DOM from '../helpers/Browser/DOM';
import { Control } from 'ol/control';
import { toolbarElement } from '../core/ElementReferences';
import { isFullScreen, exitFullScreen } from '../helpers/Browser/Fullscreen';
import { generateMarker } from '../helpers/olFunctions/Marker';
import { easeOut } from 'ol/easing';
import { fromLonLat } from 'ol/proj';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { toStringHDMS } from 'ol/coordinate';

const DEFAULT_OPTIONS = {};

class MyLocation extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.GeoMarker,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': 'My location (G)'
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.options = { ...DEFAULT_OPTIONS, ...options };

        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, 'g')) {
                this.handleClick(event);
            }
        });
    }

    handleClick() {
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
        if(navigator.geolocation) {
            // Show loading toast
            this.loadingToast = Toast.info({
                text: 'Trying to find your location...', 
                clickToClose: false,
                spinner: true
            });

            // The browser geolocation api
            navigator.geolocation.getCurrentPosition(this.onSuccess.bind(this), this.onError.bind(this), {
                enableHighAccuracy: true,
                timeout: 5000
            });
        }else { 
            this.onError({message: 'Geolocation is not supported by this browser.'}, Toast.error);
        }
    }

    onSuccess(location) {
        const lat = location.coords.latitude;
        const lon = location.coords.longitude;
        const prettyCoords = toStringHDMS([lon, lat]);

        const icon = getIcon({
            path: SVGPaths.GeoMarkerFilled,
            width: 20,
            height: 20,
            fill: 'rgb(255, 255, 255)'
        });

        const infoWindow = `
            <h3 class="oltb-text-center">My location</h3>
            <p class="oltb-text-center">${prettyCoords}</p>
            <div class="oltb-d-flex oltb-justify-content-center">
                <button class="oltb-func-btn oltb-func-btn--delete oltb-tippy" title="Delete marker" id="oltb-info-window-remove-marker"></button>
                <button class="oltb-func-btn oltb-func-btn--copy oltb-tippy" title="Copy marker text" id="oltb-info-window-copy-marker-location" data-copy="My location ${prettyCoords}"></button>
            </div>
        `;

        LayerManager.addFeatureLayer('My location');
        LayerManager.getActiveFeatureLayer().layer.getSource().addFeatures(
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
            duration: Config.animationDuration,
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

export default MyLocation;