import _ from 'lodash';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { Events } from '../../browser-constants/events';
import { BaseTool } from '../base-tool';
import { goToView } from '../../ol-helpers/go-to-view';
import { transform } from 'ol/proj';
import { LogManager } from '../../toolbar-managers/log-manager/log-manager';
import { UrlManager } from '../../toolbar-managers/url-manager/url-manager';
import { toStringHDMS } from 'ol/coordinate';
import { LayerManager } from '../../toolbar-managers/layer-manager/layer-manager';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ConfigManager } from '../../toolbar-managers/config-manager/config-manager';
import { FeatureManager } from '../../toolbar-managers/feature-manager/feature-manager';
import { CoordinateModal } from '../../ui-extensions/coordinate-modal/coordinate-modal';
import { copyToClipboard } from '../../browser-helpers/copy-to-clipboard';
import { ContextMenuTool } from '../context-menu-tool/context-menu-tool';
import { LocalStorageKeys } from '../../browser-constants/local-storage-keys';
import { InfoWindowManager } from '../../toolbar-managers/info-window-manager/info-window-manager';
import { ProjectionManager } from '../../toolbar-managers/projection-manager/projection-manager';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';
import { fromLonLat, toLonLat } from 'ol/proj';
import { SvgPaths, getSvgIcon } from '../../ui-icons/get-svg-icon/get-svg-icon';

const FILENAME = 'hidden-map-navigation-tool.js';
const CLASS__FUNC_BUTTON = 'oltb-func-btn';
const ID__PREFIX_INFO_WINDOW = 'oltb-info-window-marker';
const I18N__BASE = 'tools.hiddenMapNavigationTool';
const I18N__BASE_COMMON = 'commons';

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
class HiddenMapNavigationTool extends BaseTool {
    constructor(options = {}) {
        super({
            filename: FILENAME
        });

        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        this.coordinatesModal = undefined;

        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        this.copyIcon = getSvgIcon({
            path: SvgPaths.copy.stroked
        });

        this.coordinatesIcon = getSvgIcon({
            path: SvgPaths.crosshair.stroked
        });

        this.moveCenterIcon = getSvgIcon({
            path: SvgPaths.arrowsMove.stroked
        });
        
        this.focusHereIcon = getSvgIcon({
            path: SvgPaths.aspectRatio.stroked
        });

        this.#initContextMenuItems();
        this.attachGlobalListeners();
    }

    attachGlobalListeners() {
        this.onOLTBReadyBind = this.#onOLTBReady.bind(this);
        window.addEventListener(Events.custom.ready, this.onOLTBReadyBind);
    }

    detachGlobalListeners() {
        window.removeEventListener(Events.custom.ready, this.onOLTBReadyBind);
    }

    //--------------------------------------------------------------------
    // # Section: Overridden
    //--------------------------------------------------------------------
    getName() {
        return super.getName();
    }

    //--------------------------------------------------------------------
    // # Section: Init Helpers
    //--------------------------------------------------------------------
    #initContextMenuItems() {
        ContextMenuTool.addItem({
            icon: this.copyIcon,
            i18nKey: `${I18N__BASE}.contextItems.copyCoordinates`,
            fn: this.#onContextMenuCopyCoordinates.bind(this)
        });

        ContextMenuTool.addItem({});
        ContextMenuTool.addItem({
            icon: this.coordinatesIcon,
            i18nKey: `${I18N__BASE}.contextItems.navigateToCoordinates`,
            fn: this.#onContextMenuCenterAtCoordinates.bind(this)
        });

        ContextMenuTool.addItem({
            icon: this.moveCenterIcon, 
            i18nKey: `${I18N__BASE}.contextItems.centerMap`,
            fn: this.#onContextMenuCenterMap.bind(this)
        });

        ContextMenuTool.addItem({
            icon: this.focusHereIcon, 
            i18nKey: `${I18N__BASE}.contextItems.focusMap`,
            fn: this.#onContextMenuFocusHere.bind(this)
        });
        
