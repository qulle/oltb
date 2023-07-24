const map = new ol.Map({
    interactions: ol.interaction.defaults.defaults({
        mouseWheelZoom: false,
        altShiftDragRotate: false,
        dragPan: false,
        keyboard: false
    }),
    controls: ol.control.defaults.defaults({
        zoom: false, 
        rotate: false
    }),
    view: new ol.View({
        projection: ol.proj.get(oltb.Config.projection.default)
    })
});

oltb.LayerManager.addMapLayers([
    {
        id: '7b5399a8-9e57-4304-a233-cdf363c8ed93',
        name: 'Open Street Map',
        layer: new ol.layer.Tile({
            source: new ol.source.OSM({
                crossOrigin: 'anonymous',
            }),
            visible: true
        })
    }, {
        id: '97485b21-6a9d-48fb-9838-645543648daa',
        name: 'ArcGIS World Topo',
        layer: new ol.layer.Tile({
            source: new ol.source.XYZ({
                crossOrigin: 'anonymous',
                attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
                url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
            }),
            visible: false
        })
    }, {
        id: '5cfbaa02-38e7-45bd-9923-4eaba539aa9b',
        name: 'Stamen Watercolor',
        layer: new ol.layer.Tile({
            maxZoom: 12,
            source: new ol.source.Stamen({
                crossOrigin: 'anonymous',
                layer: 'watercolor',
                attributions: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
            }),
            visible: false
        })
    }, {
        id: 'b1646bdb-b201-4a88-9240-78fca6f6d8c4',
        name: 'Stamen Terrain',
        layer: new ol.layer.Tile({
            maxZoom: 12,
            source: new ol.source.Stamen({
                crossOrigin: 'anonymous',
                layer: 'terrain',
                attributions: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
            }),
            visible: false
        })
    }
], {
    isSilent: true
});

const toolbar = new oltb({
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
            onNavigatedHome: function() {
                console.log('HomeTool: Zoomed home');
            }
        },
        ZoomInTool: {
            onInitiated: function() {
                console.log('ZoomInTool: Initiated');
            },
            onClicked: function() {
                console.log('ZoomInTool: Clicked');
            },
            onZoomed: function() {
                console.log('ZoomInTool: Zoomed in');
            }
        },
        ZoomOutTool: {
            onInitiated: function() {
                console.log('ZoomOutTool: Initiated');
            },
            onClicked: function() {
                console.log('ZoomOutTool: Clicked');
            },
            onZoomed: function() {
                console.log('ZoomOutTool: Zoomed out');
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
        },
        BookmarkTool: {
            markerLayerVisibleOnLoad: true,
            bookmarks: [{
                id: 18151210,
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
            }
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
            }
        },
        MagnifyTool: {
            onInitiated: function() {
                console.log('MagnifyTool: Initiated');
            },
            onClicked: function() {
                console.log('MagnifyTool: Clicked');
            }
        },
        ResetNorthTool: {
            onInitiated: function() {
                console.log('ResetNorthTool: Initiated');
            },
            onClicked: function() {
                console.log('ResetNorthTool: Clicked');
            },
            onReset: function() {
                console.log('ResetNorthTool: North reset');
            }
        },
        CoordinatesTool: {
            onInitiated: function() {
                console.log('CoordinatesTool: Initiated');
            },
            onClicked: function() {
                console.log('CoordinatesTool: Clicked');
            },
            onMapClicked: function(coordinates) {
                console.log('CoordinatesTool: Map clicked at', coordinates);
            }
        },
        MyLocationTool: {
            enableHighAccuracy: true,
            timeout: 10000,
            description: 'This is the location that the browser was able to find. It might not be your actual location.',
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
            onClicked: function() {
                console.log('DirectionTool: Clicked');
            },
            onBrowserStateCleared: function() {
                console.log('DirectionTool: State cleared');
            },
            onChanged: function(direction) {
                console.log('DirectionTool: Changed to', direction);
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
        NotificationTool: {
            onInitiated: function() {
                console.log('NotificationTool: Initiated');
            },
            onClicked: function() {
                console.log('NotificationTool: Clicked');
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
        DebugInfoTool: {
            showWhenGetParameter: false,
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
