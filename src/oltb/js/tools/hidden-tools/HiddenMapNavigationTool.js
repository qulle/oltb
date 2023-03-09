import { Toast } from '../../common/Toast';
import { CONFIG } from '../../core/Config';
import { EVENTS } from '../../helpers/constants/Events';
import { Control } from 'ol/control';
import { goToView } from '../../helpers/GoToView';
import { transform } from 'ol/proj';
import { LogManager } from '../../core/managers/LogManager';
import { UrlManager } from '../../core/managers/UrlManager';
import { ContextMenu } from '../../common/ContextMenu';
import { toStringHDMS } from 'ol/coordinate';
import { LayerManager } from '../../core/managers/LayerManager';
import { StateManager } from '../../core/managers/StateManager';
import { generateMarker } from '../../generators/GenerateMarker';
import { ElementManager } from '../../core/managers/ElementManager';
import { CoordinateModal } from '../modal-extensions/CoordinateModal';
import { InfoWindowManager } from '../../core/managers/InfoWindowManager';
import { ProjectionManager } from '../../core/managers/ProjectionManager';
import { SVG_PATHS, getIcon } from '../../core/icons/GetIcon';
import { LOCAL_STORAGE_KEYS } from '../../helpers/constants/LocalStorageKeys';
import { fromLonLat, toLonLat } from 'ol/proj';

const FILENAME = 'hidden-tools/HiddenMapNavigationTool.js';
const ID_PREFIX = 'oltb-info-window-marker';
const DEFAULT_OPTIONS = Object.freeze({
    focusZoom: 2
});

// This is the same NODE_NAME and PROPS that the map.js file is using
const LOCAL_STORAGE_NODE_NAME = LOCAL_STORAGE_KEYS.MapData;
const LOCAL_STORAGE_DEFAULTS = Object.freeze({
    lon: 18.1201,
    lat: 35.3518,
    zoom: 4,
    rotation: 0
});

const DEFAULT_URL_MARKER = Object.freeze({
    lon: 18.0685,
    lat: 59.3293,
    title: "Marker",
    description: "Oops, this is the default description, have you forgot a parameter?",
    icon: "GeoMarker.Filled",
    layerName: "URL Marker",
    backgroundColor: '#0166A5FF',
    color: '#FFFFFFFF',
    projection: CONFIG.Projection.WGS84,
    zoom: 8
});