        ContextMenuTool.addItem({});
    }

    //--------------------------------------------------------------------
    // # Section: ContextMenu Callbacks
    //--------------------------------------------------------------------
    #onContextMenuCopyCoordinates(map, coordinates, target) {
        this.doCopyCoordinatesAsync(coordinates);
    }

    #onContextMenuCenterAtCoordinates(map, coordinates, target) {
        this.doShowCoordinatesModal(map);
    }

    #onContextMenuCenterMap(map, coordinates, target) {
        goToView({
            map: map,
            coordinates: coordinates,
            zoom: map.getView().getZoom()
        });
    }

    #onContextMenuFocusHere(map, coordinates, target) {
        goToView({
            map: map,
            coordinates: coordinates,
            zoom: this.options.focusZoom
        });
    }

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    #onOLTBReady(event) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        // Bind to global map events
        map.on(Events.openLayers.moveEnd, this.#onMoveEnd.bind(this));

        this.doDetectUrlMarker();
    }

    //--------------------------------------------------------------------
    // # Section: Conversions/Validation
    //--------------------------------------------------------------------
    #validateProjection(projection) {
        projection = projection.toUpperCase();

        if(!projection.startsWith('EPSG:')) {
            projection = `EPSG:${projection}`;
        }

        return projection;
    }

    #validateHexColor(color) {
        if(color.startsWith('#')) {
            return color;
        }

        return `#${color}`;
    }

    #hasProjection(projection) {
        const hasProjection = ProjectionManager.hasProjection(projection);

        if(!hasProjection) {
            LogManager.logError(FILENAME, 'hasProjection', {
                message: 'Missing projection definition',
                projection: projection
            });

            Toast.error({
                i18nKey: `${I18N__BASE}.toasts.errors.missingProjection`
            });
        }

        return hasProjection;
    }

    //--------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    //--------------------------------------------------------------------
    #onCreateUrlMarker(markerString) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        this.doParseUrlMarker(markerString);
    }

    #onMoveEnd(event) {
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
    async doCopyCoordinatesAsync(coordinates) {
        const prettyCoordinates = toStringHDMS(coordinates);

        try {
            await copyToClipboard.copyAsync(prettyCoordinates);

            Toast.info({
                i18nKey: `${I18N__BASE}.toasts.infos.coordinatesCopied`,
                autoremove: true
            });
        }catch(error) {
            LogManager.logError(FILENAME, 'doCopyCoordinatesAsync', {
                message: 'Failed to copy coordinates',
                error: error
            });

            Toast.error({
                i18nKey: `${I18N__BASE}.toasts.errors.coordinatesCopy`
            });
        }
    }

    doDetectUrlMarker() {
        const markerKey = ConfigManager.getConfig().urlParameter.marker;
        const marker = UrlManager.getParameter(markerKey, false);
        
        if(marker) {
            this.#onCreateUrlMarker(marker);
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
                i18nKey: `${I18N__BASE}.toasts.errors.parseUrlMarker`
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
        // Note:
        // Colors given in URL can't contain hashtag unless encoded as %23
        // Easier to prepend with hashtag after URL data has been fetched and parsed
        markerData.markerFill = this.#validateHexColor(markerData.markerFill);
        markerData.markerStroke = this.#validateHexColor(markerData.markerStroke);
        markerData.projection = this.#validateProjection(markerData.projection);

        if(!this.#hasProjection(markerData.projection)) {
            return;
        }

        const transformedCoordinates = transform(
            coordinates, 
            markerData.projection, 
            ConfigManager.getConfig().projection.wgs84
        );

        const i18n = TranslationManager.get(`${I18N__BASE_COMMON}.titles`);
        const prettyCoordinates = toStringHDMS(transformedCoordinates);
        const infoWindow = {
            title: markerData.title,
            content: `
                <p>${markerData.description}</p>
            `,
            footer: `
                <span class="oltb-info-window__coordinates">${prettyCoordinates}</span>
                <div class="oltb-info-window__buttons-wrapper">
                    <button class="${CLASS__FUNC_BUTTON} ${CLASS__FUNC_BUTTON}--delete oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.delete" title="${i18n.delete}" id="${ID__PREFIX_INFO_WINDOW}-remove"></button>
                    <button class="${CLASS__FUNC_BUTTON} ${CLASS__FUNC_BUTTON}--crosshair oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.copyCoordinates" title="${i18n.copyCoordinates}" id="${ID__PREFIX_INFO_WINDOW}-copy-coordinates" data-oltb-coordinates="${prettyCoordinates}"></button>
                    <button class="${CLASS__FUNC_BUTTON} ${CLASS__FUNC_BUTTON}--copy oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.copyText" title="${i18n.copyText}" id="${ID__PREFIX_INFO_WINDOW}-copy-text" data-oltb-copy="${markerData.title}, ${markerData.description}"></button>
                    <button class="${CLASS__FUNC_BUTTON} ${CLASS__FUNC_BUTTON}--layer oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.showLayer" title="${i18n.showLayer}" id="${ID__PREFIX_INFO_WINDOW}-show-layer"></button>
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