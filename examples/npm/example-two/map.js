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

// Browser prototype extensions
import 'oltb/src/oltb/js/helpers/extensions/Cycle';
import 'oltb/src/oltb/js/helpers/prototypes/String';
import 'oltb/src/oltb/js/helpers/prototypes/SlideToggle';

// Core Toolbar
import 'oltb/src/oltb/scss/oltb.scss';
import { Config } from 'oltb/src/oltb/js/core/Config';
import { Settings } from 'oltb/src/oltb/js/helpers/constants/Settings';
import { ContextMenu } from 'oltb/src/oltb/js/common/ContextMenu';
import { LocalStorageKeys } from 'oltb/src/oltb/js/helpers/constants/LocalStorageKeys';

// Core Managers
import { LogManager } from 'oltb/src/oltb/js/core/managers/LogManager';
import { UrlManager } from 'oltb/src/oltb/js/core/managers/UrlManager';
import { ToolManager } from 'oltb/src/oltb/js/core/managers/ToolManager';
import { LayerManager } from 'oltb/src/oltb/js/core/managers/LayerManager';
import { StateManager } from 'oltb/src/oltb/js/core/managers/StateManager';
import { TippyManager } from 'oltb/src/oltb/js/core/managers/TippyManager';
import { ErrorManager } from 'oltb/src/oltb/js/core/managers/ErrorManager';
import { ElementManager } from 'oltb/src/oltb/js/core/managers/ElementManager';
import { TooltipManager } from 'oltb/src/oltb/js/core/managers/TooltipManager';
import { SettingsManager } from 'oltb/src/oltb/js/core/managers/SettingsManager';
import { BootstrapManager } from 'oltb/src/oltb/js/core/managers/BootstrapManager';
import { InfoWindowManager } from 'oltb/src/oltb/js/core/managers/InfoWindowManager';
import { ProjectionManager } from 'oltb/src/oltb/js/core/managers/ProjectionManager';
import { ColorPickerManager } from 'oltb/src/oltb/js/core/managers/ColorPickerManager';
import { AccessibilityManager } from 'oltb/src/oltb/js/core/managers/AccessibilityManager';

// Toolbar tools
import { HomeTool } from 'oltb/src/oltb/js/tools/HomeTool';
import { DrawTool } from 'oltb/src/oltb/js/tools/DrawTool';
import { EditTool } from 'oltb/src/oltb/js/tools/EditTool';
import { InfoTool } from 'oltb/src/oltb/js/tools/InfoTool';
import { HelpTool } from 'oltb/src/oltb/js/tools/HelpTool';
import { ThemeTool } from 'oltb/src/oltb/js/tools/ThemeTool';
import { LayerTool } from 'oltb/src/oltb/js/tools/LayerTool';
import { ZoomInTool } from 'oltb/src/oltb/js/tools/ZoomInTool';
import { MeasureTool } from 'oltb/src/oltb/js/tools/MeasureTool';
import { MagnifyTool } from 'oltb/src/oltb/js/tools/MagnifyTool';
import { ZoomOutTool } from 'oltb/src/oltb/js/tools/ZoomOutTool';
import { RefreshTool } from 'oltb/src/oltb/js/tools/RefreshTool';
import { SettingsTool } from 'oltb/src/oltb/js/tools/SettingsTool';
import { OverviewTool } from 'oltb/src/oltb/js/tools/OverviewTool';
import { BookmarkTool } from 'oltb/src/oltb/js/tools/BookmarkTool';
import { DirectionTool } from 'oltb/src/oltb/js/tools/DirectionTool';
import { DebugInfoTool } from 'oltb/src/oltb/js/tools/DebugInfoTool';
import { SplitViewTool } from 'oltb/src/oltb/js/tools/SplitViewTool';
import { ExportPngTool } from 'oltb/src/oltb/js/tools/ExportPngTool';
import { ScaleLineTool } from 'oltb/src/oltb/js/tools/ScaleLineTool';
import { GraticuleTool } from 'oltb/src/oltb/js/tools/GraticuleTool';
import { MyLocationTool } from 'oltb/src/oltb/js/tools/MyLocationTool';
import { ResetNorthTool } from 'oltb/src/oltb/js/tools/ResetNorthTool';
import { FullscreenTool } from 'oltb/src/oltb/js/tools/FullscreenTool';
import { CoordinatesTool } from 'oltb/src/oltb/js/tools/CoordinatesTool';
import { HiddenAboutTool } from 'oltb/src/oltb/js/tools/hidden-tools/HiddenAboutTool';
import { NotificationTool } from 'oltb/src/oltb/js/tools/NotificationTool';
import { HiddenMarkerTool } from 'oltb/src/oltb/js/tools/hidden-tools/HiddenMarkerTool';
import { ImportVectorLayerTool } from 'oltb/src/oltb/js/tools/ImportVectorLayerTool';
import { HiddenMapNavigationTool } from 'oltb/src/oltb/js/tools/hidden-tools/HiddenMapNavigationTool';

