import { useEffect } from 'react'
import './App.css'

// Core OpenLayers
import 'ol/ol.css';
import { Map, View } from 'ol';
import { fromLonLat } from 'ol/proj';
import { get as getProjection } from 'ol/proj';
import { defaults as defaultControls } from 'ol/control';
import { platformModifierKeyOnly, altShiftKeysOnly, shiftKeyOnly, targetNotEditable } from 'ol/events/condition';
import { defaults as defaultInterctions, MouseWheelZoom, DragPan, DragRotate, KeyboardZoom, KeyboardPan } from 'ol/interaction';

// Layers
import { Tile } from 'ol/layer';
import { OSM, XYZ } from 'ol/source';

// Browser prototype extensions
import 'oltb/src/oltb/js/browser-prototypes/json-cycle';
import 'oltb/src/oltb/js/browser-prototypes/string';
import 'oltb/src/oltb/js/browser-prototypes/slide-toggle';

// Core Toolbar
import 'oltb/src/oltb/scss/oltb.scss';
import { Settings } from 'oltb/src/oltb/js/browser-constants/settings';
import { LocalStorageKeys } from 'oltb/src/oltb/js/browser-constants/local-storage-keys';

// Core Managers
import { LogManager } from 'oltb/src/oltb/js/toolbar-managers/log-manager/log-manager';
import { UrlManager } from 'oltb/src/oltb/js/toolbar-managers/url-manager/url-manager';
import { NameManager } from 'oltb/src/oltb/js/toolbar-managers/name-manager/name-manager';
import { ToolManager } from 'oltb/src/oltb/js/toolbar-managers/tool-manager/tool-manager';
import { SnapManager } from 'oltb/src/oltb/js/toolbar-managers/snap-manager/snap-manager';
import { EventManager } from 'oltb/src/oltb/js/toolbar-managers/event-manager/event-manager';
import { StyleManager } from 'oltb/src/oltb/js/toolbar-managers/style-manager/style-manager';
import { LayerManager } from 'oltb/src/oltb/js/toolbar-managers/layer-manager/layer-manager';
import { StateManager } from 'oltb/src/oltb/js/toolbar-managers/state-manager/state-manager';
import { TippyManager } from 'oltb/src/oltb/js/toolbar-managers/tippy-manager/tippy-manager';
import { ErrorManager } from 'oltb/src/oltb/js/toolbar-managers/error-manager/error-manager';
import { ConfigManager } from 'oltb/src/oltb/js/toolbar-managers/config-manager/config-manager';
import { ElementManager } from 'oltb/src/oltb/js/toolbar-managers/element-manager/element-manager';
import { TooltipManager } from 'oltb/src/oltb/js/toolbar-managers/tooltip-manager/tooltip-manager';
import { FeatureManager } from 'oltb/src/oltb/js/toolbar-managers/feature-manager/feature-manager';
import { SettingsManager } from 'oltb/src/oltb/js/toolbar-managers/settings-manager/settings-manager';
import { BootstrapManager } from 'oltb/src/oltb/js/toolbar-managers/bootstrap-manager/bootstrap-manager';
import { ConversionManager } from 'oltb/src/oltb/js/toolbar-managers/conversion-manager/conversion-manager';
import { InfoWindowManager } from 'oltb/src/oltb/js/toolbar-managers/info-window-manager/info-window-manager';
import { ProjectionManager } from 'oltb/src/oltb/js/toolbar-managers/projection-manager/projection-manager';
import { TranslationManager } from 'oltb/src/oltb/js/toolbar-managers/translation-manager/translation-manager';
import { ColorPickerManager } from 'oltb/src/oltb/js/toolbar-managers/color-picker-manager/color-picker-manager';
import { AccessibilityManager } from 'oltb/src/oltb/js/toolbar-managers/accessibility-manager/accessibility-manager';

