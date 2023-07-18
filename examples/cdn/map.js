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
    silent: true
});

const toolbar = new oltb({
    map: map,
    tools: {
        HiddenMarkerTool: {
            onAdded: function(marker) {
                console.log('Marker added', marker);
            },
            onRemoved: function(marker) {
                console.log('Marker removed', marker);
            },
            onEdited: function(before, after) {
                console.log('Marker edited', before, after);
            }
        },
        HiddenMapNavigationTool: {
            focusZoom: 10
        },
        HomeTool: {
            lon: 18.1201,
            lat: 35.3518,
            zoom: 3,
            onClick: function() {
                console.log('HomeTool click');
            },
            onHome: function() {
                console.log('Map zoomed home');
            }
        },
        ZoomInTool: {
            onClick: function() {
                console.log('ZoomInTool clicked');
            },
            onZoomed: function() {
                console.log('Zoomed in');
            }
        },
        ZoomOutTool: {
            onClick: function() {
                console.log('ZoomOutTool clicked');
            },
            onZoomed: function() {
                console.log('Zoomed out');
            }
        },
        FullscreenTool: {
            onClick: function() {
                console.log('FullscreenTool clicked');
            },
            onEnter: function(event) {
                console.log('Enter fullscreen mode', event);
            },
            onLeave: function(event) {
                console.log('Leave fullscreen mode', event);
            }
        },
        ExportPngTool: {
            filename: 'map-image-export',
            onClick: function() {
                console.log('ExportPngTool clicked');
            },
            onExported: function(filename, content) {
                console.log('Map exported as png', filename, content);
            },
            onError: function(error) {
                console.log('Error exporting png', error);
            }
        },
        DrawTool: {
            onClick: function() {
                console.log('DrawTool clicked');
            },
            onStart: function(event) {
                console.log('Draw Start');
            },
            onEnd: function(event) {
                console.log('Draw end', event.feature);
            },
            onAbort: function(event) {
                console.log('Draw abort');
            },
            onError: function(event) {
                console.log('Draw error');
            },
            onIntersected: function(event, intersectedFeatures) {
                console.log('Draw end', event.feature);
                console.log('Intersected features', intersectedFeatures);
            }
        },
        MeasureTool: {
            onClick: function() {
                console.log('MeasureTool clicked');
            },
            onStart: function(event) {
                console.log('Measure Start');
            },
            onEnd: function(event) {
                console.log('Measure end', event.feature);
            },
            onAbort: function(event) {
                console.log('Measure abort');
            },
            onError: function(event) {
                console.log('Measure error');
            }
        },
        EditTool: {
            hitTolerance: 5,
            onClick: function() {
                console.log('EditTool clicked');
            },
            onStyleChange: function(event, style) {
                console.log('Feature style changed');
            },
            onShapeOperation: function(type, a, b, result) {
                console.log('Shape operation', type);
            },
            onSelectAdd: function(event) {
                console.log('Selected feature');
            },
            onSelectRemove: function(event) {
                console.log('Deselected feature');
            },
            onModifyStart: function(event) {
                console.log('Modify start');
            },
            onModifyEnd: function(event) {
                console.log('Modify end');
            },
            onTranslateStart: function(event) {
                console.log('Translate start');
            },
            onTranslatEend: function(event) {
                console.log('Translate end');
            },
            onRemovedFeature: function(feature) {
                console.log('Removed feature', feature);
            },
            onError: function(event) {
                console.log('Edit error');
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
            onClick: function() {
                console.log('BookmarkTool clicked');
            },
            onAdded: function(bookmark) {
                console.log('Bookmark added', bookmark);
            },
            onRemoved: function(bookmark) {
                console.log('Bookmark removed', bookmark);
            },
            onRenamed: function(bookmark) {
                console.log('Bookmark renamed', bookmark);
            },
            onZoomedTo: function(bookmark) {
                console.log('Zoomed to bookmark', bookmark);
            },
            onCleared: function() {
                console.log('Bookmarks cleared');
            },
            onDragged: function(item, list) {
                console.log('Bookmark dragged', item, list);
            }
        },
        LayerTool: {
            onClick: function() {
                console.log('LayerTool clicked');
            },
            onMapLayerAdded: function(layerWrapper) {
                console.log('Map layer added', layerWrapper);
            },
            onMapLayerRemoved: function(layerWrapper) {
                console.log('Map layer removed', layerWrapper);
            },
            onMapLayerRenamed: function(layerWrapper) {
                console.log('Map layer renamed', layerWrapper);
            },
            onMapLayerVisibilityChanged: function(layerWrapper) {
                console.log('Map layer visibility change', layerWrapper);
            },
            onMapLayerDragged(item, list) {
                console.log('Map layer dragged', item, list);
            },
            onFeatureLayerAdded: function(layerWrapper) {
                console.log('Feature layer added', layerWrapper);
            },
            onFeatureLayerRemoved: function(layerWrapper) {
                console.log('Feature layer removed', layerWrapper);
            },
            onFeatureLayerRenamed: function(layerWrapper) {
                console.log('Feature layer renamed', layerWrapper);
            },
            onFeatureLayerVisibilityChanged: function(layerWrapper) {
                console.log('Feature layer visibility change', layerWrapper);
            },
            onFeatureLayerDownloaded: function(layerWrapper, filename, content) {
                console.log('Feature layer downloaded', layerWrapper, filename, content);
            },
            onFeatureLayerDragged(item, list) {
                console.log('Feature layer dragged', item, list);
            }
        },
        SplitViewTool: {
            onClick: function() {
                console.log('SplitViewTool clicked');
            }
        },
        OverviewTool: {
            onClick: function() {
                console.log('OverviewTool clicked');
            }
        },
        GraticuleTool: {
            color: '#3B4352E6',
            dashed: true,
            width: 2,
            showLabels: true,
            wrapX: true,
            onClick: function() {
                console.log('GraticuleTool clicked');
            }
        },
        MagnifyTool: {
            onClick: function() {
                console.log('MagnifyTool clicked');
            }
        },
        ResetNorthTool: {
            onClick: function() {
                console.log('ResetNorthTool clicked');
            },
            onReset: function() {
                console.log('Map north reset');
            }
        },
        CoordinatesTool: {
            onClick: function() {
                console.log('CoordinatesTool clicked');
            },
            onMapClicked: function(coordinates) {
                console.log('You clicked at', coordinates);
            }
        },
        MyLocationTool: {
            enableHighAccuracy: true,
            timeout: 10000,
            description: 'This is the location that the browser was able to find. It might not be your actual location.',
            onClick: function() {
                console.log('MyLocationTool clicked');
            },
            onLocation: function(location) {
                console.log('Location', location);
            },
            onError: function(error) {
                console.log('Location error', error);
            }
        },
        ImportVectorLayerTool: {
            onClick: function() {
                console.log('ImportVectorLayerTool clicked');
            },
            onImported: function(features) {
                console.log('Imported', features);
            },
            onError: function(filename, error) {
                console.log('Error when importing file:', filename, error);
            }
        },
        ScaleLineTool: {
            units: 'metric',
            onClick: function() {
                console.log('ScaleLineTool clicked');
            }
        },
        RefreshTool: {
            onClick: function() {
                console.log('RefreshTool clicked');
            }
        },
        ThemeTool: {
            onClick: function() {
                console.log('ThemeTool clicked');
            },
            onChanged: function(theme) {
                console.log('Theme changed to', theme);
            }
        },
        DirectionTool: {
            onClick: function() {
                console.log('DirectionTool clicked');
            },
            onChanged: function(direction) {
                console.log('Direction changed to', direction);
            }
        },
        InfoTool: {
            title: 'Hey!', 
            content: '<p>This is a <strong>modal window</strong>, here you can place some text about your application or links to external resources.</p>',
            onClick: function() {
                console.log('InfoTool clicked');
            }
        },
        NotificationTool: {
            onClick: function() {
                console.log('NotificationTool clicked');
            }
        },
        HelpTool: {
            url: 'https://github.com/qulle/oltb',
            target: '_blank',
            onClick: function() {
                console.log('HelpTool clicked');
            }
        },
        SettingsTool: {
            onClick: function() {
                console.log('SettingsTool clicked');
            },
            onCleared: function() {
                console.log('Settings cleared');
            }
        },
        DebugInfoTool: {
            showWhenGetParameter: false,
            onClick: function() {
                console.log('DebugInfoTool clicked');
            }
        },
        HiddenAboutTool: {}
    }
});
