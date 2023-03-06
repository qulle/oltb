// Core OpenLayers
import 'ol/ol.css';
import { Map, View } from 'ol';
import { fromLonLat } from 'ol/proj';
import { get as getProjection } from 'ol/proj';
import { defaults as defaultControls } from 'ol/control';
import { platformModifierKeyOnly, altShiftKeysOnly, shiftKeyOnly, targetNotEditable } from 'ol/events/condition';
import { defaults as defaultInterctions, MouseWheelZoom, DragPan, DragRotate, KeyboardZoom, KeyboardPan } from 'ol/interaction';

// Layers
import '../shared/Maps';

// Toolbar helpers
import 'oltb/dist/src/oltb/js/core/Tooltips';
import 'oltb/dist/src/oltb/js/epsg/Registrate';
import 'oltb/dist/src/oltb/js/helpers/Accessibility';
import 'oltb/dist/src/oltb/js/helpers/browser/Prototypes';
import 'oltb/dist/src/oltb/js/helpers/browser/SlideToggle';

// Core Toolbar
import 'oltb/dist/src/oltb/scss/oltb.scss';
import { CONFIG } from 'oltb/dist/src/oltb/js/core/Config';
import { SETTINGS } from 'oltb/dist/src/oltb/js/helpers/constants/Settings';
import { ContextMenu } from 'oltb/dist/src/oltb/js/common/ContextMenu';
import { MAP_ELEMENT } from 'oltb/dist/src/oltb/js/core/elements/index';
import { LOCAL_STORAGE_KEYS } from 'oltb/dist/src/oltb/js/helpers/constants/LocalStorageKeys';

// Core Managers
import { LayerManager } from 'oltb/dist/src/oltb/js/core/managers/LayerManager';
import { StateManager } from 'oltb/dist/src/oltb/js/core/managers/StateManager';
import { TooltipManager } from 'oltb/dist/src/oltb/js/core/managers/TooltipManager';
import { SettingsManager } from 'oltb/dist/src/oltb/js/core/managers/SettingsManager';
import { InfoWindowManager } from 'oltb/dist/src/oltb/js/core/managers/InfoWindowManager';

// Toolbar tools
import { HomeTool } from 'oltb/dist/src/oltb/js/tools/HomeTool';
import { DrawTool } from 'oltb/dist/src/oltb/js/tools/DrawTool';
import { EditTool } from 'oltb/dist/src/oltb/js/tools/EditTool';
import { InfoTool } from 'oltb/dist/src/oltb/js/tools/InfoTool';
import { HelpTool } from 'oltb/dist/src/oltb/js/tools/HelpTool';
import { ThemeTool } from 'oltb/dist/src/oltb/js/tools/ThemeTool';
import { LayerTool } from 'oltb/dist/src/oltb/js/tools/LayerTool';
import { ZoomInTool } from 'oltb/dist/src/oltb/js/tools/ZoomInTool';
import { MeasureTool } from 'oltb/dist/src/oltb/js/tools/MeasureTool';
import { MagnifyTool } from 'oltb/dist/src/oltb/js/tools/MagnifyTool';
import { ZoomOutTool } from 'oltb/dist/src/oltb/js/tools/ZoomOutTool';
import { RefreshTool } from 'oltb/dist/src/oltb/js/tools/RefreshTool';
import { SettingsTool } from 'oltb/dist/src/oltb/js/tools/SettingsTool';
import { OverviewTool } from 'oltb/dist/src/oltb/js/tools/OverviewTool';
import { BookmarkTool } from 'oltb/dist/src/oltb/js/tools/BookmarkTool';
import { DirectionTool } from 'oltb/dist/src/oltb/js/tools/DirectionTool';
import { DebugInfoTool } from 'oltb/dist/src/oltb/js/tools/DebugInfoTool';
import { SplitViewTool } from 'oltb/dist/src/oltb/js/tools/SplitViewTool';
import { ExportPngTool } from 'oltb/dist/src/oltb/js/tools/ExportPngTool';
import { ScaleLineTool } from 'oltb/dist/src/oltb/js/tools/ScaleLineTool';
import { GraticuleTool } from 'oltb/dist/src/oltb/js/tools/GraticuleTool';
import { MyLocationTool } from 'oltb/dist/src/oltb/js/tools/MyLocationTool';
import { ResetNorthTool } from 'oltb/dist/src/oltb/js/tools/ResetNorthTool';
import { FullscreenTool } from 'oltb/dist/src/oltb/js/tools/FullscreenTool';
import { CoordinatesTool } from 'oltb/dist/src/oltb/js/tools/CoordinatesTool';
import { HiddenAboutTool } from 'oltb/dist/src/oltb/js/tools/hidden-tools/AboutTool';
import { NotificationTool } from 'oltb/dist/src/oltb/js/tools/NotificationTool';
import { HiddenMarkerTool } from 'oltb/dist/src/oltb/js/tools/hidden-tools/MarkerTool';
import { ImportVectorLayerTool } from 'oltb/dist/src/oltb/js/tools/ImportVectorLayerTool';
import { HiddenMapNavigationTool } from 'oltb/dist/src/oltb/js/tools/hidden-tools/MapNavigationTool';

// This is the same NODE_NAME and PROPS that the MapNavigationTool.js is using
const LOCAL_STORAGE_NODE_NAME = LOCAL_STORAGE_KEYS.MapData;
const LOCAL_STORAGE_DEFAULTS = Object.freeze({
    lon: 18.0685,
    lat: 59.3293,
    zoom: 3,
    rotation: 0
});

// Load stored data from localStorage
const LOCAL_STORAGE_STATE = StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME);
const LOCAL_STORAGE = { ...LOCAL_STORAGE_DEFAULTS, ...LOCAL_STORAGE_STATE };

// Create Map
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
            lon: 18.0685,
            lat: 59.3293,
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
        new FullscreenTool({
            click: function() {
                console.log('FullscreenTool clicked');
            },
            enter: function(event) {
                console.log('Enter fullscreen mode', event);
            },
            leave: function(event) {
                console.log('Leave fullscreen mode', event);
            }
        }),
        new ExportPngTool({
            filename: 'map-image-export',
            appendTime: true,
            click: function() {
                console.log('ExportPngTool clicked');
            },
            exported: function() {
                console.log('Map exported as png');
            },
            error: function(error) {
                console.log('Error exporting png', error);
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
            bookmarks: [{
                id: 123456,
                name: 'Custom bookmark',
                zoom: 5,
                location: [57.123, 16.456]
            }],
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
            infoWindowContent: 'This is the location that the browser was able to find. It might not be your actual location.',
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
            content: '<p>This is a <strong>modal window</strong>, here you can place some text about your application or links to external resources.</p>',
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
        new ContextMenu()
    ]),
    target: MAP_ELEMENT,
    view: new View({
        projection: getProjection(CONFIG.Projection.Default),
        center: fromLonLat([
            LOCAL_STORAGE.lon, 
            LOCAL_STORAGE.lat
        ], CONFIG.Projection.Default),
        zoom: LOCAL_STORAGE.zoom,
        rotation: LOCAL_STORAGE.rotation
    })
});

// Initialize static managers
[
    LayerManager,
    StateManager,
    TooltipManager,
    SettingsManager,
    InfoWindowManager
].forEach((manager) => {
    manager.init(map);
});