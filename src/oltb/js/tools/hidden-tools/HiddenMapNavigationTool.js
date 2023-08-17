import _ from 'lodash';
import { Toast } from '../../common/Toast';
import { Config } from '../../core/Config';
import { Events } from '../../helpers/constants/Events';
import { Control } from 'ol/control';
import { goToView } from '../../helpers/GoToView';
import { transform } from 'ol/proj';
import { LogManager } from '../../core/managers/LogManager';
import { UrlManager } from '../../core/managers/UrlManager';
import { ContextMenu } from '../../common/ContextMenu';
import { toStringHDMS } from 'ol/coordinate';
import { LayerManager } from '../../core/managers/LayerManager';
import { StateManager } from '../../core/managers/StateManager';
import { ElementManager } from '../../core/managers/ElementManager';
import { CoordinateModal } from '../modal-extensions/CoordinateModal';
import { copyToClipboard } from '../../helpers/browser/CopyToClipboard';
import { LocalStorageKeys } from '../../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../../core/icons/GetIcon';
import { InfoWindowManager } from '../../core/managers/InfoWindowManager';
import { ProjectionManager } from '../../core/managers/ProjectionManager';
import { generateIconMarker } from '../../generators/GenerateIconMarker';
import { fromLonLat, toLonLat } from 'ol/proj';

const FILENAME = 'hidden-tools/HiddenMapNavigationTool.js';
const CLASS_FUNC_BUTTON = 'oltb-func-btn';
const ID_PREFIX_INFO_WINDOW = 'oltb-info-window-marker';

const DefaultOptions = Object.freeze({
    focusZoom: 2
});

// This is the same NODE_NAME and PROPS that the map.js file is using
const LocalStorageNodeName = LocalStorageKeys.mapData;
const LocalStorageDefaults = Object.freeze({
    lon: Config.defaultLocation.lon,
    lat: Config.defaultLocation.lat,
    zoom: Config.defaultLocation.zoom,
    rotation: Config.defaultLocation.rotation,
});

const DefaultUrlMarker = Object.freeze({
    lon: 18.0685,
    lat: 59.3293,
    title: 'Marker',
    description: 'Oops, this is the default description, have you forgot a parameter?',
    icon: 'GeoMarker.Filled',
    layerName: 'URL Marker',
    label: 'Marker',
    labelFill: '#FFFFFF',
    labelStroke: '#3B4352CC',
    labelStrokeWidth: 12,
    labelFont: '14px Calibri',
    labelUseEllipsisAfter: 20,
    markerFill: '#0166A5FF',
    markerStroke: '#FFFFFFFF',
    projection: Config.projection.wgs84,
    zoom: 8
});

/**
 * About:
 * Extended navigation shortcuts
 * 
 * Description:
 * Features to simplify navigation, centering and focusing the Map.
 */
class HiddenMapNavigationTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });

        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        this.coordinatesModal = undefined;

        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        this.clipboardIcon = getIcon({
            path: SvgPaths.clipboard.stroked
        });

        this.coordinatesIcon = getIcon({
            path: SvgPaths.crosshair.stroked
        });

        this.moveCenterIcon = getIcon({
            path: SvgPaths.arrowsMove.stroked
        });
        
        this.focusHereIcon = getIcon({
            path: SvgPaths.aspectRatio.stroked
        });

        this.initContextMenuItems();

        window.addEventListener(Events.browser.contentLoaded, this.onDOMContentLoaded.bind(this));
    }

    getName() {
        return FILENAME;
    }

    // -------------------------------------------------------------------
    // # Section: Init Helpers
    // -------------------------------------------------------------------

    initContextMenuItems() {
        ContextMenu.addItem({
            icon: this.clipboardIcon,
            name: 'Copy Coordinates',
            fn: this.onContextMenuCopyCoordinates.bind(this)
        });

        ContextMenu.addItem({});

        ContextMenu.addItem({
            icon: this.coordinatesIcon,
            name: 'Navigate To',
            fn: this.onContextMenuCenterAtCoordinates.bind(this)
        });

        ContextMenu.addItem({
            icon: this.moveCenterIcon, 
            name: 'Center Here', 
            fn: this.onContextMenuCenterMap.bind(this)
        });

        ContextMenu.addItem({
            icon: this.focusHereIcon, 
            name: 'Focus Here', 
            fn: this.onContextMenuFocusHere.bind(this)
        });
        
        ContextMenu.addItem({});
    }

    // -------------------------------------------------------------------
    // # Section: ContextMenu Callbacks
    // -------------------------------------------------------------------

    onContextMenuCopyCoordinates(map, coordinates, target) {
        this.doCopyCoordinates(coordinates);
    }

    onContextMenuCenterAtCoordinates(map, coordinates, target) {
        this.doShowCoordinatesModal(map);
    }

    onContextMenuCenterMap(map, coordinates, target) {
        goToView({
            map: map,
            coordinates: coordinates,
            zoom: map.getView().getZoom()
        });
    }

    onContextMenuFocusHere(map, coordinates, target) {
        goToView({
            map: map,
            coordinates: coordinates,
            zoom: this.options.focusZoom
        });
    }

    // -------------------------------------------------------------------
    // # Section: Browser Events
    // -------------------------------------------------------------------

    onDOMContentLoaded(event) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        // Bind to global map events
        map.on(Events.openLayers.moveEnd, this.onMoveEnd.bind(this));

        this.doDetectUrlMarker();
    }

    // -------------------------------------------------------------------
    // # Section: Conversions/Validation
    // -------------------------------------------------------------------

    validateProjection(projection) {
        projection = projection.toUpperCase();

        if(!projection.startsWith('EPSG:')) {
            projection = `EPSG:${projection}`;
        }

        return projection;
    }

    validateHexColor(color) {
        if(color.startsWith('#')) {
            return color;
        }

        return `#${color}`;
    }

    hasProjection(projection) {
        const hasProjection = ProjectionManager.hasProjection(projection);

        if(!hasProjection) {
            const errorMessage = `Must add projection definition for <strong>${projection}</strong>`;
            LogManager.logError(FILENAME, 'hasProjection', errorMessage);

            Toast.error({
                title: 'Error',
                message: `
                    ${errorMessage} <br>
                    <a href="https://epsg.io" target="_blank" class="oltb-link">https://epsg.io</a>
                `
            });
        }

        return hasProjection;
    }

    // -------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    // -------------------------------------------------------------------

    onCreateUrlMarker(markerString) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        this.doParseUrlMarker(markerString);
    }

    onMoveEnd(event) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        this.setLastPosition(map);
    }

    // -------------------------------------------------------------------
    // # Section: Getters and Setters
    // -------------------------------------------------------------------

    setLastPosition(map) {
        const view = map.getView();
        const center = toLonLat(view.getCenter());

        this.localStorage.lon = center[0];
        this.localStorage.lat = center[1];
        this.localStorage.zoom = view.getZoom();
        this.localStorage.rotation = view.getRotation();

        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    // -------------------------------------------------------------------
    // # Section: Tool DoActions
    // -------------------------------------------------------------------

    doCopyCoordinates(coordinates) {
        const prettyCoordinates = toStringHDMS(coordinates);

        copyToClipboard(prettyCoordinates)
            .then(() => {
                Toast.info({
                    title: 'Copied',
                    message: 'Coordinates copied to clipboard', 
                    autoremove: Config.autoRemovalDuation.normal
                });
            })
            .catch((error) => {
                const errorMessage = 'Failed to copy coordinates';
                LogManager.logError(FILENAME, 'doCopyCoordinates', {
                    message: errorMessage,
                    error: error
                });
                
                Toast.error({
                    title: 'Error',
                    message: errorMessage
                });
            });
    }

    doDetectUrlMarker() {
        const marker = UrlManager.getParameter(Config.urlParameter.marker, false);
        if(marker) {
            this.onCreateUrlMarker(marker);
        }
    }

    doParseUrlMarker(markerString) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        try {
            const markerParsed = JSON.parse(markerString);
            const markerData = _.merge(_.cloneDeep(DefaultUrlMarker), markerParsed);

            LogManager.logDebug(FILENAME, 'doParseUrlMarker', markerData);

            const coordinates = [Number(markerData.lon), Number(markerData.lat)];
            const marker = this.doAddIconMarker(markerData, coordinates);
            this.doFocusMarker(map, marker, coordinates, Config.marker.focusZoom);
        }catch(error) {
            const errorMessage = 'Failed to parse URL marker';
            LogManager.logError(FILENAME, 'doParseUrlMarker', {
                message: errorMessage,
                error: error
            });
            
            Toast.error({
                title: 'Error',
                message: errorMessage
            }); 
        } 
    }

    doFocusMarker(map, marker, coordinates, zoom) {
        goToView({
            map: map,
            coordinates: coordinates,
            zoom: zoom,
            onDone: (result) => {
                InfoWindowManager.showOverlay(marker, fromLonLat(coordinates));
            }
        });
    }

    doAddMarkerToMap(marker, layerName) {
        const layerWrapper = LayerManager.addFeatureLayer({
            name: layerName
        });
        
        layerWrapper.getLayer().getSource().addFeature(marker);
    }

    doAddIconMarker(markerData, coordinates) {
        // Colors given in URL can't contain hashtag unless encoded as %23
        // Easier to prepend with hashtag after URL data has been fetched and parsed
        markerData.markerFill = this.validateHexColor(markerData.markerFill);
        markerData.markerStroke = this.validateHexColor(markerData.markerStroke);
        markerData.projection = this.validateProjection(markerData.projection);

        if(!this.hasProjection(markerData.projection)) {
            return;
        }

        const transformedCoordinates = transform(
            coordinates, 
            markerData.projection, 
            Config.projection.wgs84
        );

        const prettyCoordinates = toStringHDMS(transformedCoordinates);
        const infoWindow = {
            title: markerData.title,
            content: `
                <p>${markerData.description}</p>
            `,
            footer: `
                <span class="oltb-info-window__coordinates">${prettyCoordinates}</span>
                <div class="oltb-info-window__buttons-wrapper">
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--delete oltb-tippy" title="Delete Marker" id="${ID_PREFIX_INFO_WINDOW}-remove"></button>
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--crosshair oltb-tippy" title="Copy Marker Coordinates" id="${ID_PREFIX_INFO_WINDOW}-copy-coordinates" data-oltb-coordinates="${prettyCoordinates}"></button>
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--copy oltb-tippy" title="Copy Marker Text" id="${ID_PREFIX_INFO_WINDOW}-copy-text" data-oltb-copy="${markerData.title}, ${markerData.description}"></button>
                </div>
            `
        };

        const marker = new generateIconMarker({
            lon: transformedCoordinates[0],
            lat: transformedCoordinates[1],
            title: markerData.title,
            description: markerData.description,
            markerFill: markerData.markerFill,
            markerStroke: markerData.markerStroke,
            icon: markerData.icon,
            label: markerData.label,
            labelFill: markerData.labelFill,
            labelStroke: markerData.labelStroke,
            labelStrokeWidth: markerData.labelStrokeWidth,
            labelFont: markerData.labelFont,
            labelUseEllipsisAfter: markerData.labelUseEllipsisAfter,
            infoWindow: infoWindow
        });

        this.doAddMarkerToMap(marker, markerData.layerName);

        return marker;
    }

    doShowCoordinatesModal(map) {
        if(this.coordinatesModal) {
            return;
        }
        
        this.coordinatesModal = new CoordinateModal({
            onNavigate: (coordinates) => {
                goToView({
                    map: map,
                    coordinates: coordinates,
                    zoom: map.getView().getZoom()
                });
            },
            onClose: () => {
                this.coordinatesModal = undefined;
            }
        });
    }
}

export { HiddenMapNavigationTool };