class HiddenMapNavigationTool extends Control {
    constructor(options = {}) {
        super({
            element: ElementManager.getToolbarElement()
        });

        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.coordinatesModal = undefined;

        // Load stored data from localStorage
        const localStorageState = StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME);
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...localStorageState };

        const coordinatesIcon = getIcon({
            path: SVG_PATHS.Crosshair.Stroked
        });

        const moveCenterIcon = getIcon({
            path: SVG_PATHS.ArrowsMove.Stroked
        });
        
        const focusHereIcon = getIcon({
            path: SVG_PATHS.AspectRatio.Stroked
        });

        ContextMenu.addItem({
            icon: coordinatesIcon,
            name: 'Navigate to coordinates',
            fn: this.onContextMenuCenterAtCoordinate.bind(this)
        })

        ContextMenu.addItem({
            icon: moveCenterIcon, 
            name: 'Center map here', 
            fn: this.onContextMenuCenterMap.bind(this)
        });

        ContextMenu.addItem({
            icon: focusHereIcon, 
            name: 'Focus here', 
            fn: this.onContextMenuFocusHere.bind(this)
        });
        
        ContextMenu.addItem({});

        // Track changes to zoom, paning etc. store in localStorage
        // Must wait until DOM is loaded before the reference to the map can be used
        window.addEventListener(EVENTS.Browser.ContentLoaded, this.onDOMContentLoaded.bind(this));
    }

    onDOMContentLoaded(event) {
        const map = this.getMap();
        if(!Boolean(map)) {
            return;
        }

        // Bind to global map events
        map.on(EVENTS.OpenLayers.MoveEnd, this.onMoveEnd.bind(this));

        // Check if any url parameters are present
        const marker = UrlManager.getParameter('oltb-marker', false);
        if(Boolean(marker)) {
            this.onCreateUrlMarker(marker);
        }
    }

    onCreateUrlMarker(markerString) {
        const map = this.getMap();
        if(!Boolean(map)) {
            return;
        }

        try {
            const markerDataParsed = JSON.parse(markerString);
            const markerData = { ...DEFAULT_URL_MARKER, ...markerDataParsed };

            LogManager.logDebug(FILENAME, 'onCreateUrlMarker', markerData);

            // Make sure projection is formatted correctly
            markerData.projection = markerData.projection.toUpperCase();
            if(!markerData.projection.startsWith('EPSG:')) {
                markerData.projection = `EPSG:${markerData.projection}`;
            }

            if(!ProjectionManager.hasActiveProjection(markerData.projection)) {
                Toast.info({
                    title: 'Projection',
                    message: `
                        Must add projection definition for <strong>${markerData.projection}</strong> <br>
                        <a href="https://epsg.io" target="_blank" class="oltb-link">https://epsg.io</a>
                    `
                }); 

                return;
            }

            // Transform coordinates to format that can be used in the map
            const coordinates = transform(
                [markerData.lon, markerData.lat], 
                markerData.projection, 
                CONFIG.Projection.WGS84
            );

            const prettyCoordinates = toStringHDMS(coordinates);
            const infoWindow = {
                title: markerData.title,
                content: `
                    <p>${markerData.description}</p>
                `,
                footer: `
                    <span class="oltb-info-window__coordinates">${prettyCoordinates}</span>
                    <div class="oltb-info-window__buttons-wrapper">
                        <button class="oltb-func-btn oltb-func-btn--delete oltb-tippy" title="Delete marker" id="${ID_PREFIX}-remove"></button>
                        <button class="oltb-func-btn oltb-func-btn--crosshair oltb-tippy" title="Copy marker coordinates" id="${ID_PREFIX}-copy-coordinates" data-coordinates="${prettyCoordinates}"></button>
                        <button class="oltb-func-btn oltb-func-btn--copy oltb-tippy" title="Copy marker text" id="${ID_PREFIX}-copy-text" data-copy="${markerData.title}, ${markerData.content}"></button>
                    </div>
                `
            };

            // Colors given in URL can't contain hashtag
            if(markerData.color[0] !== '#') {
                markerData.color = `#${markerData.color}`;
            }

            if(markerData.backgroundColor[0] !== '#') {
                markerData.backgroundColor = `#${markerData.backgroundColor}`;
            }

            const marker = new generateMarker({
                lon: coordinates[0],
                lat: coordinates[1],
                title: markerData.title,
                description: markerData.description,
                icon: markerData.icon,
                backgroundColor: markerData.backgroundColor,
                color: markerData.color,
                infoWindow: infoWindow
            });

            const layerWrapper = LayerManager.addFeatureLayer(markerData.layerName);
            layerWrapper.getLayer().getSource().addFeature(marker);

            goToView(map, coordinates, markerData.zoom);

            // Trigger InfoWindow to show
            window.setTimeout(() => {
                InfoWindowManager.showOverly(marker, fromLonLat(coordinates));
            }, CONFIG.AnimationDuration.Normal);
        }catch(error) {
            const errorMessage = 'Failed to parse URL marker';
            LogManager.logError(FILENAME, 'onCreateUrlMarker', {
                message: errorMessage,
                error: error
            });
            
            Toast.error({
                title: 'Error',
                message: errorMessage
            }); 
        }
    }

    onContextMenuCenterAtCoordinate(map, coordinates, target) {
        if(Boolean(this.coordinatesModal)) {
            return;
        }

        this.coordinatesModal = new CoordinateModal({
            onNavigate: (coordinates) => {
                goToView(map, coordinates, map.getView().getZoom());
            },
            onClose: () => {
                this.coordinatesModal = undefined;
            }
        });
    }

    onContextMenuCenterMap(map, coordinates, target) {
        goToView(map, coordinates, map.getView().getZoom());
    }

    onContextMenuFocusHere(map, coordinates, target) {
        goToView(map, coordinates, this.options.focusZoom);
    }

    onMoveEnd(event) {
        const map = this.getMap();
        if(!Boolean(map)) {
            return;
        }

        const view = map.getView();
        const center = toLonLat(view.getCenter());

        this.localStorage.lon = center[0];
        this.localStorage.lat = center[1];
        this.localStorage.zoom = view.getZoom();
        this.localStorage.rotation = view.getRotation();

        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, this.localStorage);
    }
}

export { HiddenMapNavigationTool };