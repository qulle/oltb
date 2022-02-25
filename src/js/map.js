// Core OpenLayers
import 'ol/ol.css';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import Stamen from 'ol/source/Stamen';
import GeoJSON from 'ol/format/GeoJSON';
import { Map, View } from 'ol';
import { XYZ } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { platformModifierKeyOnly, altShiftKeysOnly, shiftKeyOnly } from 'ol/events/condition';
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
import Magnify from './modules/tools/Magnify';
import ResetNorth from './modules/tools/ResetNorth';
import Coordinates from './modules/tools/Coordinates';
import MyLocation from './modules/tools/MyLocation';
import ImportGeoJSON from './modules/tools/ImportGeoJSON';
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
import Config from './modules/core/Config';
import SettingsManager from './modules/core/Managers/SettingsManager';
import InfoWindowManager from './modules/core/Managers/InfoWindowManager';
import { mapElement } from './modules/core/ElementReferences';
import './modules/helpers/Prototypes';
import './modules/helpers/Accessibility';
import './modules/epsg/Projections';

const map = new Map({
    interactions: defaultInterctions({
        mouseWheelZoom: false,
        altShiftDragRotate: false,
        dragPan: false,
        keyboard: false
    }).extend([
        new MouseWheelZoom({
            condition: function(event) { 
                return platformModifierKeyOnly(event) || SettingsManager.getSetting('mouseWheelZoom'); 
            }
        }),
        new DragRotate({
            condition: function(event) {
                return altShiftKeysOnly(event) && SettingsManager.getSetting('altShiftDragRotate');
            }
        }),
        new DragPan({
            condition: function(event) {
                return (platformModifierKeyOnly(event) || SettingsManager.getSetting('dragPan')) && !altShiftKeysOnly(event) && !shiftKeyOnly(event);
            }
        }),
        new KeyboardZoom({
            condition: function(event) {
                return SettingsManager.getSetting('keyboardZoom');
            }
        }),
        new KeyboardPan({
            condition: function(event) {
                return SettingsManager.getSetting('keyboardPan') && document.activeElement === mapElement;
            }
        })
    ]),
    controls: defaultControls({
        zoom: false, 
        rotate: false, 
        attribution: SettingsManager.getSetting('showAttributions')
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
            lon: 18.6435, 
            lat: 60.1282, 
            zoom: 4,
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
            mapLayerAdded: function(layerObject) {
                console.log('Map layer added', layerObject);
            },
            mapLayerRemoved: function(layerObject) {
                console.log('Map layer removed', layerObject);
            },
            mapLayerRenamed: function(layerObject) {
                console.log('Map layer renamed', layerObject);
            },
            mapLayerVisibilityChanged: function(layerObject) {
                console.log('Map layer visibility change', layerObject);
            },
            featureLayerAdded: function(layerObject) {
                console.log('Feature layer added', layerObject);
            },
            featureLayerRemoved: function(layerObject) {
                console.log('Feature layer removed', layerObject);
            },
            featureLayerRenamed: function(layerObject) {
                console.log('Feature layer renamed', layerObject);
            },
            featureLayerVisibilityChanged: function(layerObject) {
                console.log('Feature layer visibility change', layerObject);
            },
            featureLayerDownloaded: function(layerObject) {
                console.log('Feature layer downloaded', layerObject);
            }
        }),
        new SplitView(),
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
        new ImportGeoJSON({
            imported: function(features) {
                console.log('Imported', features);
            },
            error: function(filename, error) {
                console.log('Error when importing geojson file:', filename, error);
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
            content: '<p>This is a <em>modal window</em>, here you can place some text about you application or links to external resources.</p>'
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
        projection: getProjection(Config.baseProjection),
        center: fromLonLat([18.6435, 60.1282], Config.baseProjection),
        zoom: 4
    })
});

// Initialize static managers with reference to map
InfoWindowManager.init(map);
LayerManager.init(map);

// Register all map-layers to the Layermanager.
// The layermanager will add these layers to the map.
LayerManager.addMapLayers([{
    name: 'Open street map',
    layer: new TileLayer({
        source: new OSM(),
        visible: true
    })
}, {
    name: 'ArcGIS World Topo',
    layer: new TileLayer({
        source: new XYZ({
            attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
            url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        }),
        visible: false
    })
}, {
    name: 'Watercolor',
    layer: new TileLayer({
        source: new Stamen({
            layer: 'watercolor'
        }),
        visible: false
    })
}, {
    name: 'Country world map',
    layer: new VectorLayer({
        source: new VectorSource({
            url: require('../world-map.geojson'),
            format: new GeoJSON()
        }),
        visible: false
    })
}
], true);