// Toolbar tools
import { HomeTool } from 'oltb/src/oltb/js/toolbar-tools/home-tool/home-tool';
import { DrawTool } from 'oltb/src/oltb/js/toolbar-tools/draw-tool/draw-tool';
import { EditTool } from 'oltb/src/oltb/js/toolbar-tools/edit-tool/edit-tool';
import { InfoTool } from 'oltb/src/oltb/js/toolbar-tools/info-tool/info-tool';
import { HelpTool } from 'oltb/src/oltb/js/toolbar-tools/help-tool/help-tool';
import { ThemeTool } from 'oltb/src/oltb/js/toolbar-tools/theme-tool/theme-tool';
import { LayerTool } from 'oltb/src/oltb/js/toolbar-tools/layer-tool/layer-tool';
import { ZoomInTool } from 'oltb/src/oltb/js/toolbar-tools/zoom-in-tool/zoom-in-tool';
import { MeasureTool } from 'oltb/src/oltb/js/toolbar-tools/measure-tool/measure-tool';
import { MagnifyTool } from 'oltb/src/oltb/js/toolbar-tools/magnify-tool/magnify-tool';
import { ZoomOutTool } from 'oltb/src/oltb/js/toolbar-tools/zoom-out-tool/zoom-out-tool';
import { RefreshTool } from 'oltb/src/oltb/js/toolbar-tools/refresh-tool/refresh-tool';
import { ZoomboxTool } from 'oltb/src/oltb/js/toolbar-tools/zoombox-tool/zoombox-tool';
import { ToolboxTool } from 'oltb/src/oltb/js/toolbar-tools/toolbox-tool/toolbox-tool';
import { ScissorsTool } from 'oltb/src/oltb/js/toolbar-tools/scissors-tool/scissors-tool';
import { SettingsTool } from 'oltb/src/oltb/js/toolbar-tools/settings-tool/settings-tool';
import { OverviewTool } from 'oltb/src/oltb/js/toolbar-tools/overview-tool/overview-tool';
import { BookmarkTool } from 'oltb/src/oltb/js/toolbar-tools/bookmark-tool/bookmark-tool';
import { DirectionTool } from 'oltb/src/oltb/js/toolbar-tools/direction-tool/direction-tool';
import { DebugInfoTool } from 'oltb/src/oltb/js/toolbar-tools/debug-info-tool/debug-info-tool';
import { SplitViewTool } from 'oltb/src/oltb/js/toolbar-tools/split-view-tool/split-view-tool';
import { ExportPngTool } from 'oltb/src/oltb/js/toolbar-tools/export-png-tool/export-png-tool';
import { ScaleLineTool } from 'oltb/src/oltb/js/toolbar-tools/scale-line-tool/scale-line-tool';
import { GraticuleTool } from 'oltb/src/oltb/js/toolbar-tools/graticule-tool/graticule-tool';
import { MyLocationTool } from 'oltb/src/oltb/js/toolbar-tools/my-location-tool/my-location-tool';
import { ResetNorthTool } from 'oltb/src/oltb/js/toolbar-tools/reset-north-tool/reset-north-tool';
import { FullscreenTool } from 'oltb/src/oltb/js/toolbar-tools/fullscreen-tool/fullscreen-tool';
import { CoordinatesTool } from 'oltb/src/oltb/js/toolbar-tools/coordinates-tool/coordinates-tool';
import { TranslationTool } from 'oltb/src/oltb/js/toolbar-tools/translation-tool/translation-tool';
import { HiddenAboutTool } from 'oltb/src/oltb/js/toolbar-tools/hidden-about-tool/hidden-about-tool';
import { ContextMenuTool } from 'oltb/src/oltb/js/toolbar-tools/context-menu-tool/context-menu-tool';
import { HiddenMarkerTool } from 'oltb/src/oltb/js/toolbar-tools/hidden-marker-tool/hidden-marker-tool';
import { ImportVectorLayerTool } from 'oltb/src/oltb/js/toolbar-tools/import-vector-layer-tool/import-vector-layer-tool';
import { HiddenMapNavigationTool } from 'oltb/src/oltb/js/toolbar-tools/hidden-map-navigation-tool/hidden-map-navigation-tool';

