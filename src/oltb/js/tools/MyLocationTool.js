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
import { ElementManager } from '../core/managers/ElementManager';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { InfoWindowManager } from '../core/managers/InfoWindowManager';
import { generateIconMarker } from '../generators/GenerateIconMarker';
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
    markerLabelUseEllipsisAfter: 20,
    markerLabelUseUpperCase: false,
    onInitiated: undefined,
    onClicked: undefined,
    onLocationFound: undefined,
    onError: undefined
});

/**
 * About:
 * Mark your geographic location
 * 
 * Description:
 * Ask the browser's built-in API for your current location. 
 * A separate layer is created for this which contains a Marker with your position.
 */
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

        // Note: Consumer callback
        if(this.options.onInitiated instanceof Function) {
            this.options.onInitiated();
        }
    }

    // -------------------------------------------------------------------
    // # Section: Tool Control
    // -------------------------------------------------------------------

    onClickTool(event) {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');
        
        this.momentaryActivation();

        // Note: Consumer callback
        if(this.options.onClicked instanceof Function) {
            this.options.onClicked();
        }
    }

    momentaryActivation() {
        if(isFullScreen()) {
            this.askToExitFullScreen();
        }else {
            this.doGeoLocationSearch();
        }
    }

    // -------------------------------------------------------------------
    // # Section: Browser Events
    // -------------------------------------------------------------------

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.myLocationTool)) {
            this.onClickTool(event);
        }
    }

    // -------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    // -------------------------------------------------------------------

    onSuccess(location) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        DOM.removeElement(this.loadingToast);
        
        const coordinates = [location.coords.longitude, location.coords.latitude];
        const marker = this.doAddIconMarker(coordinates);
        
        this.doFocusMarker(map, marker, coordinates, Config.marker.focusZoom);
        
        // Note: Consumer callback
        if(this.options.onLocationFound instanceof Function) {
            this.options.onLocationFound(location);
        }
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

    // -------------------------------------------------------------------
    // # Section: Ask User
    // -------------------------------------------------------------------

    askToExitFullScreen() {
        Dialog.confirm({
            title: 'Exit fullscreen',
            message: 'To use geolocation you must exit fullscreen',
            confirmClass: Dialog.Success,
            confirmText: 'Exit fullscreen',
            onConfirm: () => {
                exitFullScreen()
                    .then(() => {
                        this.doGeoLocationSearch();
                    })
                    .catch((error) => {
                        LogManager.logError(FILENAME, 'askToExitFullScreen', {
                            message: 'Error exiting fullscreen',
                            error: error
                        });
                    });
            }
        });
    }

    // -------------------------------------------------------------------
    // # Section: Tool DoActions
    // -------------------------------------------------------------------

    doFocusMarker(map, marker, coordinates, zoom) {
        goToView(map, coordinates, zoom);
        InfoWindowManager.showOverlayDelayed(marker, fromLonLat(coordinates));
    }

    doAddMarkerToMap(marker) {
        const layerWrapper = LayerManager.addFeatureLayer({
            name: this.options.title
        });
        layerWrapper.getLayer().getSource().addFeature(marker);
    }

    doAddIconMarker(coordinates) {
        const prettyCoordinates = toStringHDMS(coordinates);
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
        
        const marker = new generateIconMarker({
            lon: coordinates[0],
            lat: coordinates[1],
            title: this.options.title,
            description: this.options.description,
            icon: 'person.filled',
            label: this.options.title,
            labelUseEllipsisAfter: this.options.markerLabelUseEllipsisAfter,
            labelUseUpperCase: this.options.markerLabelUseUpperCase,
            infoWindow: infoWindow
        });

        this.doAddMarkerToMap(marker);

        return marker;
    }

    doGeoLocationSearch() {
        if(this.loadingToast) {
            return;
        }

        if(!navigator.geolocation) {
            return this.onError({
                message: 'Geolocation is not supported'
            }, Toast.error);
        }
        
        this.loadingToast = Toast.info({
            title: 'Searching',
            message: 'Trying to find your location...', 
            clickToRemove: false,
            spinner: true,
            onRemove: () => {
                this.loadingToast = undefined;
            }
        });

        navigator.geolocation.getCurrentPosition(this.onSuccess.bind(this), this.onError.bind(this), {
            enableHighAccuracy: this.options.enableHighAccuracy,
            timeout: this.options.timeout
        });
    }
}

export { MyLocationTool };