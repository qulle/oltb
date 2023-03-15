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
import { generateMarker } from '../../generators/GenerateMarker';
import { ElementManager } from '../../core/managers/ElementManager';
import { CoordinateModal } from '../modal-extensions/CoordinateModal';
import { LocalStorageKeys } from '../../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../../core/icons/GetIcon';
import { InfoWindowManager } from '../../core/managers/InfoWindowManager';
import { ProjectionManager } from '../../core/managers/ProjectionManager';
import { fromLonLat, toLonLat } from 'ol/proj';

const FILENAME = 'hidden-tools/HiddenMapNavigationTool.js';
const ID_PREFIX = 'oltb-info-window-marker';

const DefaultOptions = Object.freeze({
    focusZoom: 2
});

// This is the same NODE_NAME and PROPS that the map.js file is using
const LocalStorageNodeName = LocalStorageKeys.mapData;
const LocalStorageDefaults = Object.freeze({
    lon: 18.1201,
    lat: 35.3518,
    zoom: 4,
    rotation: 0
});

const DefaultUrlMarker = Object.freeze({
    lon: 18.0685,
    lat: 59.3293,
    title: "Marker",
    description: "Oops, this is the default description, have you forgot a parameter?",
    icon: "GeoMarker.Filled",
    layerName: "URL Marker",
    fill: '#0166A5FF',
    stroke: '#FFFFFFFF',
    projection: Config.projection.wgs84,
    zoom: 8
});

class HiddenMapNavigationTool extends Control {
    constructor(options = {}) {
        super({
            element: ElementManager.getToolbarElement()
        });

        this.options = { ...DefaultOptions, ...options };
        this.coordinatesModal = undefined;

        // Load stored data from localStorage
        const localStorageState = StateManager.getStateObject(LocalStorageNodeName);
        this.localStorage = { ...LocalStorageDefaults, ...localStorageState };

        const coordinatesIcon = getIcon({
            path: SvgPaths.crosshair.stroked
        });

        const moveCenterIcon = getIcon({
            path: SvgPaths.arrowsMove.stroked
        });
        
        const focusHereIcon = getIcon({
            path: SvgPaths.aspectRatio.stroked
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
        window.addEventListener(Events.browser.contentLoaded, this.onDOMContentLoaded.bind(this));
    }

    onDOMContentLoaded(event) {
        const map = this.getMap();
        if(!Boolean(map)) {
            return;
        }

        // Bind to global map events
        map.on(Events.openLayers.moveEnd, this.onMoveEnd.bind(this));

        const marker = UrlManager.getParameter(Config.urlParameters.marker, false);
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
            const markerData = { ...DefaultUrlMarker, ...markerDataParsed };

            LogManager.logDebug(FILENAME, 'onCreateUrlMarker', markerData);

            // Make sure projection is formatted correctly
            markerData.projection = markerData.projection.toUpperCase();
            if(!markerData.projection.startsWith('EPSG:')) {
                markerData.projection = `EPSG:${markerData.projection}`;
            }

            if(!ProjectionManager.hasProjection(markerData.projection)) {
                const errorMessage = `Must add projection definition for <strong>${markerData.projection}</strong>`;
                LogManager.logError(FILENAME, 'onCreateUrlMarker', errorMessage);

                Toast.error({
                    title: 'Error',
                    message: `
                        ${errorMessage} <br>
                        <a href="https://epsg.io" target="_blank" class="oltb-link">https://epsg.io</a>
                    `
                }); 

                return;
            }

            // Transform coordinates to format that can be used in the map
            const coordinates = transform(
                [markerData.lon, markerData.lat], 
                markerData.projection, 
                Config.projection.wgs84
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

            // Colors given in URL can't contain hashtag unless encoded as %23
            // Easier to prepend with hashtag after URL data has been fetched and parsed
            if(markerData.stroke[0] !== '#') {
                markerData.stroke = `#${markerData.stroke}`;
            }

            if(markerData.fill[0] !== '#') {
                markerData.fill = `#${markerData.fill}`;
            }

            const marker = new generateMarker({
                lon: coordinates[0],
                lat: coordinates[1],
                title: markerData.title,
                description: markerData.description,
                icon: markerData.icon,
                fill: markerData.fill,
                stroke: markerData.stroke,
                infoWindow: infoWindow
            });

            const layerWrapper = LayerManager.addFeatureLayer(markerData.layerName);
            layerWrapper.getLayer().getSource().addFeature(marker);

            goToView(map, coordinates, markerData.zoom);

            // Trigger InfoWindow to show
            window.setTimeout(() => {
                InfoWindowManager.showOverly(marker, fromLonLat(coordinates));
            }, Config.animationDuration.normal);
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

        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }
}

export { HiddenMapNavigationTool };