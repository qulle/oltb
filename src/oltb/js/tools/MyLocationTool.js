import _ from 'lodash';
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
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const CLASS_FUNC_BUTTON = 'oltb-func-btn';
const ID_PREFIX_INFO_WINDOW = 'oltb-info-window-marker';

const DefaultOptions = Object.freeze({
    title: 'My Location',
    enableHighAccuracy: true,
    timeout: 10000,
    description: 'This is the location that the browser was able to find. It might not be your actual location.',
    onClick: undefined,
    onLocation: undefined,
    onError: undefined
});

class MyLocationTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.geoMarker.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `My Location (${ShortcutKeys.myLocationTool})`
            },
            listeners: {
                'click': this.onClickTool.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);

        this.button = button;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.myLocationTool)) {
            this.onClickTool(event);
        }
    }

    onClickTool() {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');
        
        // Note: Consumer callback
        if(this.options.onClick instanceof Function) {
            this.options.onClick();
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
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--delete oltb-tippy" title="Delete marker" id="${ID_PREFIX_INFO_WINDOW}-remove"></button>
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--crosshair oltb-tippy" title="Copy marker coordinates" id="${ID_PREFIX_INFO_WINDOW}-copy-coordinates" data-oltb-coordinates="${prettyCoordinates}"></button>
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--copy oltb-tippy" title="Copy marker text" id="${ID_PREFIX_INFO_WINDOW}-copy-text" data-oltb-copy="${this.options.description}"></button>
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

        const layerWrapper = LayerManager.addFeatureLayer({
            name: this.options.title
        });
        layerWrapper.getLayer().getSource().addFeature(marker);

        const zoom = 6;
        goToView(map, [lon, lat], zoom);

        // Trigger InfoWindow to show
        window.setTimeout(() => {
            InfoWindowManager.showOverly(marker, fromLonLat([lon, lat]));
        }, Config.animationDuration.normal);

        // Note: Consumer callback
        if(this.options.onLocation instanceof Function) {
            this.options.onLocation(location);
        }

        DOM.removeElement(this.loadingToast);
    }

    onError(error, toastPtr = Toast.error) {
        LogManager.logError(FILENAME, 'onError', error.message);

        toastPtr({
            title: 'Error',
            message: error.message
        });
        
        // Note: Consumer callback
        if(this.options.onError instanceof Function) {
            this.options.onError(error);
        }

        DOM.removeElement(this.loadingToast);
    }
}

export { MyLocationTool };