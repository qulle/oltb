// (1). Core OpenLayers
import 'ol/ol.css';
import { Map, View } from 'ol';
import { fromLonLat } from 'ol/proj';
import { platformModifierKeyOnly, altShiftKeysOnly, shiftKeyOnly, targetNotEditable } from 'ol/events/condition';
import { defaults as defaultInterctions, MouseWheelZoom, DragPan, DragRotate, KeyboardZoom, KeyboardPan } from 'ol/interaction';
import { defaults as defaultControls } from 'ol/control';
import { get as getProjection } from 'ol/proj';

// (2). Toolbar tools
import HiddenMarkerTool from './modules/tools/hidden-tools/MarkerTool';
import HiddenMapNavigationTool from './modules/tools/hidden-tools/MapNavigationTool';
import HomeTool from './modules/tools/HomeTool';
import ZoomInTool from './modules/tools/ZoomInTool';
import ZoomOutTool from './modules/tools/ZoomOutTool';
import FullScreenTool from './modules/tools/FullScreenTool';
import ExportPNGTool from './modules/tools/ExportPNGTool';
import DrawTool from './modules/tools/DrawTool';
import MeasureTool from './modules/tools/MeasureTool';
import EditTool from './modules/tools/EditTool';
import BookmarkTool from './modules/tools/BookmarkTool';
import LayerTool from './modules/tools/LayerTool';
import SplitViewTool from './modules/tools/SplitViewTool';
import OverviewTool from './modules/tools/OverviewTool';
import GraticuleTool from './modules/tools/GraticuleTool';
import MagnifyTool from './modules/tools/MagnifyTool';
import ResetNorthTool from './modules/tools/ResetNorthTool';
import CoordinatesTool from './modules/tools/CoordinatesTool';
import MyLocationTool from './modules/tools/MyLocationTool';
import ImportVectorLayerTool from './modules/tools/ImportVectorLayerTool';
import ScaleLineTool from './modules/tools/ScaleLineTool';
import RefreshTool from './modules/tools/RefreshTool';
import ThemeTool from './modules/tools/ThemeTool';
import DirectionTool from './modules/tools/DirectionTool';
import InfoTool from './modules/tools/InfoTool';
import NotificationTool from './modules/tools/NotificationTool';
import HelpTool from './modules/tools/HelpTool';
import SettingsTool from './modules/tools/SettingsTool';
import DebugInfoTool from './modules/tools/DebugInfoTool';
import HiddenAboutTool from './modules/tools/hidden-tools/AboutTool';

// (3). Additional toolbar helpers
import CONFIG from './modules/core/Config';
import ContextMenu from './modules/common/ContextMenu';
import LayerManager from './modules/core/managers/LayerManager';
import StateManager from './modules/core/managers/StateManager';
import TooltipManager from './modules/core/managers/TooltipManager';
import SettingsManager from './modules/core/managers/SettingsManager';
import InfoWindowManager from './modules/core/managers/InfoWindowManager';
import { MAP_ELEMENT } from './modules/core/ElementReferences';
import { CONTEXT_MENUS } from './modules/helpers/constants/ContextMenus';
import { SETTINGS } from './modules/helpers/constants/Settings';
import './modules/core/Tooltips';
import './modules/epsg/Registrate';
import './modules/helpers/Browser/Prototypes';
import './modules/helpers/Accessibility';
import './modules/helpers/SlideToggle';

// (4). Load layers
import './modules/layers/Maps';
import './modules/layers/Countries';
// import './modules/layers/Continents';
// import './modules/layers/Wind';
// import './modules/layers/Capitals';

// Note: This is the same NODE_NAME and PROPS that the MapNavigation.js tool is using
const LOCAL_STORAGE_NODE_NAME = 'mapData';
const LOCAL_STORAGE_DEFAULTS = {
    lon: 25.5809,
    lat: 23.7588,
    zoom: 3,
    rotation: 0
};

// Load potential stored data from localStorage
const LOCAL_STORAGE_STATE = JSON.parse(StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME)) || {};
const LOCAL_STORAGE = { ...LOCAL_STORAGE_DEFAULTS, ...LOCAL_STORAGE_STATE };

