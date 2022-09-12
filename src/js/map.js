// Core OpenLayers
import 'ol/ol.css';
import { Map, View } from 'ol';
import { fromLonLat } from 'ol/proj';
import { platformModifierKeyOnly, altShiftKeysOnly, shiftKeyOnly, targetNotEditable } from 'ol/events/condition';
import { defaults as defaultInterctions, MouseWheelZoom, DragPan, DragRotate, KeyboardZoom, KeyboardPan } from 'ol/interaction';
import { defaults as defaultControls } from 'ol/control';
import { get as getProjection } from 'ol/proj';

// Toolbar tools
import HiddenMarker from './modules/tools/HiddenTools/Marker';
import HiddenMapNavigation from './modules/tools/HiddenTools/MapNavigation';
import Home from './modules/tools/Home';
import ZoomIn from './modules/tools/ZoomIn';
import ZoomOut from './modules/tools/ZoomOut';
import FullScreen from './modules/tools/FullScreen';
import ExportPNG from './modules/tools/ExportPNG';
import DrawTool from './modules/tools/DrawTool';
import MeasureTool from './modules/tools/MeasureTool';
import Edit from './modules/tools/Edit';
import Bookmark from './modules/tools/Bookmark';
import Layers from './modules/tools/Layers';
import SplitView from './modules/tools/SplitView';
import Overview from './modules/tools/Overview';
import Magnify from './modules/tools/Magnify';
import ResetNorth from './modules/tools/ResetNorth';
import Coordinates from './modules/tools/Coordinates';
import MyLocation from './modules/tools/MyLocation';
import ImportVectorLayer from './modules/tools/ImportVectorLayer';
import ScaleLineTool from './modules/tools/ScaleLineTool';
import Refresh from './modules/tools/Refresh';
import ThemeToggle from './modules/tools/ThemeToggle';
import DirectionToggle from './modules/tools/DirectionToggle';
import Info from './modules/tools/Info';
import Help from './modules/tools/Help';
import Settings from './modules/tools/Settings';
import DebugInfo from './modules/tools/DebugInfo';
import HiddenAbout from './modules/tools/HiddenTools/About';

// Additional toolbar helpers
import ContextMenu from './modules/common/ContextMenu';
import LayerManager from './modules/core/Managers/LayerManager';
import StateManager from './modules/core/Managers/StateManager';
import TooltipManager from './modules/core/Managers/TooltipManager';
import Config from './modules/core/Config';
import SettingsManager from './modules/core/Managers/SettingsManager';
import InfoWindowManager from './modules/core/Managers/InfoWindowManager';
import { mapElement } from './modules/core/ElementReferences';
import './modules/helpers/Browser/Prototypes';
import './modules/helpers/Accessibility';
import './modules/helpers/SlideToggle';

// Load layers
import './modules/layers/Maps';
import './modules/layers/Countries';
import './modules/layers/Continents';
import './modules/layers/Capitals';

// Note: This is the same NODE_NAME and PROPS that the MapNavigation.js tool is using
const LOCAL_STORAGE_NODE_NAME = 'mapData';
const LOCAL_STORAGE_DEFAULTS = {
    lon: 25.5809,
    lat: 23.7588,
    zoom: 3,
    rotation: 0
};

// Load potential stored data from localStorage
const localStorageState = JSON.parse(StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME)) || {};
const localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...localStorageState };

const map = new Map({
    interactions: defaultInterctions({
        mouseWheelZoom: false,
        altShiftDragRotate: false,
        dragPan: false,
        keyboard: false
    }).extend([
        new MouseWheelZoom({
            condition: function(event) { 
                return platformModifierKeyOnly(event) || SettingsManager.getSetting('mouse.wheel.zoom'); 
            }
        }),
        new DragRotate({
            condition: function(event) {
                return altShiftKeysOnly(event) && SettingsManager.getSetting('alt.shift.drag.rotate');
            }
        }),
        new DragPan({
            condition: function(event) {
                return (platformModifierKeyOnly(event) || SettingsManager.getSetting('drag.pan')) && !altShiftKeysOnly(event) && !shiftKeyOnly(event);
            }
        }),
        new KeyboardZoom({
            condition: function(event) {
                return SettingsManager.getSetting('keyboard.zoom') && targetNotEditable(event);
            }
        }),
        new KeyboardPan({
            condition: function(event) {
                return SettingsManager.getSetting('keyboard.pan') && targetNotEditable(event);
            }
        })
    ]),
    controls: defaultControls({
        zoom: false, 
        rotate: false, 
        attribution: SettingsManager.getSetting('show.attributions')
    }).extend([
        new HiddenMarker({
            added: function(marker) {
                console.log('Marker added', marker);
            },
            removed: function(marker) {
                console.log('Marker removed', marker);
            },
            edited: function(marker) {
                console.log('Marker edited', marker);
            }
        }),
        new HiddenMapNavigation({
            focusZoom: 10
        }),
        new Home({
            lon: 25.5809,
            lat: 23.7588,
            zoom: 3,
            home: function() {
                console.log('Map zoomed home');
            }
        }),
        new ZoomIn({
            zoomed: function() {
                console.log('Zoomed in');
            }
        }),
        new ZoomOut({
            zoomed: function() {
                console.log('Zoomed out');
            }
        }),
        new FullScreen({
            enter: function(event) {
                console.log('Enter fullscreen mode', event);
            },
            leave: function(event) {
                console.log('Leave fullscreen mode', event);
            }
        }),
        new ExportPNG({
            exported: function() {
                console.log('Map exported as png');
            }
        }),
        new DrawTool({
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
            }
        }),
        new MeasureTool({
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
        new Edit({
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
        new Bookmark({
            storeDataInLocalStorage: true,
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
        new Layers({
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
        new SplitView(),
        new Overview(),
        new Magnify(),
        new ResetNorth({
            reset: function() {
                console.log('Map north reset');
            }
        }),
        new Coordinates({
            clicked: function(coordinates) {
                console.log('You clicked', coordinates);
            }
        }),
        new MyLocation({
            location: function(location) {
                console.log('Location', location);
            },
            error: function(error) {
                console.log('Location error', error);
            }
        }),
        new ImportVectorLayer({
            imported: function(features) {
                console.log('Imported', features);
            },
            error: function(filename, error) {
                console.log('Error when importing file:', filename, error);
            }
        }),
        new ScaleLineTool({
            units: 'metric'
        }),
        new Refresh(),
        new ThemeToggle({
            changed: function(theme) {
                console.log('Theme changed to', theme);
            }
        }),
        new DirectionToggle({
            changed: function(direction) {
                console.log('Direction changed to', direction);
            }
        }),
        new Info({
            title: 'Hey!', 
            content: '<p>This is a <em>modal window</em>, here you can place some text about your application or links to external resources.</p>'
        }),
        new Help({
            url: 'https://github.com/qulle/oltb',
            target: '_blank'
        }),
        new Settings({
            cleared: function() {
                console.log('Settings cleared');
            }
        }),
        new DebugInfo(),
        new HiddenAbout(),
        new ContextMenu({
            name: 'main.map.context.menu', 
            selector: '#map canvas'
        })
    ]),
    target: mapElement,
    view: new View({
        projection: getProjection(Config.projection),
        center: fromLonLat([
            localStorage.lon, 
            localStorage.lat
        ], Config.projection),
        zoom: localStorage.zoom,
        rotation: localStorage.rotation
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