// Core OpenLayers
import 'ol/ol.css';
import { Map, View } from 'ol';
import { get as getProjection } from 'ol/proj';
import { defaults as defaultControls } from 'ol/control';
import { defaults as defaultInterctions } from 'ol/interaction';

// Layers
import '../layers/map-layers';

// Toolbar
import OLTB from 'oltb/src/oltb/js/oltb';

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
        projection: getProjection(OLTB.ConfigManager.getConfig().projection.default)
    })
});

const toolbar = new OLTB({
    map: map,
    tools: {
        HiddenMarkerTool: {
            onAdded: function(marker) {
                console.log('HiddenMarkerTool: Marker added', marker);
            },
            onRemoved: function(marker) {
                console.log('HiddenMarkerTool: Marker removed', marker);
            },
            onEdited: function(before, after) {
                console.log('HiddenMarkerTool: Marker edited', before, after);
            }
        },
        HiddenMapNavigationTool: {
            focusZoom: 10
        },
        HomeTool: {
            lon: 18.1201,
            lat: 35.3518,
            zoom: 3,
            onInitiated: function() {
                console.log('HomeTool: Initiated');
            },
            onClicked: function() {
                console.log('HomeTool: Clicked');
            },
            onBrowserStateCleared: function() {
                console.log('HomeTool: State cleared');
            },
            onNavigatedHome: function(result) {
                console.log('HomeTool: Navigated home', result);
            }
        },
        ZoomInTool: {
            onInitiated: function() {
                console.log('ZoomInTool: Initiated');
            },
            onClicked: function() {
                console.log('ZoomInTool: Clicked');
            },
            onZoomed: function(result) {
                console.log('ZoomInTool: Zoomed in', result);
            }
        },
        ZoomOutTool: {
            onInitiated: function() {
                console.log('ZoomOutTool: Initiated');
            },
            onClicked: function() {
                console.log('ZoomOutTool: Clicked');
            },
            onZoomed: function(result) {
                console.log('ZoomOutTool: Zoomed out', result);
            }
        },
        ZoomboxTool: {
            onInitiated: function() {
                console.log('ZoomboxTool: Initiated');
            },
            onClicked: function() {
                console.log('ZoomboxTool: Clicked');
            },
            onBrowserStateCleared: function() {
                console.log('ZoomboxTool: State cleared');
            },
            onStart: function(event) {
                console.log('ZoomboxTool: Start', event);
            },
            onEnd: function(event) {
                console.log('ZoomboxTool: End', event);
            },
            onDrag: function(event) {
                console.log('ZoomboxTool: Drag', event);
            },
            onCancel: function(event) {
                console.log('ZoomboxTool: Cancel', event);
            },
            onError: function(event) {
                console.log('ZoomboxTool: Error', event);
            }
        },
        FullscreenTool: {
            onInitiated: function() {
                console.log('FullscreenTool: Initiated');
            },
            onClicked: function() {
                console.log('FullscreenTool: Clicked');
            },
            onEnter: function(event) {
                console.log('FullscreenTool: Enter fullscreen', event);
            },
            onLeave: function(event) {
                console.log('FullscreenTool: Leave fullscreen', event);
            }
        },
        ExportPngTool: {
            filename: 'map-image-export',
            appendTime: true,
            onInitiated: function() {
                console.log('ExportPngTool: Initiated');
            },
            onClicked: function() {
                console.log('ExportPngTool: Clicked');
            },
            onExported: function(filename, content) {
                console.log('ExportPngTool: PNG exported', filename, content);
            },
            onError: function(error) {
                console.log('ExportPngTool: Error', error);
            }
        },
        DrawTool: {
            onInitiated: function() {
                console.log('DrawTool: Initiated');
            },
            onClicked: function() {
                console.log('DrawTool: Clicked');
            },
            onBrowserStateCleared: function() {
                console.log('DrawTool: State cleared');
            },
            onStart: function(event) {
                console.log('DrawTool: Start');
            },
            onEnd: function(event) {
                console.log('DrawTool: End', event.feature);
            },
            onAbort: function(event) {
                console.log('DrawTool: Abort');
            },
            onError: function(event) {
                console.log('DrawTool: Error');
            },
            onIntersected: function(event, intersectedFeatures) {
                console.log('DrawTool: Intersected', event.feature);
                console.log('DrawTool: Intersected features', intersectedFeatures);
            },
            onSnapped: function(event) {
                console.log('DrawTool: Snapped');
            },
            onUnSnapped: function(event) {
                console.log('DrawTool: UnSnapped');
            }
        },
        MeasureTool: {
            onInitiated: function() {
                console.log('MeasureTool: Initiated');
            },
            onClicked: function() {
                console.log('MeasureTool: Clicked');
            },
            onBrowserStateCleared: function() {
                console.log('MeasureTool: State cleared');
            },
            onStart: function(event) {
                console.log('MeasureTool: Start');
            },
            onEnd: function(event) {
                console.log('MeasureTool: End', event.feature);
            },
            onAbort: function(event) {
                console.log('MeasureTool: Abort');
            },
            onError: function(event) {
                console.log('MeasureTool: Error');
            }
        },
        EditTool: {
            hitTolerance: 5,
            onInitiated: function() {
                console.log('EditTool: Initiated');
            },
            onClicked: function() {
                console.log('EditTool: Clicked');
            },
            onBrowserStateCleared: function() {
                console.log('EditTool: State cleared');
            },
            onStyleChange: function(event, style) {
                console.log('EditTool: Style changed');
            },
            onCutFeatures: function(features) {
                console.log('EditTool: Cut features', features);
            },
            onCopyFeatures: function(features) {
                console.log('EditTool: Copied features', features);
            },
            onPasteFeatures: function(features, layerWrapper) {
                console.log('EditTool: Pasted features', features);
            },
            onShapeOperation: function(type, a, b, result) {
                console.log('EditTool: Shape operation', type);
            },
            onSelectAdd: function(event) {
                console.log('EditTool: Selected feature');
            },
            onSelectRemove: function(event) {
                console.log('EditTool: Deselected feature');
            },
            onModifyStart: function(event) {
                console.log('EditTool: Modify start');
            },
            onModifyEnd: function(event) {
                console.log('EditTool: Modify end');
            },
            onTranslateStart: function(event) {
                console.log('EditTool: Translate start');
            },
            onTranslateEnd: function(event) {
                console.log('EditTool: Translate end');
            },
            onRemovedFeatures: function(features) {
                console.log('EditTool: Removed features', features);
            },
            onError: function(event) {
                console.log('EditTool: Error');
            },
            onSnapped: function(event) {
                console.log('EditTool: Snapped');
            },
            onUnSnapped: function(event) {
                console.log('EditTool: UnSnapped');
            }
        },
        ScissorsTool: {
            onStart: function(event) {
                console.log('ScissorsTool: Start');
            },
            onEnd: function(event) {
                console.log('ScissorsTool: End', event.feature);
            },
            onAbort: function(event) {
                console.log('ScissorsTool: Abort');
            },
            onError: function(event) {
                console.log('ScissorsTool: Error');
            },
            onSnapped: function(event) {
                console.log('ScissorsTool: Snapped');
            },
            onUnSnapped: function(event) {
                console.log('ScissorsTool: UnSnapped');
            }
        },
        BookmarkTool: {
            markerLayerVisibleOnLoad: true,
            markerLabelUseEllipsisAfter: 20,
            markerLabelUseUpperCase: false,
            bookmarks: [{
                id: '6812cc22-f490-46b7-a9f3-42eb9ea58ac2',
                name: 'Custom Bookmark',
                zoom: 5,
                coordinates: [57.123, 16.456]
            }],
            onInitiated: function() {
                console.log('BookmarkTool: Initiated');
            },
            onClicked: function() {
                console.log('BookmarkTool: Clicked');
            },
            onBrowserStateCleared: function() {
                console.log('BookmarkTool: State cleared');
            },
            onAdded: function(bookmark) {
                console.log('BookmarkTool: Added', bookmark);
            },
            onRemoved: function(bookmark) {
                console.log('BookmarkTool: Removed', bookmark);
            },
            onRenamed: function(bookmark) {
                console.log('BookmarkTool: Renamed', bookmark);
            },
            onZoomedTo: function(bookmark) {
                console.log('BookmarkTool: Zoomed to', bookmark);
            },
            onCleared: function() {
                console.log('BookmarkTool: Cleared');
            },
            onDragged: function(item, list) {
                console.log('BookmarkTool: Dragged', item, list);
            }
        },
        LayerTool: {
            onInitiated: function() {
                console.log('LayerTool: Initiated');
            },
            onClicked: function() {
                console.log('LayerTool: Clicked');
            },
            onBrowserStateCleared: function() {
                console.log('LayerTool: State cleared');
            },
            onMapLayerAdded: function(layerWrapper) {
                console.log('LayerTool: Map layer added', layerWrapper);
            },
            onMapLayerRemoved: function(layerWrapper) {
                console.log('LayerTool: Map layer removed', layerWrapper);
            },
            onMapLayerRenamed: function(layerWrapper) {
                console.log('LayerTool: Map layer renamed', layerWrapper);
            },
            onMapLayerVisibilityChanged: function(layerWrapper) {
                console.log('LayerTool: Map layer visibility change', layerWrapper);
            },
            onMapLayerDragged(item, list) {
                console.log('LayerTool: Map layer dragged', item, list);
            },
            onFeatureLayerAdded: function(layerWrapper) {
                console.log('LayerTool: Feature layer added', layerWrapper);
            },
            onFeatureLayerRemoved: function(layerWrapper) {
                console.log('LayerTool: Feature layer removed', layerWrapper);
            },
            onFeatureLayerRenamed: function(layerWrapper) {
                console.log('LayerTool: Feature layer renamed', layerWrapper);
            },
            onFeatureLayerVisibilityChanged: function(layerWrapper) {
                console.log('LayerTool: Feature layer visibility change', layerWrapper);
            },
            onFeatureLayerDownloaded: function(layerWrapper, filename, content) {
                console.log('LayerTool: Feature layer downloaded', layerWrapper, filename, content);
            },
            onFeatureLayerDragged(item, list) {
                console.log('LayerTool: Feature layer dragged', item, list);
            },
        },
        SplitViewTool: {
            onInitiated: function() {
                console.log('SplitViewTool: Initiated');
            },
            onClicked: function() {
                console.log('SplitViewTool: Clicked');
            },
            onBrowserStateCleared: function() {
                console.log('SplitViewTool: State cleared');
            }
        },
        OverviewTool: {
            onInitiated: function() {
                console.log('OverviewTool: Initiated');
            },
            onClicked: function() {
                console.log('OverviewTool: Clicked');
            },
            onBrowserStateCleared: function() {
                console.log('OverviewTool: State cleared');
            }
        },
        GraticuleTool: {
            color: '#3B4352E6',
            dashed: true,
            width: 2,
            showLabels: true,
            wrapX: true,
            onInitiated: function() {
                console.log('GraticuleTool: Initiated');
            },
            onClicked: function() {
                console.log('GraticuleTool: Clicked');
            },
            onBrowserStateCleared: function() {
                console.log('GraticuleTool: State cleared');
            }
        },
        MagnifyTool: {
            onInitiated: function() {
                console.log('MagnifyTool: Initiated');
            },
            onClicked: function() {
                console.log('MagnifyTool: Clicked');
            },
            onBrowserStateCleared: function() {
                console.log('MagnifyTool: State cleared');
            }
        },
        ResetNorthTool: {
            onInitiated: function() {
                console.log('ResetNorthTool: Initiated');
            },
            onClicked: function() {
                console.log('ResetNorthTool: Clicked');
            },
            onReset: function(result) {
                console.log('ResetNorthTool: North reset', result);
            }
        },
        CoordinatesTool: {
            onInitiated: function() {
                console.log('CoordinatesTool: Initiated');
            },
            onClicked: function() {
                console.log('CoordinatesTool: Clicked');
            },
            onBrowserStateCleared: function() {
                console.log('CoordinatesTool: State cleared');
            },
            onMapClicked: function(coordinates) {
                console.log('CoordinatesTool: Map clicked at', coordinates);
            }
        },
        MyLocationTool: {
            enableHighAccuracy: true,
            timeout: 10000,
            description: 'This is the location that the browser was able to find. It might not be your actual location.',
            markerLabelUseEllipsisAfter: 20,
            markerLabelUseUpperCase: false,
            onInitiated: function() {
                console.log('MyLocationTool: Initiated');
            },
            onClicked: function() {
                console.log('MyLocationTool: Clicked');
            },
            onLocationFound: function(location) {
                console.log('MyLocationTool: Location found', location);
            },
            onError: function(error) {
                console.log('MyLocationTool: Error', error);
            }
        },
        ImportVectorLayerTool: {
            onInitiated: function() {
                console.log('ImportVectorLayerTool: Initiated');
            },
            onClicked: function() {
                console.log('ImportVectorLayerTool: Clicked');
            },
            onImported: function(features) {
                console.log('ImportVectorLayerTool: Imported', features);
            },
            onError: function(filename, error) {
                console.log('ImportVectorLayerTool: Error', filename, error);
            }
        },
        ScaleLineTool: {
            units: 'metric',
            onInitiated: function() {
                console.log('ScaleLineTool: Initiated');
            },
            onClicked: function() {
                console.log('ScaleLineTool: Clicked');
            },
            onBrowserStateCleared: function() {
                console.log('ScaleLineTool: State cleared');
            }
        },
        RefreshTool: {
            onInitiated: function() {
                console.log('RefreshTool: Initiated');
            },
            onClicked: function() {
                console.log('RefreshTool: Clicked');
            }
        },
        ThemeTool: {
            onInitiated: function() {
                console.log('ThemeTool: Initiated');
            },
            onClicked: function() {
                console.log('ThemeTool: Clicked');
            },
            onBrowserStateCleared: function() {
                console.log('ThemeTool: State cleared');
            },
            onChanged: function(theme) {
                console.log('ThemeTool: Changed to', theme);
            }
        },
        DirectionTool: {
            onInitiated: function() {
                console.log('DirectionTool: Initiated');
            },
            onClicked: function() {C
                console.log('DirectionTool: Clicked');
            },
            onBrowserStateCleared: function() {
                console.log('DirectionTool: State cleared');
            },
            onChanged: function(direction) {
                console.log('DirectionTool: Changed to', direction);
            }
        },
        ToolboxTool: {
            onInitiated: function() {
                console.log('ToolboxTool: Initiated');
            },
            onClicked: function() {
                console.log('ToolboxTool: Clicked');
            },
            onBrowserStateCleared: function() {
                console.log('ToolboxTool: State cleared');
            },
            onChanged: function(state) {
                console.log('ToolboxTool: Changed to', state);
            }
        },
        InfoTool: {
            title: 'Hey!', 
            content: '<p>This is a <strong>modal window</strong>, here you can place some text about your application or links to external resources.</p>',
            onInitiated: function() {
                console.log('InfoTool: Initiated');
            },
            onClicked: function() {
                console.log('InfoTool: Clicked');
            }
        },
        HelpTool: {
            url: 'https://github.com/qulle/oltb',
            target: '_blank',
            onInitiated: function() {
                console.log('HelpTool: Initiated');
            },
            onClicked: function() {
                console.log('HelpTool: Clicked');
            }
        },
        SettingsTool: {
            onInitiated: function() {
                console.log('SettingsTool: Initiated');
            },
            onClicked: function() {
                console.log('SettingsTool: Clicked');
            },
            onBrowserStateCleared: function() {
                console.log('SettingsTool: State cleared');
            }
        },
        TranslationTool: {
            onInitiated: function() {
                console.log('TranslationTool: Initiated');
            },
            onClicked: function() {
                console.log('TranslationTool: Clicked');
            },
        },
        DebugInfoTool: {
            onlyWhenGetParameter: false,
            onInitiated: function() {
                console.log('DebugInfoTool: Initiated');
            },
            onClicked: function() {
                console.log('DebugInfoTool: Clicked');
            }
        },
        HiddenAboutTool: {}
    }
});