function App() {
    useEffect(() => {
        const initLayers = () => {
            LayerManager.addMapLayers([
                {
                    id: '7b5399a8-9e57-4304-a233-cdf363c8ed93',
                    name: 'Open Street Map',
                    layer: new Tile({
                        source: new OSM({
                            crossOrigin: 'anonymous',
                        }),
                        visible: true
                    })
                }, {
                    id: '97485b21-6a9d-48fb-9838-645543648daa',
                    name: 'ArcGIS World Topo',
                    layer: new Tile({
                        source: new XYZ({
                            crossOrigin: 'anonymous',
                            attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
                            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
                        }),
                        visible: false
                    })
                }
            ], {
                isSilent: true
            });
        }

        const initManagers = () => {
            // Note: 
            // The init order is important
            BootstrapManager.initAsync([
                { manager: LogManager },
                { manager: EventManager },
                { manager: StyleManager },
                { manager: ErrorManager },
                { manager: FeatureManager },
                {
                    manager: StateManager, options: {
                        ignoredKeys: []
                    }
                },
                { manager: ElementManager },
                { manager: ConfigManager },
                { manager: TranslationManager },
                { manager: ProjectionManager },
                { manager: LayerManager },
                { manager: ColorPickerManager },
                { manager: TippyManager },
                { manager: TooltipManager },
                { manager: UrlManager },
                { manager: ToolManager },
                { manager: SettingsManager },
                { manager: SnapManager },
                { manager: InfoWindowManager },
                { manager: AccessibilityManager },
                { manager: ConversionManager },
                { manager: NameManager }
            ]).then(() => {
                initMapAndToolbar();
            });
        }

        const initMapAndToolbar = () => {
            const defaultLocation = ConfigManager.getConfig().location.default;
            const localStorageNodeName = LocalStorageKeys.mapData;
            const localStorageDefaults = Object.freeze({
                lon: defaultLocation.lon,
                lat: defaultLocation.lat,
                zoom: defaultLocation.zoom,
                rotation: defaultLocation.rotation,
            });

            const localStorage = StateManager.getAndMergeStateObject(
                localStorageNodeName,
                localStorageDefaults
            );

            const defaultProjection = ConfigManager.getConfig().projection.default;
            const map = new Map({
                interactions: defaultInterctions({
                    mouseWheelZoom: false,
                    altShiftDragRotate: false,
                    dragPan: false,
                    keyboard: false
                }).extend([
                    new MouseWheelZoom({
                        condition: function (event) {
                            return (
                                platformModifierKeyOnly(event) ||
                                SettingsManager.getSetting(Settings.mouseWheelZoom)
                            );
                        }
                    }),
                    new DragRotate({
                        condition: function (event) {
                            return (
                                altShiftKeysOnly(event) &&
                                SettingsManager.getSetting(Settings.altShiftDragRotate)
                            );
                        }
                    }),
                    new DragPan({
                        condition: function (event) {
                            return (
                                (
                                    platformModifierKeyOnly(event) ||
                                    SettingsManager.getSetting(Settings.dragPan)
                                ) && !altShiftKeysOnly(event) && !shiftKeyOnly(event)
                            );
                        }
                    }),
                    new KeyboardZoom({
                        condition: function (event) {
                            return (
                                SettingsManager.getSetting(Settings.keyboardZoom) &&
                                targetNotEditable(event)
                            );
                        }
                    }),
                    new KeyboardPan({
                        condition: function (event) {
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
                        onAdded: function (marker: any) {
                            console.log('HiddenMarkerTool: Marker added', marker);
                        },
                        onRemoved: function (marker: any) {
                            console.log('HiddenMarkerTool: Marker removed', marker);
                        },
                        onEdited: function (before: any, after: any) {
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
                        onInitiated: function () {
                            console.log('HomeTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('HomeTool: Clicked');
                        },
                        onBrowserStateCleared: function () {
                            console.log('HomeTool: State cleared');
                        },
                        onNavigatedHome: function (result: any) {
                            console.log('HomeTool: Navigated home', result);
                        }
                    }),
                    new ZoomInTool({
                        onInitiated: function () {
                            console.log('ZoomInTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('ZoomInTool: Clicked');
                        },
                        onZoomed: function (result: any) {
                            console.log('ZoomInTool: Zoomed in', result);
                        }
                    }),
                    new ZoomOutTool({
                        onInitiated: function () {
                            console.log('ZoomOutTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('ZoomOutTool: Clicked');
                        },
                        onZoomed: function (result: any) {
                            console.log('ZoomOutTool: Zoomed out', result);
                        }
                    }),
                    new ZoomboxTool({
                        onInitiated: function () {
                            console.log('ZoomboxTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('ZoomboxTool: Clicked');
                        },
                        onBrowserStateCleared: function () {
                            console.log('ZoomboxTool: State cleared');
                        },
                        onStart: function (event: any) {
                            console.log('ZoomboxTool: Start', event);
                        },
                        onEnd: function (event: any) {
                            console.log('ZoomboxTool: End', event);
                        },
                        onDrag: function (event: any) {
                            console.log('ZoomboxTool: Drag', event);
                        },
                        onCancel: function (event: any) {
                            console.log('ZoomboxTool: Cancel', event);
                        },
                        onError: function (event: any) {
                            console.log('ZoomboxTool: Error', event);
                        }
                    }),
                    new FullscreenTool({
                        onInitiated: function () {
                            console.log('FullscreenTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('FullscreenTool: Clicked');
                        },
                        onEnter: function (event: any) {
                            console.log('FullscreenTool: Enter fullscreen', event);
                        },
                        onLeave: function (event: any) {
                            console.log('FullscreenTool: Leave fullscreen', event);
                        }
                    }),
                    new ExportPngTool({
                        filename: 'map-image-export',
                        appendTime: true,
                        onInitiated: function () {
                            console.log('ExportPngTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('ExportPngTool: Clicked');
                        },
                        onExported: function (filename: any, content: any) {
                            console.log('ExportPngTool: PNG exported', filename, content);
                        },
                        onError: function (error: any) {
                            console.log('ExportPngTool: Error', error);
                        }
                    }),
                    new DrawTool({
                        onInitiated: function () {
                            console.log('DrawTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('DrawTool: Clicked');
                        },
                        onBrowserStateCleared: function () {
                            console.log('DrawTool: State cleared');
                        },
                        onStart: function (event: any) {
                            console.log('DrawTool: Start');
                        },
                        onEnd: function (event: { feature: any; }) {
                            console.log('DrawTool: End', event.feature);
                        },
                        onAbort: function (event: any) {
                            console.log('DrawTool: Abort');
                        },
                        onError: function (event: any) {
                            console.log('DrawTool: Error');
                        },
                        onIntersected: function (event: { feature: any; }, intersectedFeatures: any) {
                            console.log('DrawTool: Intersected', event.feature);
                            console.log('DrawTool: Intersected features', intersectedFeatures);
                        },
                        onSnapped: function (event: any) {
                            console.log('DrawTool: Snapped');
                        },
                        onUnSnapped: function (event: any) {
                            console.log('DrawTool: UnSnapped');
                        }
                    }),
                    new MeasureTool({
                        onInitiated: function () {
                            console.log('MeasureTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('MeasureTool: Clicked');
                        },
                        onBrowserStateCleared: function () {
                            console.log('MeasureTool: State cleared');
                        },
                        onStart: function (event: any) {
                            console.log('MeasureTool: Start');
                        },
                        onEnd: function (event: { feature: any; }) {
                            console.log('MeasureTool: End', event.feature);
                        },
                        onAbort: function (event: any) {
                            console.log('MeasureTool: Abort');
                        },
                        onError: function (event: any) {
                            console.log('MeasureTool: Eerror');
                        }
                    }),
                    new EditTool({
                        hitTolerance: 5,
                        onInitiated: function () {
                            console.log('EditTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('EditTool: Clicked');
                        },
                        onBrowserStateCleared: function () {
                            console.log('EditTool: State cleared');
                        },
                        onStyleChange: function (event: any, style: any) {
                            console.log('EditTool: Style changed');
                        },
                        onCutFeatures: function (features: any) {
                            console.log('EditTool: Cut features', features);
                        },
                        onCopyFeatures: function (features: any) {
                            console.log('EditTool: Copied features', features);
                        },
                        onPasteFeatures: function (features: any, layerWrapper: any) {
                            console.log('EditTool: Pasted features', features);
                        },
                        onShapeOperation: function (type: any, a: any, b: any, result: any) {
                            console.log('EditTool: Shape operation', type);
                        },
                        onSelectAdd: function (event: any) {
                            console.log('EditTool: Selected feature');
                        },
                        onSelectRemove: function (event: any) {
                            console.log('EditTool: Deselected feature');
                        },
                        onModifyStart: function (event: any) {
                            console.log('EditTool: Modify start');
                        },
                        onModifyEnd: function (event: any) {
                            console.log('EditTool: Modify end');
                        },
                        onTranslateStart: function (event: any) {
                            console.log('EditTool: Translate start');
                        },
                        onTranslateEnd: function (event: any) {
                            console.log('EditTool: Translate end');
                        },
                        onRemovedFeatures: function (features: any) {
                            console.log('EditTool: Removed features', features);
                        },
                        onError: function (event: any) {
                            console.log('EditTool: Error');
                        },
                        onSnapped: function (event: any) {
                            console.log('EditTool: Snapped');
                        },
                        onUnSnapped: function (event: any) {
                            console.log('EditTool: UnSnapped');
                        }
                    }),
                    new ScissorsTool({
                        onStart: function (event: any) {
                            console.log('ScissorsTool: Start');
                        },
                        onEnd: function (event: { feature: any; }) {
                            console.log('ScissorsTool: End', event.feature);
                        },
                        onAbort: function (event: any) {
                            console.log('ScissorsTool: Abort');
                        },
                        onError: function (event: any) {
                            console.log('ScissorsTool: Error');
                        },
                        onSnapped: function (event: any) {
                            console.log('ScissorsTool: Snapped');
                        },
                        onUnSnapped: function (event: any) {
                            console.log('ScissorsTool: UnSnapped');
                        }
                    }),
                    new BookmarkTool({
                        markerLayerVisibleOnLoad: true,
                        markerLabelUseEllipsisAfter: 20,
                        markerLabelUseUpperCase: false,
                        bookmarks: [{
                            id: '6812cc22-f490-46b7-a9f3-42eb9ea58ac2',
                            name: 'Custom Bookmark',
                            zoom: 5,
                            coordinates: [57.123, 16.456]
                        }],
                        onInitiated: function () {
                            console.log('BookmarkTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('BookmarkTool: Clicked');
                        },
                        onBrowserStateCleared: function () {
                            console.log('BookmarkTool: State cleared');
                        },
                        onAdded: function (bookmark: any) {
                            console.log('BookmarkTool: Added', bookmark);
                        },
                        onRemoved: function (bookmark: any) {
                            console.log('BookmarkTool: Removed', bookmark);
                        },
                        onRenamed: function (bookmark: any) {
                            console.log('BookmarkTool: Renamed', bookmark);
                        },
                        onZoomedTo: function (bookmark: any) {
                            console.log('BookmarkTool: Zoomed to', bookmark);
                        },
                        onCleared: function () {
                            console.log('BookmarkTool: Cleared');
                        },
                        onDragged: function (item: any, list: any) {
                            console.log('BookmarkTool: Dragged', item, list);
                        }
                    }),
                    new LayerTool({
                        onInitiated: function () {
                            console.log('LayerTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('LayerTool: Clicked');
                        },
                        onBrowserStateCleared: function () {
                            console.log('LayerTool: State cleared');
                        },
                        onMapLayerAdded: function (layerWrapper: any) {
                            console.log('LayerTool: Map layer added', layerWrapper);
                        },
                        onMapLayerRemoved: function (layerWrapper: any) {
                            console.log('LayerTool: Map layer removed', layerWrapper);
                        },
                        onMapLayerRenamed: function (layerWrapper: any) {
                            console.log('LayerTool: Map layer renamed', layerWrapper);
                        },
                        onMapLayerVisibilityChanged: function (layerWrapper: any) {
                            console.log('LayerTool: Map layer visibility change', layerWrapper);
                        },
                        onMapLayerDragged(item: any, list: any) {
                            console.log('LayerTool: Map layer dragged', item, list);
                        },
                        onFeatureLayerAdded: function (layerWrapper: any) {
                            console.log('LayerTool: Feature layer added', layerWrapper);
                        },
                        onFeatureLayerRemoved: function (layerWrapper: any) {
                            console.log('LayerTool: Feature layer removed', layerWrapper);
                        },
                        onFeatureLayerRenamed: function (layerWrapper: any) {
                            console.log('LayerTool: Feature layer renamed', layerWrapper);
                        },
                        onFeatureLayerVisibilityChanged: function (layerWrapper: any) {
                            console.log('LayerTool: Feature layer visibility change', layerWrapper);
                        },
                        onFeatureLayerDownloaded: function (layerWrapper: any, filename: any, content: any) {
                            console.log('LayerTool: Feature layer downloaded', layerWrapper, filename, content);
                        },
                        onFeatureLayerDragged(item: any, list: any) {
                            console.log('LayerTool: Feature layer dragged', item, list);
                        },
                    }),
                    new SplitViewTool({
                        onInitiated: function () {
                            console.log('SplitViewTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('SplitViewTool: Clicked');
                        },
                        onBrowserStateCleared: function () {
                            console.log('SplitViewTool: State cleared');
                        }
                    }),
                    new OverviewTool({
                        onInitiated: function () {
                            console.log('OverviewTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('OverviewTool: Clicked');
                        },
                        onBrowserStateCleared: function () {
                            console.log('OverviewTool: State cleared');
                        }
                    }),
                    new GraticuleTool({
                        color: '#3B4352E6',
                        dashed: true,
                        width: 2,
                        showLabels: true,
                        wrapX: true,
                        onInitiated: function () {
                            console.log('GraticuleTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('GraticuleTool: Clicked');
                        },
                        onBrowserStateCleared: function () {
                            console.log('GraticuleTool: State cleared');
                        }
                    }),
                    new MagnifyTool({
                        onInitiated: function () {
                            console.log('MagnifyTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('MagnifyTool: Clicked');
                        },
                        onBrowserStateCleared: function () {
                            console.log('MagnifyTool: State cleared');
                        }
                    }),
                    new ResetNorthTool({
                        onInitiated: function () {
                            console.log('ResetNorthTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('ResetNorthTool: Clicked');
                        },
                        onReset: function (result: any) {
                            console.log('ResetNorthTool: North reset', result);
                        }
                    }),
                    new CoordinatesTool({
                        onInitiated: function () {
                            console.log('CoordinatesTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('CoordinatesTool: Clicked');
                        },
                        onBrowserStateCleared: function () {
                            console.log('CoordinatesTool: State cleared');
                        },
                        onMapClicked: function (coordinates: any) {
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
                        onInitiated: function () {
                            console.log('MyLocationTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('MyLocationTool: Clicked');
                        },
                        onLocationFound: function (location: any) {
                            console.log('MyLocationTool: Location found', location);
                        },
                        onError: function (error: any) {
                            console.log('MyLocationTool: Error', error);
                        }
                    }),
                    new ImportVectorLayerTool({
                        onInitiated: function () {
                            console.log('ImportVectorLayerTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('ImportVectorLayerTool: Clicked');
                        },
                        onImported: function (features: any) {
                            console.log('ImportVectorLayerTool: Imported', features);
                        },
                        onError: function (filename: any, error: any) {
                            console.log('ImportVectorLayerTool: Error', filename, error);
                        }
                    }),
                    new ScaleLineTool({
                        units: 'metric',
                        onInitiated: function () {
                            console.log('ScaleLineTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('ScaleLineTool: Clicked');
                        },
                        onBrowserStateCleared: function () {
                            console.log('ScaleLineTool: State cleared');
                        }
                    }),
                    new RefreshTool({
                        onInitiated: function () {
                            console.log('RefreshTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('RefreshTool: Clicked');
                        }
                    }),
                    new ThemeTool({
                        onInitiated: function () {
                            console.log('ThemeTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('ThemeTool: Clicked');
                        },
                        onBrowserStateCleared: function () {
                            console.log('ThemeTool: State cleared');
                        },
                        onChanged: function (theme: any) {
                            console.log('ThemeTool: Changed to', theme);
                        }
                    }),
                    new DirectionTool({
                        onInitiated: function () {
                            console.log('DirectionTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('DirectionTool: Clicked');
                        },
                        onBrowserStateCleared: function () {
                            console.log('DirectionTool: State cleared');
                        },
                        onChanged: function (direction: any) {
                            console.log('DirectionTool: Changed to', direction);
                        }
                    }),
                    new ToolboxTool({
                        onInitiated: function () {
                            console.log('ToolboxTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('ToolboxTool: Clicked');
                        },
                        onBrowserStateCleared: function () {
                            console.log('ToolboxTool: State cleared');
                        },
                        onChanged: function (state: any) {
                            console.log('ToolboxTool: Changed to', state);
                        }
                    }),
                    new InfoTool({
                        title: 'Hey!',
                        content: '<p>This is a <strong>modal window</strong>, here you can place some text about your application or links to external resources.</p>',
                        onInitiated: function () {
                            console.log('InfoTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('InfoTool: Clicked');
                        }
                    }),
                    new HelpTool({
                        url: 'https://github.com/qulle/oltb',
                        target: '_blank',
                        onInitiated: function () {
                            console.log('HelpTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('HelpTool: Clicked');
                        }
                    }),
                    new SettingsTool({
                        onInitiated: function () {
                            console.log('SettingsTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('SettingsTool: Clicked');
                        },
                        onBrowserStateCleared: function () {
                            console.log('SettingsTool: State cleared');
                        }
                    }),
                    new TranslationTool({
                        onInitiated: function () {
                            console.log('TranslationTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('TranslationTool: Clicked');
                        },
                    }),
                    new DebugInfoTool({
                        onlyWhenGetParameter: false,
                        onInitiated: function () {
                            console.log('DebugInfoTool: Initiated');
                        },
                        onClicked: function () {
                            console.log('DebugInfoTool: Clicked');
                        }
                    }),
                    new HiddenAboutTool(),
                    new ContextMenuTool()
                ]),
                target: ElementManager.getMapElement(),
                view: new View({
                    projection: getProjection(defaultProjection) || '',
                    center: fromLonLat([
                        Number(localStorage.lon),
                        Number(localStorage.lat)
                    ], defaultProjection),
                    zoom: localStorage.zoom,
                    rotation: localStorage.rotation
                })
            });

            BootstrapManager.setMap(map);
            BootstrapManager.ready();
        }

        initLayers();
        initManagers();
    }, []);

    return (
        <>
            <div id="oltb"></div>
            <div id="map" tabIndex={0}></div>
        </>
    );
}

export default App;