// This is the same NodeName and Defaults that the HiddenMapNavigationTool.js is using
const LocalStorageNodeName = LocalStorageKeys.mapData;
const LocalStorageDefaults = Object.freeze({
    lon: Config.defaultLocation.lon,
    lat: Config.defaultLocation.lat,
    zoom: Config.defaultLocation.zoom,
    rotation: Config.defaultLocation.rotation,
});

// Note: The init order is important
BootstrapManager.init([
    {manager: LogManager},
    {manager: ErrorManager},
    {manager: StateManager, options: {
        ignoredKeys: []
    }},
    {manager: ElementManager},
    {manager: ProjectionManager},
    {manager: LayerManager},
    {manager: ColorPickerManager},
    {manager: TippyManager},
    {manager: TooltipManager},
    {manager: UrlManager},
    {manager: ToolManager},
    {manager: SettingsManager},
    {manager: InfoWindowManager},
    {manager: AccessibilityManager}
]);

const LocalStorage = StateManager.getAndMergeStateObject(
    LocalStorageNodeName, 
    LocalStorageDefaults
);

const map = new Map({
    interactions: defaultInterctions({
        mouseWheelZoom: false,
        altShiftDragRotate: false,
        dragPan: false,
        keyboard: false
    }).extend([
        new MouseWheelZoom({
            condition: function(event) { 
                return (
                    platformModifierKeyOnly(event) || 
                    SettingsManager.getSetting(Settings.mouseWheelZoom)
                ); 
            }
        }),
        new DragRotate({
            condition: function(event) {
                return (
                    altShiftKeysOnly(event) && 
                    SettingsManager.getSetting(Settings.altShiftDragRotate)
                );
            }
        }),
        new DragPan({
            condition: function(event) {
                return (
                    (
                        platformModifierKeyOnly(event) || 
                        SettingsManager.getSetting(Settings.dragPan)
                    ) && !altShiftKeysOnly(event) && !shiftKeyOnly(event)
                );
            }
        }),
        new KeyboardZoom({
            condition: function(event) {
                return (
                    SettingsManager.getSetting(Settings.keyboardZoom) && 
                    targetNotEditable(event)
                );
            }
        }),
        new KeyboardPan({
            condition: function(event) {
                return (
                    SettingsManager.getSetting(Settings.keyboardPan) && 
                    targetNotEditable(event)
                );
            }
        })
    ]),
    controls: defaultControls({
        zoom: false, 
        rotate: false
    }).extend([
        new HiddenMarkerTool({
            onAdded: function(marker) {
                console.log('HiddenMarkerTool: Marker added', marker);
            },
            onRemoved: function(marker) {
                console.log('HiddenMarkerTool: Marker removed', marker);
            },
            onEdited: function(before, after) {
                console.log('HiddenMarkerTool: Marker edited', before, after);
            }
        }),
        new HiddenMapNavigationTool({
            focusZoom: 10
        }),
        new HomeTool({
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
        }),
        new ZoomInTool({
            onInitiated: function() {
                console.log('ZoomInTool: Initiated');
            },
            onClicked: function() {
                console.log('ZoomInTool: Clicked');
            },
            onZoomed: function(result) {
                console.log('ZoomInTool: Zoomed in', result);
            }
        }),
        new ZoomOutTool({
            onInitiated: function() {
                console.log('ZoomOutTool: Initiated');
            },
            onClicked: function() {
                console.log('ZoomOutTool: Clicked');
            },
            onZoomed: function(result) {
                console.log('ZoomOutTool: Zoomed out', result);
            }
        }),
        new FullscreenTool({
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
        }),
        new ExportPngTool({
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
        }),
        new DrawTool({
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
            }
        }),
        new MeasureTool({
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
                console.log('MeasureTool: Eerror');
            }
        }),
        new EditTool({
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
            onTranslatEend: function(event) {
                console.log('EditTool: Translate end');
            },
            onRemovedFeature: function(feature) {
                console.log('EditTool: Removed feature', feature);
            },
            onError: function(event) {
                console.log('EditTool: Error');
            }
        }),
        new BookmarkTool({
            markerLayerVisibleOnLoad: true,
            markerLabelUseEllipsisAfter: 20,
            markerLabelUseUpperCase: false,
            bookmarks: [{
                id: '6812cc22-f490-46b7-a9f3-42eb9ea58ac2',
                name: 'Custom bookmark',
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
        }),
        new LayerTool({
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
        }),
        new SplitViewTool({
            onInitiated: function() {
                console.log('SplitViewTool: Initiated');
            },
            onClicked: function() {
                console.log('SplitViewTool: Clicked');
            },
            onBrowserStateCleared: function() {
                console.log('SplitViewTool: State cleared');
            }
        }),
        new OverviewTool({
            onInitiated: function() {
                console.log('OverviewTool: Initiated');
            },
            onClicked: function() {
                console.log('OverviewTool: Clicked');
            },
            onBrowserStateCleared: function() {
                console.log('OverviewTool: State cleared');
            }
        }),
        new GraticuleTool({
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
            }
        }),
        new MagnifyTool({
            onInitiated: function() {
                console.log('MagnifyTool: Initiated');
            },
            onClicked: function() {
                console.log('MagnifyTool: Clicked');
            }
        }),
        new ResetNorthTool({
            onInitiated: function() {
                console.log('ResetNorthTool: Initiated');
            },
            onClicked: function() {
                console.log('ResetNorthTool: Clicked');
            },
            onReset: function(result) {
                console.log('ResetNorthTool: North reset', result);
            }
        }),
        new CoordinatesTool({
            onInitiated: function() {
                console.log('CoordinatesTool: Initiated');
            },
            onClicked: function() {
                console.log('CoordinatesTool: Clicked');
            },
            onMapClicked: function(coordinates) {
                console.log('CoordinatesTool: Map clicked at', coordinates);
            }
        }),
        new MyLocationTool({
            enableHighAccuracy: true,
            timeout: 10000,
            description: 'This is the location that the browser was able to find. It might not be your actual location.',
            markerLabelUseEllipsisAfter: 20,
            shouldRenderMarkerLabel: true,
            shouldRenderMarkerLabelUpperCase: false,
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
        }),
        new ImportVectorLayerTool({
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
        }),
        new ScaleLineTool({
            units: 'metric',
            onInitiated: function() {
                console.log('ScaleLineTool: Initiated');
            },
            onClicked: function() {
                console.log('ScaleLineTool: Clicked');
            }
        }),
        new RefreshTool({
            onInitiated: function() {
                console.log('RefreshTool: Initiated');
            },
            onClicked: function() {
                console.log('RefreshTool: Clicked');
            }
        }),
        new ThemeTool({
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
        }),
        new DirectionTool({
            onInitiated: function() {
                console.log('DirectionTool: Initiated');
            },
            onClicked: function() {
                console.log('DirectionTool: Clicked');
            },
            onBrowserStateCleared: function() {
                console.log('DirectionTool: State cleared');
            },
            onChanged: function(direction) {
                console.log('DirectionTool: Changed to', direction);
            }
        }),
        new InfoTool({
            title: 'Hey!', 
            content: '<p>This is a <strong>modal window</strong>, here you can place some text about your application or links to external resources.</p>',
            onInitiated: function() {
                console.log('InfoTool: Initiated');
            },
            onClicked: function() {
                console.log('InfoTool: Clicked');
            }
        }),
        new NotificationTool({
            onInitiated: function() {
                console.log('NotificationTool: Initiated');
            },
            onClicked: function() {
                console.log('NotificationTool: Clicked');
            }
        }),
        new HelpTool({
            url: 'https://github.com/qulle/oltb',
            target: '_blank',
            onInitiated: function() {
                console.log('HelpTool: Initiated');
            },
            onClicked: function() {
                console.log('HelpTool: Clicked');
            }
        }),
        new SettingsTool({
            onInitiated: function() {
                console.log('SettingsTool: Initiated');
            },
            onClicked: function() {
                console.log('SettingsTool: Clicked');
            },
            onBrowserStateCleared: function() {
                console.log('SettingsTool: State cleared');
            }
        }),
        new DebugInfoTool({
            onlyWhenGetParameter: false,
            onInitiated: function() {
                console.log('DebugInfoTool: Initiated');
            },
            onClicked: function() {
                console.log('DebugInfoTool: Clicked');
            }
        }),
        new HiddenAboutTool(),
        new ContextMenu()
    ]),
    target: ElementManager.getMapElement(),
    view: new View({
        projection: getProjection(Config.projection.default),
        center: fromLonLat([
            Number(LocalStorage.lon),
            Number(LocalStorage.lat)
        ], Config.projection.default),
        zoom: LocalStorage.zoom,
        rotation: LocalStorage.rotation
    })
});

BootstrapManager.setMap(map);