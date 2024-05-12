import _ from 'lodash';
import { Toast } from '../../common/Toast';
import { Events } from '../../helpers/constants/Events';
import { Control } from 'ol/control';
import { goToView } from '../../helpers/GoToView';
import { transform } from 'ol/proj';
import { LogManager } from '../../managers/LogManager';
import { UrlManager } from '../../managers/UrlManager';
import { ContextMenu } from '../../common/ContextMenu';
import { toStringHDMS } from 'ol/coordinate';
import { LayerManager } from '../../managers/LayerManager';
import { StateManager } from '../../managers/StateManager';
import { ConfigManager } from '../../managers/ConfigManager';
import { ElementManager } from '../../managers/ElementManager';
import { FeatureManager } from '../../managers/FeatureManager';
import { CoordinateModal } from '../modal-extensions/CoordinateModal';
import { copyToClipboard } from '../../helpers/browser/CopyToClipboard';
import { LocalStorageKeys } from '../../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../../icons/GetIcon';
import { InfoWindowManager } from '../../managers/InfoWindowManager';
import { ProjectionManager } from '../../managers/ProjectionManager';
import { TranslationManager } from '../../managers/TranslationManager';
import { fromLonLat, toLonLat } from 'ol/proj';

const FILENAME = 'hidden-tools/HiddenMapNavigationTool.js';
const CLASS_FUNC_BUTTON = 'oltb-func-btn';
const ID_PREFIX_INFO_WINDOW = 'oltb-info-window-marker';
const I18N_BASE = 'tools.hiddenMapNavigationTool';
const I18N_BASE_COMMON = 'commons';

const DefaultOptions = Object.freeze({
    focusZoom: 2
});

const DefaultLocation = ConfigManager.getConfig().location.default;
const LocalStorageNodeName = LocalStorageKeys.mapData;
const LocalStorageDefaults = Object.freeze({
    lon: DefaultLocation.lon,
    lat: DefaultLocation.lat,
    zoom: DefaultLocation.zoom,
    rotation: DefaultLocation.rotation,
});