const map = new Map({
    interactions: defaultInterctions({
        mouseWheelZoom: false,
        altShiftDragRotate: false,
        dragPan: false,
        keyboard: false
    }).extend([
        new MouseWheelZoom({
            condition: function(event) { 
                return platformModifierKeyOnly(event) || SettingsManager.getSetting(SETTINGS.MouseWheelZoom); 
            }
        }),
        new DragRotate({
            condition: function(event) {
                return altShiftKeysOnly(event) && SettingsManager.getSetting(SETTINGS.AltShiftDragRotate);
            }
        }),
        new DragPan({
            condition: function(event) {
                return (platformModifierKeyOnly(event) || SettingsManager.getSetting(SETTINGS.DragPan)) && !altShiftKeysOnly(event) && !shiftKeyOnly(event);
            }
        }),
        new KeyboardZoom({
            condition: function(event) {
                return SettingsManager.getSetting(SETTINGS.KeyboardZoom) && targetNotEditable(event);
            }
        }),
        new KeyboardPan({
            condition: function(event) {
                return SettingsManager.getSetting(SETTINGS.KeyboardPan) && targetNotEditable(event);
            }
        })
    ]),
    controls: defaultControls({
        zoom: false, 
        rotate: false, 
        attribution: SettingsManager.getSetting(SETTINGS.ShowAttributions)
    }).extend([
        new HiddenMarkerTool({
            added: function(marker) {
                console.log('Marker added', marker);
            },
            removed: function(marker) {
                console.log('Marker removed', marker);
            },
            edited: function(before, after) {
                console.log('Marker edited', before, after);
            }
        }),
        new HiddenMapNavigationTool({
            focusZoom: 10
        }),
        new HomeTool({
            lon: 25.5809,
            lat: 23.7588,
            zoom: 3,
            click: function() {
                console.log('HomeTool click');
            },
            home: function() {
                console.log('Map zoomed home');
            }
        }),
        new ZoomInTool({
            click: function() {
                console.log('ZoomInTool clicked');
            },
            zoomed: function() {
                console.log('Zoomed in');
            }
        }),
        new ZoomOutTool({
            click: function() {
                console.log('ZoomOutTool clicked');
            },
            zoomed: function() {
                console.log('Zoomed out');
            }
        }),
        new FullScreenTool({
            click: function() {
                console.log('FullScreenTool clicked');
            },
            enter: function(event) {
                console.log('Enter fullscreen mode', event);
            },
            leave: function(event) {
                console.log('Leave fullscreen mode', event);
            }
        }),
        new ExportPNGTool({
            click: function() {
                console.log('ExportPNGTool clicked');
            },
            exported: function() {
                console.log('Map exported as png');
            }
        }),
        new DrawTool({
            click: function() {
                console.log('DrawTool clicked');
            },
            start: function(event) {
                console.log('Draw Start');
            },
            end: function(event) {
                console.log('Draw end', event.feature);
            },
            abort: function(event) {
                console.log('Draw abort');
            },
            error: function(event) {
                console.log('Draw error');
            },
            intersected: function(event, intersectedFeatures) {
                console.log('Draw end', event.feature);
                console.log('Intersected features', intersectedFeatures);
            }
        }),
        new MeasureTool({
            click: function() {
                console.log('MeasureTool clicked');
            },
            start: function(event) {
                console.log('Measure Start');
            },
            end: function(event) {
                console.log('Measure end', event.feature);
            },
            abort: function(event) {
                console.log('Measure abort');
            },
            error: function(event) {
                console.log('Measure error');
            }
        }),
        new EditTool({
            hitTolerance: 5,
            click: function() {
                console.log('EditTool clicked');
            },
            selectadd: function(event) {
                console.log('Selected feature');
            },
            selectremove: function(event) {
                console.log('Deselected feature');
            },
            modifystart: function(event) {
                console.log('Modify start');
            },
            modifyend: function(event) {
                console.log('Modify end');
            },
            translatestart: function(event) {
                console.log('Translate start');
            },
            translateend: function(event) {
                console.log('Translate end');
            },
            removedfeature: function(feature) {
                console.log('Removed feature', feature);
            }
        }),
        new BookmarkTool({
            storeDataInLocalStorage: true,
            click: function() {
                console.log('BookmarkTool clicked');
            },
            added: function(bookmark) {
                console.log('Bookmark added', bookmark);
            },
            removed: function(bookmark) {
                console.log('Bookmark removed', bookmark);
            },
            renamed: function(bookmark) {
                console.log('Bookmark renamed', bookmark);
            },
            zoomedTo: function(bookmark) {
                console.log('Zoomed to bookmark', bookmark);
            },
            cleared: function() {
                console.log('Bookmarks cleared');
            }
        }),
        new LayerTool({
            click: function() {
                console.log('LayerTool clicked');
            },
            mapLayerAdded: function(layerWrapper) {
                console.log('Map layer added', layerWrapper);
            },
            mapLayerRemoved: function(layerWrapper) {
                console.log('Map layer removed', layerWrapper);
            },
            mapLayerRenamed: function(layerWrapper) {
                console.log('Map layer renamed', layerWrapper);
            },
            mapLayerVisibilityChanged: function(layerWrapper) {
                console.log('Map layer visibility change', layerWrapper);
            },
            featureLayerAdded: function(layerWrapper) {
                console.log('Feature layer added', layerWrapper);
            },
            featureLayerRemoved: function(layerWrapper) {
                console.log('Feature layer removed', layerWrapper);
            },
            featureLayerRenamed: function(layerWrapper) {
                console.log('Feature layer renamed', layerWrapper);
            },
            featureLayerVisibilityChanged: function(layerWrapper) {
                console.log('Feature layer visibility change', layerWrapper);
            },
            featureLayerDownloaded: function(layerWrapper) {
                console.log('Feature layer downloaded', layerWrapper);
            }
        }),
        new SplitViewTool({
            click: function() {
                console.log('SplitViewTool clicked');
            }
        }),
        new OverviewTool({
            click: function() {
                console.log('OverviewTool clicked');
            }
        }),
        new GraticuleTool({
            color: 'rgba(59, 67, 82, 0.9)',
            dashed: true,
            width: 2,
            showLabels: true,
            wrapX: true,
            click: function() {
                console.log('GraticuleTool clicked');
            }
        }),
        new MagnifyTool({
            click: function() {
                console.log('MagnifyTool clicked');
            }
        }),
        new ResetNorthTool({
            click: function() {
                console.log('ResetNorthTool clicked');
            },
            reset: function() {
                console.log('Map north reset');
            }
        }),
        new CoordinatesTool({
            click: function() {
                console.log('CoordinatesTool clicked');
            },
            mapClicked: function(coordinates) {
                console.log('You clicked at', coordinates);
            }
        }),
        new MyLocationTool({
            enableHighAccuracy: true,
            timeout: 5000,
            click: function() {
                console.log('MyLocationTool clicked');
            },
            location: function(location) {
                console.log('Location', location);
            },
            error: function(error) {
                console.log('Location error', error);
            }
        }),
        new ImportVectorLayerTool({
            click: function() {
                console.log('ImportVectorLayerTool clicked');
            },
            imported: function(features) {
                console.log('Imported', features);
            },
            error: function(filename, error) {
                console.log('Error when importing file:', filename, error);
            }
        }),
        new ScaleLineTool({
            units: 'metric',
            click: function() {
                console.log('ScaleLineTool clicked');
            }
        }),
        new RefreshTool({
            click: function() {
                console.log('RefreshTool clicked');
            }
        }),
        new ThemeTool({
            click: function() {
                console.log('ThemeTool clicked');
            },
            changed: function(theme) {
                console.log('Theme changed to', theme);
            }
        }),
        new DirectionTool({
            click: function() {
                console.log('DirectionTool clicked');
            },
            changed: function(direction) {
                console.log('Direction changed to', direction);
            }
        }),
        new InfoTool({
            title: 'Hey!', 
            content: '<p>This is a <em>modal window</em>, here you can place some text about your application or links to external resources.</p>',
            click: function() {
                console.log('InfoTool clicked');
            }
        }),
        new NotificationTool({
            click: function() {
                console.log('NotificationTool clicked');
            }
        }),
        new HelpTool({
            url: 'https://github.com/qulle/oltb',
            target: '_blank',
            click: function() {
                console.log('HelpTool clicked');
            }
        }),
        new SettingsTool({
            click: function() {
                console.log('SettingsTool clicked');
            },
            cleared: function() {
                console.log('Settings cleared');
            }
        }),
        new DebugInfoTool({
            click: function() {
                console.log('DebugInfoTool clicked');
            }
        }),
        new HiddenAboutTool(),
        new ContextMenu({
            name: CONTEXT_MENUS.MainMap, 
            selector: '#map canvas'
        })
    ]),
    target: MAP_ELEMENT,
    view: new View({
        projection: getProjection(CONFIG.projection),
        center: fromLonLat([
            LOCAL_STORAGE.lon, 
            LOCAL_STORAGE.lat
        ], CONFIG.projection),
        zoom: LOCAL_STORAGE.zoom,
        rotation: LOCAL_STORAGE.rotation
    })
});

// Initialize static managers with reference to map
[
    InfoWindowManager, 
    LayerManager, 
    TooltipManager
].forEach((manager) => {
    manager.init(map);
});