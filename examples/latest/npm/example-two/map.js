// (1). Core OpenLayers
import 'ol/ol.css';
import { Map, View } from 'ol';
import { fromLonLat } from 'ol/proj';
import { get as getProjection } from 'ol/proj';
import { defaults as defaultControls } from 'ol/control';
import { platformModifierKeyOnly, altShiftKeysOnly, shiftKeyOnly, targetNotEditable } from 'ol/events/condition';
import { defaults as defaultInterctions, MouseWheelZoom, DragPan, DragRotate, KeyboardZoom, KeyboardPan } from 'ol/interaction';

// (2). Add layers
import '../shared/layers/Maps';
import '../shared/layers/Wind';
import '../shared/layers/Capitals';
import '../shared/layers/Countries';
import '../shared/layers/Continents';

// (3). Additional toolbar helpers
import '../../../../src/oltb/js/modules/core/Tooltips';
import '../../../../src/oltb/js/modules/epsg/Registrate';
import '../../../../src/oltb/js/modules/helpers/SlideToggle';
import '../../../../src/oltb/js/modules/helpers/Accessibility';
import '../../../../src/oltb/js/modules/helpers/Browser/Prototypes';

// (4). Core Toolbar
import '../../../../src/oltb/scss/oltb.scss';
import CONFIG from '../../../../src/oltb/js/modules/core/Config';
import ContextMenu from '../../../../src/oltb/js/modules/common/ContextMenu';
import { SETTINGS } from '../../../../src/oltb/js/modules/helpers/constants/Settings';
import { MAP_ELEMENT } from '../../../../src/oltb/js/modules/core/ElementReferences';
import { CONTEXT_MENUS } from '../../../../src/oltb/js/modules/helpers/constants/ContextMenus';

// (5). Core Managers
import LayerManager from '../../../../src/oltb/js/modules/core/managers/LayerManager';
import StateManager from '../../../../src/oltb/js/modules/core/managers/StateManager';
import TooltipManager from '../../../../src/oltb/js/modules/core/managers/TooltipManager';
import SettingsManager from '../../../../src/oltb/js/modules/core/managers/SettingsManager';
import InfoWindowManager from '../../../../src/oltb/js/modules/core/managers/InfoWindowManager';

// (6). Import individual tools
import HomeTool from '../../../../src/oltb/js/modules/tools/HomeTool';
import DrawTool from '../../../../src/oltb/js/modules/tools/DrawTool';
import EditTool from '../../../../src/oltb/js/modules/tools/EditTool';
import InfoTool from '../../../../src/oltb/js/modules/tools/InfoTool';
import HelpTool from '../../../../src/oltb/js/modules/tools/HelpTool';
import ThemeTool from '../../../../src/oltb/js/modules/tools/ThemeTool';
import LayerTool from '../../../../src/oltb/js/modules/tools/LayerTool';
import ZoomInTool from '../../../../src/oltb/js/modules/tools/ZoomInTool';
import MeasureTool from '../../../../src/oltb/js/modules/tools/MeasureTool';
import MagnifyTool from '../../../../src/oltb/js/modules/tools/MagnifyTool';
import ZoomOutTool from '../../../../src/oltb/js/modules/tools/ZoomOutTool';
import RefreshTool from '../../../../src/oltb/js/modules/tools/RefreshTool';
import SettingsTool from '../../../../src/oltb/js/modules/tools/SettingsTool';
import OverviewTool from '../../../../src/oltb/js/modules/tools/OverviewTool';
import BookmarkTool from '../../../../src/oltb/js/modules/tools/BookmarkTool';
import DirectionTool from '../../../../src/oltb/js/modules/tools/DirectionTool';
import DebugInfoTool from '../../../../src/oltb/js/modules/tools/DebugInfoTool';
import SplitViewTool from '../../../../src/oltb/js/modules/tools/SplitViewTool';
import ExportPNGTool from '../../../../src/oltb/js/modules/tools/ExportPNGTool';
import ScaleLineTool from '../../../../src/oltb/js/modules/tools/ScaleLineTool';
import GraticuleTool from '../../../../src/oltb/js/modules/tools/GraticuleTool';
import MyLocationTool from '../../../../src/oltb/js/modules/tools/MyLocationTool';
import ResetNorthTool from '../../../../src/oltb/js/modules/tools/ResetNorthTool';
import FullScreenTool from '../../../../src/oltb/js/modules/tools/FullScreenTool';
import CoordinatesTool from '../../../../src/oltb/js/modules/tools/CoordinatesTool';
import HiddenAboutTool from '../../../../src/oltb/js/modules/tools/hidden-tools/AboutTool';
import NotificationTool from '../../../../src/oltb/js/modules/tools/NotificationTool';
import HiddenMarkerTool from '../../../../src/oltb/js/modules/tools/hidden-tools/MarkerTool';
import ImportVectorLayerTool from '../../../../src/oltb/js/modules/tools/ImportVectorLayerTool';
import HiddenMapNavigationTool from '../../../../src/oltb/js/modules/tools/hidden-tools/MapNavigationTool';

// Note: This is the same NODE_NAME and PROPS that the MapNavigationTool.js is using
const LOCAL_STORAGE_NODE_NAME = 'mapData';
const LOCAL_STORAGE_DEFAULTS = {
    lon: 25.5809,
    lat: 23.7588,
    zoom: 3,
    rotation: 0
};

// (7). Load stored data from localStorage
const LOCAL_STORAGE_STATE = JSON.parse(StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME)) || {};
const LOCAL_STORAGE = { ...LOCAL_STORAGE_DEFAULTS, ...LOCAL_STORAGE_STATE };

// (8). Create Map instance
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
        rotate: false
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
            styleChange: function(event, style) {
                console.log('Feature style changed');
            },
            shapeOperation: function(type, a, b, result) {
                console.log('Shape operation', type);
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
            },
            error: function(event) {
                console.log('Edit error');
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
            timeout: 10000,
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
            onlyWhenGetParameter: false,
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

// (9). Initialize static managers
[
    LayerManager,
    StateManager,
    TooltipManager,
    SettingsManager,
    InfoWindowManager
].forEach((manager) => {
    manager.init(map);
});