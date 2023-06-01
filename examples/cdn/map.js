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
        name: 'Open Street Map',
        layer: new ol.layer.Tile({
            source: new ol.source.OSM({
                crossOrigin: 'anonymous',
            }),
            visible: true
        })
    }, {
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
], true);

const toolbar = new oltb({
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
            lon: 18.1201,
            lat: 35.3518,
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
        ExportPngTool: {
            filename: 'map-image-export',
            click: function() {
                console.log('ExportPngTool clicked');
            },
            exported: function(filename, content) {
                console.log('Map exported as png', filename, content);
            },
            error: function(error) {
                console.log('Error exporting png', error);
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
            bookmarks: [{
                id: 18151210,
                name: 'Custom bookmark',
                zoom: 5,
                coordinates: [57.123, 16.456]
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
            featureLayerDownloaded: function(layerWrapper, filename, content) {
                console.log('Feature layer downloaded', layerWrapper, filename, content);
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
            color: '#3B4352E6',
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
                console.log('CoordinatesTool clicked');
            },
            mapClicked: function(coordinates) {
                console.log('You clicked at', coordinates);
            }
        },
        MyLocationTool: {
            enableHighAccuracy: true,
            timeout: 10000,
            description: 'This is the location that the browser was able to find. It might not be your actual location.',
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
            showWhenGetParameter: false,
            click: function() {
                console.log('DebugInfoTool clicked');
            }
        },
        HiddenAboutTool: {}
    }
});
