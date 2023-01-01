// Core OpenLayers
import 'ol/ol.css';
import { Map, View } from 'ol';
import { get as getProjection } from 'ol/proj';
import { defaults as defaultControls } from 'ol/control';
import { defaults as defaultInterctions } from 'ol/interaction';

// Layers
import '../shared/Maps';

// Toolbar
import OLTB from 'oltb/dist/src/oltb/js/oltb';

// Create Map
const map = new Map({
    interactions: defaultInterctions({
        mouseWheelZoom: false,
        altShiftDragRotate: false,
        dragPan: false,
        keyboard: false
    }),
    controls: defaultControls({
        zoom: false, 
        rotate: false
    }),
    view: new View({
        projection: getProjection(OLTB.CONFIG.Projection.Default)
    })
});

// Create Toolbar
const toolbar = new OLTB({
    map: map,
    tools: {
        HiddenMarkerTool: {
            added: function(marker) {
                console.log('Marker added', marker);
            },
            removed: function(marker) {
                console.log('Marker removed', marker);
            },
            edited: function(before, after) {
                console.log('Marker edited', before, after);
            }
        },
        HiddenMapNavigationTool: {
            focusZoom: 10
        },
        HomeTool: {
            lon: 25.5809,
            lat: 23.7588,
            zoom: 3,
            click: function() {
                console.log('HomeTool click');
            },
            home: function() {
                console.log('Map zoomed home');
            }
        },
        ZoomInTool: {
            click: function() {
                console.log('ZoomInTool clicked');
            },
            zoomed: function() {
                console.log('Zoomed in');
            }
        },
        ZoomOutTool: {
            click: function() {
                console.log('ZoomOutTool clicked');
            },
            zoomed: function() {
                console.log('Zoomed out');
            }
        },
        FullscreenTool: {
            click: function() {
                console.log('FullscreenTool clicked');
            },
            enter: function(event) {
                console.log('Enter fullscreen mode', event);
            },
            leave: function(event) {
                console.log('Leave fullscreen mode', event);
            }
        },
        ExportPNGTool: {
            filename: 'map-image-export',
            appendTime: true,
            click: function() {
                console.log('ExportPNGTool clicked');
            },
            exported: function() {
                console.log('Map exported as png');
            }
        },
        DrawTool: {
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
        },
        MeasureTool: {
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
        },
        EditTool: {
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
        },
        BookmarkTool: {
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
        },
        LayerTool: {
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
        },
        SplitViewTool: {
            click: function() {
                console.log('SplitViewTool clicked');
            }
        },
        OverviewTool: {
            click: function() {
                console.log('OverviewTool clicked');
            }
        },
        GraticuleTool: {
            color: 'rgba(59, 67, 82, 0.9)',
            dashed: true,
            width: 2,
            showLabels: true,
            wrapX: true,
            click: function() {
                console.log('GraticuleTool clicked');
            }
        },
        MagnifyTool: {
            click: function() {
                console.log('MagnifyTool clicked');
            }
        },
        ResetNorthTool: {
            click: function() {
                console.log('ResetNorthTool clicked');
            },
            reset: function() {
                console.log('Map north reset');
            }
        },
        CoordinatesTool: {
            click: function() {
                console.log('CoordinateTool clicked');
            },
            mapClicked: function(coordinates) {
                console.log('You clicked at', coordinates);
            }
        },
        MyLocationTool: {
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
        },
        ImportVectorLayerTool: {
            click: function() {
                console.log('ImportVectorLayerTool clicked');
            },
            imported: function(features) {
                console.log('Imported', features);
            },
            error: function(filename, error) {
                console.log('Error when importing file:', filename, error);
            }
        },
        ScaleLineTool: {
            units: 'metric',
            click: function() {
                console.log('ScaleLineTool clicked');
            }
        },
        RefreshTool: {
            click: function() {
                console.log('RefreshTool clicked');
            }
        },
        ThemeTool: {
            click: function() {
                console.log('ThemeTool clicked');
            },
            changed: function(theme) {
                console.log('Theme changed to', theme);
            }
        },
        DirectionTool: {
            click: function() {
                console.log('DirectionTool clicked');
            },
            changed: function(direction) {
                console.log('Direction changed to', direction);
            }
        },
        InfoTool: {
            title: 'Hey!', 
            content: '<p>This is a <strong>modal window</strong>, here you can place some text about your application or links to external resources.</p>',
            click: function() {
                console.log('InfoTool clicked');
            }
        },
        NotificationTool: {
            click: function() {
                console.log('NotificationTool clicked');
            }
        },
        HelpTool: {
            url: 'https://github.com/qulle/oltb',
            target: '_blank',
            click: function() {
                console.log('HelpTool clicked');
            }
        },
        SettingsTool: {
            click: function() {
                console.log('SettingsTool clicked');
            },
            cleared: function() {
                console.log('Settings cleared');
            }
        },
        DebugInfoTool: {
            onlyWhenGetParameter: false,
            click: function() {
                console.log('DebugInfoTool clicked');
            }
        },
        HiddenAboutTool: {}
    }
});