// Note:
// This model does not follow the model of a Marker. 
// This is to make it easier for the user and not have a deep object in the url
const DefaultProjection = ConfigManager.getConfig().projection;
const DefaultUrlMarker = Object.freeze({
    lon: 18.0685,
    lat: 59.3293,
    title: 'Marker',
    description: '',
    icon: 'geoMarker.filled',
    iconFill: '#FFFFFFFF',
    iconStroke: '#FFFFFFFF',
    markerFill: '#0166A5FF',
    markerStroke: '#0166A566',
    layerName: 'URL Marker',
    label: 'Marker',
    labelFill: '#FFFFFFFF',
    labelStroke: '#3B4352CC',
    labelStrokeWidth: 8,
    labelFont: '14px Calibri',
    labelUseEllipsisAfter: 20,
    projection: DefaultProjection.wgs84,
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

        window.addEventListener(Events.custom.ready, this.onOLTBReady.bind(this));
    }

    getName() {
        return FILENAME;
    }

    //--------------------------------------------------------------------
    // # Section: Init Helpers
    //--------------------------------------------------------------------
    initContextMenuItems() {
        ContextMenu.addItem({
            icon: this.clipboardIcon,
            i18nKey: `${I18N_BASE}.contextItems.copyCoordinates`,
            fn: this.onContextMenuCopyCoordinates.bind(this)
        });

        ContextMenu.addItem({});

        ContextMenu.addItem({
            icon: this.coordinatesIcon,
            i18nKey: `${I18N_BASE}.contextItems.navigateToCoordinates`,
            fn: this.onContextMenuCenterAtCoordinates.bind(this)
        });

        ContextMenu.addItem({
            icon: this.moveCenterIcon, 
            i18nKey: `${I18N_BASE}.contextItems.centerMap`,
            fn: this.onContextMenuCenterMap.bind(this)
        });

        ContextMenu.addItem({
            icon: this.focusHereIcon, 
            i18nKey: `${I18N_BASE}.contextItems.focusMap`,
            fn: this.onContextMenuFocusHere.bind(this)
        });
        
        ContextMenu.addItem({});
    }

    //--------------------------------------------------------------------
    // # Section: ContextMenu Callbacks
    //--------------------------------------------------------------------
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

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    onOLTBReady(event) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        // Bind to global map events
        map.on(Events.openLayers.moveEnd, this.onMoveEnd.bind(this));

        this.doDetectUrlMarker();
    }

    //--------------------------------------------------------------------
    // # Section: Conversions/Validation
    //--------------------------------------------------------------------
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
            LogManager.logError(FILENAME, 'hasProjection', {
                message: 'Missing projection definition',
                projection: projection
            });

            Toast.error({
                i18nKey: `${I18N_BASE}.toasts.errors.missingProjection`
            });
        }

        return hasProjection;
    }

    //--------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    //--------------------------------------------------------------------
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

    //--------------------------------------------------------------------
    // # Section: Getters and Setters
    //--------------------------------------------------------------------
    setLastPosition(map) {
        const view = map.getView();
        const center = toLonLat(view.getCenter());

        this.localStorage.lon = center[0];
        this.localStorage.lat = center[1];
        this.localStorage.zoom = view.getZoom();
        this.localStorage.rotation = view.getRotation();

        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
    async doCopyCoordinates(coordinates) {
        const prettyCoordinates = toStringHDMS(coordinates);

        try {
            await copyToClipboard(prettyCoordinates);

            Toast.info({
                i18nKey: `${I18N_BASE}.toasts.infos.coordinatesCopied`,
                autoremove: ConfigManager.getConfig().autoRemovalDuation.normal
            });
        }catch(error) {
            LogManager.logError(FILENAME, 'doCopyCoordinates', {
                message: 'Failed to copy coordinates',
                error: error
            });

            Toast.error({
                i18nKey: `${I18N_BASE}.toasts.errors.coordinatesCopy`
            });
        }
    }

    doDetectUrlMarker() {
        const markerKey = ConfigManager.getConfig().urlParameter.marker;
        const marker = UrlManager.getParameter(markerKey, false);
        
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
            this.doFocusMarker(map, marker, coordinates, ConfigManager.getConfig().marker.focusZoom);
        }catch(error) {
            LogManager.logError(FILENAME, 'doParseUrlMarker', {
                message: 'Failed to parse URL Marker',
                error: error
            });
            
            Toast.error({
                i18nKey: `${I18N_BASE}.toasts.errors.parseUrlMarker`
            }); 
        } 
    }

    doFocusMarker(map, marker, coordinates, zoom) {
        goToView({
            map: map,
            coordinates: coordinates,
            zoom: zoom,
            onDone: (result) => {
                InfoWindowManager.tryPulseAnimation(marker);
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
            ConfigManager.getConfig().projection.wgs84
        );

        const i18n = TranslationManager.get(`${I18N_BASE_COMMON}.titles`);
        const prettyCoordinates = toStringHDMS(transformedCoordinates);
        const infoWindow = {
            title: markerData.title,
            content: `
                <p>${markerData.description}</p>
            `,
            footer: `
                <span class="oltb-info-window__coordinates">${prettyCoordinates}</span>
                <div class="oltb-info-window__buttons-wrapper">
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--delete oltb-tippy" data-oltb-i18n="${I18N_BASE_COMMON}.titles.delete" title="${i18n.delete}" id="${ID_PREFIX_INFO_WINDOW}-remove"></button>
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--crosshair oltb-tippy" data-oltb-i18n="${I18N_BASE_COMMON}.titles.copyCoordinates" title="${i18n.copyCoordinates}" id="${ID_PREFIX_INFO_WINDOW}-copy-coordinates" data-oltb-coordinates="${prettyCoordinates}"></button>
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--copy oltb-tippy" data-oltb-i18n="${I18N_BASE_COMMON}.titles.copyText" title="${i18n.copyText}" id="${ID_PREFIX_INFO_WINDOW}-copy-text" data-oltb-copy="${markerData.title}, ${markerData.description}"></button>
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--layer oltb-tippy" data-oltb-i18n="${I18N_BASE_COMMON}.titles.showLayer" title="${i18n.showLayer}" id="${ID_PREFIX_INFO_WINDOW}-show-layer"></button>
                </div>
            `
        };

        const marker = FeatureManager.generateIconMarker({
            lon: transformedCoordinates[0],
            lat: transformedCoordinates[1],
            title: markerData.title,
            description: markerData.description,
            infoWindow: infoWindow,
            marker: {
                fill: markerData.markerFill,
                stroke: markerData.markerStroke
            },
            icon: {
                key: markerData.icon,
                fill: markerData.iconFill,
                stroke: markerData.iconStroke
            },
            label: {
                text: markerData.label,
                font: markerData.labelFont,
                fill: markerData.labelFill,
                stroke: markerData.labelStroke,
                strokeWidth: markerData.labelStrokeWidth
            }
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