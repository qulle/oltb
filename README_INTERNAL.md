<p align="center">
    <img src="https://raw.githubusercontent.com/qulle/oltb/main/images/oltb-full.svg" width="200" />
</p>

<h1 align="center">Toolbar for OpenLayers</h1>

## About
Detailed documentation how the Toolbar is structured, internal dependencies and how all parts are connected together.

## Table of contents
1. [Get Started](#get-started)
2. [Browser Support](#browser-support)
3. [Migrating](#migrating)
4. [Localizations](#localizations)
5. [About The Code](#about-the-code)
    1. [HTML](#html)
    2. [SCSS](#scss)
    3. [Import And Export](#import-and-export)
    4. [JavaScript](#javascript)
    5. [Callback Functions And Constructor Parameters](#callback-functions-and-constructor-parameters)
    6. [Store Data Locally](#store-data-locally)
    7. [Hidden Tools](#hidden-tools)
    8. [Shortcut Keys](#shortcut-keys)
    9. [Managers](#managers)
    10. [Custom Projections](#custom-projections)
    11. [Layers](#layers)
    12. [Dialogs](#dialogs)
        1. [Alert](#alert)
        2. [Confirm](#confirm)
        3. [Prompt](#prompt)
    13. [Modal](#modal)
    14. [Toast](#toast)
    15. [Icons](#icons)
        1. [Basic Icons](#basic-icons)
        2. [WindBarb Icons](#windbarb-icons)
    16. [Context Menu](#context-menu)
    17. [State Management](#state-management)
    18. [Debug Tool](#debug-tool)
    19. [Logging](#logging)
    20. [OLTB Namespace](#oltb-namespace)
6. [Colors](#colors) 
    1. [Theme Colors](#theme-colors)
    2. [Color Palette](#color-palette)
7. [License](#license)
8. [Making A Release](#making-a-release)
9. [Update Dependencies](#update-dependencies)
10. [Author](#author)

## Get Started
The dev-environment uses NPM so you need to have [Node.js](https://nodejs.org/en/) installed. I use Node version *20.12.0* and NPM version *10.7.0*.

1. Clone
```
$ git clone https://github.com/qulle/oltb.git
```

2. Install Dependencies
```
$ npm install
```

3. Run Tests
```
$ npm run test
$ npm run test:coverage
```

4. Run Devserver
```
$ npm start
```

Scripts in `package.json` was designed to be executed in Bash. If you are using Windows then by default CMD is the default shell that NPM uses internally, even if you run the first command from Bash. Set Bash as default shell in the NPM-config.
```bash
# x86
$ npm config set script-shell "C:\\Program Files (x86)\\git\\bin\\bash.exe"

# x64
$ npm config set script-shell "C:\\Program Files\\git\\bin\\bash.exe"
```

## Browser Support 
Manually tested in modern browsers (Mozilla Firefox, Microsoft Edge, Google Chrome).

_IE is not supported, it's time to move on._

## Migrating
If you switch between different versions of the Toolbar, it may be a good idea to clear your browser's LocalStorage data for the targeted domain.
```javascript
localStorage.clear();
```

## Localizations
English is the default language. However the Toolbar can be extended with any other language. A second language (Swedish) is also shipped with the Toolbar in order to show how it is done. The available languages are controlled from `oltb/assets/config/config.json`. The translation files are put in to `oltb/assets/i18n/<ab-cd>.json`.

## About The Code
Below is the basic HTML and JavaScript structure used in the project. For a complete example of how to set up the code go to the [Examples Directory](https://github.com/qulle/oltb/tree/main/examples/).

### HTML
```HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, user-scalable=0" />
    <link rel="icon" type="image/svg+xml" href="./oltb-icon.svg" />
    <title>OLTB - Toolbar for OpenLayers</title>
</head>
<body>
    <div id="oltb"></div>
    <div id="map" tabindex="0"></div>

    <script type="module" src="./map.js"></script>
</body>
</html>
```

The Toolbar is vertical by default, add class `row` to change direction. The user can change the direction using the tool `DirectionTool`.
```HTML
<div id="oltb" class="row"></div>
```

The Toolbar theme is light by default, add class `dark` to change theme. The user can change the theme using the tool `ThemeTool`.
```HTML
<div id="oltb" class="dark"></div>
```

### SCSS
SCSS and HTML is written with [BEM](http://getbem.com/introduction/) naming convention.
```css
.block {}
.block__element {}
.block__element--modifier {}
```

### Import And Export
All modules uses named exports exclusively throughout the project. The one exception is the `oltb.js` file which is the main entry for Rollup to create the portable CDN version.

### JavaScript
The tools are located in the directory `oltb/js/toolbar-tools`. Every tool has its own class and extend the BaseTool-class.
```javascript
class CoordinatesTool extends BaseTool {}
```

The BaseTool-class extends the Control-class from OpenLayers.
```javascript
class BaseTool extends Control {}
```

When using the custom tools, all that is needed is to import the module(s) you want to have in your Toolbar.
```javascript
import { HomeTool } from 'oltb/js/toolbar-tools/home-tool/home-tool';
import { DrawTool } from 'oltb/js/toolbar-tools/draw-tool/draw-tool';
import { EditTool } from 'oltb/js/toolbar-tools/edit-tool/edit-tool';
import { InfoTool } from 'oltb/js/toolbar-tools/info-tool/info-tool';
import { HelpTool } from 'oltb/js/toolbar-tools/help-tool/help-tool';
import { ThemeTool } from 'oltb/js/toolbar-tools/theme-tool/theme-tool';
import { LayerTool } from 'oltb/js/toolbar-tools/layer-tool/layer-tool';
import { ZoomInTool } from 'oltb/js/toolbar-tools/zoom-in-tool/zoom-in-tool';
import { ZoomboxTool } from 'oltb/js/toolbar-tools/zoombox-tool/zoombox-tool';
import { ToolboxTool } from 'oltb/js/toolbar-tools/toolbox-tool/toolbox/tool';
import { MeasureTool } from 'oltb/js/toolbar-tools/measure-tool/measure-tool';
import { MagnifyTool } from 'oltb/js/toolbar-tools/magnify-tool/magnify-tool';
import { ZoomOutTool } from 'oltb/js/toolbar-tools/zoom-out-tool/zoom-out-tool';
import { RefreshTool } from 'oltb/js/toolbar-tools/refresh-tool/refresh-tool';
import { SettingsTool } from 'oltb/js/toolbar-tools/settings-tool/settings-tool';
import { OverviewTool } from 'oltb/js/toolbar-tools/overview-tool/overview-tool';
import { ScissorsTool } from 'oltb/js/toolbar-tools/scissors-tool/scissors-tool';
import { BookmarkTool } from 'oltb/js/toolbar-tools/bookmark-tool/bookmark-tool';
import { DirectionTool } from 'oltb/js/toolbar-tools/direction-tool/direction-tool';
import { DebugInfoTool } from 'oltb/js/toolbar-tools/debug-info-tool/debug-info-tool';
import { SplitViewTool } from 'oltb/js/toolbar-tools/split-view-tool/split-view-tool';
import { ExportPngTool } from 'oltb/js/toolbar-tools/export-png-tool/export-png-tool';
import { ScaleLineTool } from 'oltb/js/toolbar-tools/scale-line-tool/scale-line-tool';
import { GraticuleTool } from 'oltb/js/toolbar-tools/graticule-tool/graticule-tool';
import { MyLocationTool } from 'oltb/js/toolbar-tools/my-location-tool/my-location-tool';
import { ResetNorthTool } from 'oltb/js/toolbar-tools/reset-north-tool/reset-north-tool';
import { FullscreenTool } from 'oltb/js/toolbar-tools/fullscreen-tool/fullscreen-tool';
import { CoordinatesTool } from 'oltb/js/toolbar-tools/coordinates-tool/coordinates-tool';
import { TranslationTool } from 'oltb/js/toolbar-tools/translation-tool/translation-tool';
import { HiddenAboutTool } from 'oltb/js/toolbar-tools/hidden-about-tool/hidden-about-tool';
import { ContextMenuTool } from 'oltb/js/toolbar-tools/context-menu-tool/context-menu-tool';
import { HiddenMarkerTool } from 'oltb/js/toolbar-tools/hidden-marker-tool/hidden-marker-tool';
import { ImportVectorLayerTool } from 'oltb/js/toolbar-tools/import-vector-layer-tool/import-vector-layer-tool';
import { HiddenMapNavigationTool } from 'oltb/js/toolbar-tools/hidden-map-navigation-tool/hidden-map-navigation-tool';
```

Then call the constructor for each tool in the extend method. The tools are added to the Toolbar in the order you include them in the array.
```javascript
controls: defaultControls({
    zoom: false, 
    rotate: false
}).extend([
    new HiddenMarkerTool(),
    new HiddenMapNavigationTool(),
    new HomeTool(),
    new ZoomInTool(),
    new ZoomOutTool(),
    new ZoomboxTool(),
    new FullscreenTool(),
    new ExportPngTool(),
    new DrawTool(),
    new MeasureTool(),
    new EditTool(),
    new ScissorsTool(),
    new BookmarkTool(),
    new LayerTool(),
    new SplitViewTool(),
    new OverviewTool(),
    new GraticuleTool(),
    new MagnifyTool(),
    new ResetNorthTool(),
    new CoordinatesTool(),
    new MyLocationTool(),
    new ImportVectorLayerTool(),
    new ScaleLineTool(),
    new RefreshTool(),
    new ThemeTool(),
    new DirectionTool(),
    new ToolboxTool(),
    new InfoTool(),
    new TranslationTool(),
    new HelpTool(),
    new SettingsTool(),
    new DebugInfoTool()
    new HiddenAboutTool()
])
```

### Callback Functions And Constructor Parameters
Tools that in any way change the map, create, modify or delete objects have several different callback functions that return data to you. All tools in the main Toolbar have at least one callback that is named `onInitiated`. They often have a callback named `onClicked` aswell.
```javascript
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
        delta: 1,
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
        delta: -1,
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
    new ZoomboxTool({
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
        },
        onSnapped: function(event) {
            console.log('DrawTool: Snapped');
        },
        onUnSnapped: function(event) {
            console.log('DrawTool: UnSnapped');
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
            console.log('MeasureTool: Error');
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
    }),
    new ScissorsTool({
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
        }
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
        },
        onBrowserStateCleared: function() {
            console.log('GraticuleTool: State cleared');
        }
    }),
    new MagnifyTool({
        radius: 75,
        min: 25,
        max: 150,
        onInitiated: function() {
            console.log('MagnifyTool: Initiated');
        },
        onClicked: function() {
            console.log('MagnifyTool: Clicked');
        },
        onBrowserStateCleared: function() {
            console.log('MagnifyTool: State cleared');
        }
    }),
    new ResetNorthTool({
        onInitiated: function() {
            console.log('ResetNorthTool: Initiated');
        },
        onClicked: function() {
            console.log('ResetNorthTool: Clicked');
        },
        onReset: function() {
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
        onBrowserStateCleared: function() {
            console.log('CoordinatesTool: State cleared');
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
        },
        onBrowserStateCleared: function() {
            console.log('ScaleLineTool: State cleared');
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
    new ToolboxTool({
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
    new TranslationTool({
        onInitiated: function() {
            console.log('TranslationTool: Initiated');
        },
        onClicked: function() {
            console.log('TranslationTool: Clicked');
        },
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
    new ContextMenuTool()
])
```

### Hidden Tools
Tools refered to as hidden tools are tools that only add functionality via the context menu. The hidden tools are used to enable the same type of setup and callback functions that exists on all other tools. 

### Shortcut Keys
All tools have a shortcut key for ease of use and speeds up the handling of the Toolbar. The shortcut key is displayed in the tooltip on the corresponding tool. All shortcut keys are stored in the module `oltb/js/browser-constants/shortcut-keys.js`.
```javascript
const ShortcutKeys = Object.freeze({
    areaOverview: 'A',
    bookmark: 'B',
    coordinates: 'C'
    ...
});
```

### Managers
There are a number of so-called managers located in `oltb/js/toolbar-managers`. These are to be considered as self-isolated classes that have no dependencies to the tools, but the other way around. The managers are the central hub of the application that provides data to all other parties and among themselves.

The managers are initiated in two steps. The first one is the base initiation that is done before the map is created.
```javascript
BootstrapManager.initAsync([
    { manager: LogManager },
    { manager: EventManager },
    { manager: StyleManager },
    { manager: ErrorManager },
    { manager: FeatureManager },
    { manager: StateManager, options: {
        ignoredKeys: []
    }},
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
    { manager: AccessibilityManager }
]);
```

The second step is to pass the created map as reference to all managers. After that the ready method is called which will fire of a event that components and managers will listen for in order to do the final configurations now when both the DOM, Map and Toolbar is ready to be used. 
```javascript
BootstrapManager.setMap(map);
```

### Custom Projections
You can define custom projections in the file `oltb/js/toolbar-managers/projection-manager/projection-manager.js`. This manager keeps track of all added projections. If you want to change the default projection used, there is a general config module `oltb/js/toolbar-managers/config-manager/default-config.js` where you can change that. More projections can be fetched at [https://epsg.io/](https://epsg.io/).

The map uses `EPSG:3857` as the default projection. Tools that can receive coordinates expect these to be given in the projection `EPSG:4326`:

The following projections are added by default.
<table>
    <tr>
        <th>Code</th>
        <th>Name</th>
        <th>Description</th>
    </tr>
    <tr>
        <td>EPSG:3857</td>
        <td>WGS 84 / Pseudo-Mercator</td>
        <td>Standard projection used by OpenLayers, Google Maps, Bing Maps</td>
    </tr>
    <tr>
        <td>EPSG:4326</td>
        <td>WGS 84 (World Geodetic System)</td>
        <td>Common GPS style coordinates</td>
    </tr>
    <tr>
        <td>EPSG:7789</td>
        <td>ITRF2014</td>
        <td>An Earth-fixed system that is independent of continental drift</td>
    </tr>
    <tr>
        <td>EPSG:3006</td>
        <td>SWEREF99 TM</td>
        <td>Projected coordinate system for Sweden - onshore and offshore. From 2003 replaces RT90 2.5 gon V (CRS code 3021)</td>
    </tr>
    <tr>
        <td>EPSG:3021</td>
        <td>RT90 2.5 gon V</td>
        <td>Coordinate system that previously was used for map production in Sweden. Many services sill generates coordinates in this projection.</td>
    </tr>
</table>

### Layers
Layers are added to the map using the `LayerManager`. The manager handels internal functionality and fires of events that the `LayerTool` captures to create the UI.
```javascript
import { LayerManager } from 'oltb/js/toolbar-managers/layer-manager/layer-manager';
```

Layers can be added at any time during the applications lifetime. If the map is not ready to recieve a layer the manager will queue the layer and add it to the map once the manager is initiated with a reference to the map.

There are two types of layers, `map`- and `feature`-layers. Exampels of adding different types of layers are available in the [Examples Directory](https://github.com/qulle/oltb/tree/main/examples/).

**Note:** Both the DrawTool and MeasureTool add features through the LayerManager and not directly to the source of the layer. This is because the LayerManager also keeps tracks of all features so that the Snap interaction can work.

### Markers
Markers can be created in the map using the following Manager.
```javascript
import { FeatureManager } from 'oltb/js/toolbar-managers/feature-manager/feature-manager';
```

To create a marker use the following object properties.
```javascript
const marker = FeatureManager.generateIconMarker({
    lon: 18.0685,
    lat: 59.3293,
    title: 'Marker',
    marker: {
        fill: '#0166A5FF',
        stroke: '#0166A566'
    },
    icon: {
        key: 'geoMarker.filled'
    },
    label: {
        text: 'Marker Label'
    }
});
```

All available properties:
```javascript
({
    lon: undefined,
    lat: undefined,
    infoWindow: undefined,
    title: '',
    description: '',
    settings: {
        isClickable: true,
        isSelectable: false,
        isEditable: false,
        isDeletable: true,
        shouldReplaceHashtag: true
    },
    marker: {
        width: 14,
        radius: 14,
        fill: '#0166A5FF',
        stroke: '#0166A566',
        strokeWidth: 2
    },
    icon: {
        key: 'geoPin.filled',
        width: 14,
        height: 14,
        rotation: 0,
        fill: '#FFFFFFFF',
        stroke: '#FFFFFFFF',
        strokeWidth: 0
    },
    label: {
        text: '',
        font: '14px Calibri',
        fill: '#FFFFFFFF',
        stroke: '#3B4352CC',
        strokeWidth: 8,
        useEllipsisAfter: 20,
        useUpperCase: false
    }
})
```

#### URL Markers
A marker can be created by providing the `oltb-marker` object as the GET parameter with the following syntax.
```
/?oltb-marker={"title":"Marker Title","label":"Marker Label","description":"Information about the maker","icon":"exclamationTriangle.filled","iconFill":"%23FFFFFFFF","iconStroke":"%23FFFFFFFF","markerFill":"%23EB4542FF","markerStroke":"%23EB454266","layerName":"URL Marker","projection":"EPSG:4326","lon":18.0685,"lat":59.3293,"zoom":8}
```

Test the marker above using the <a href='https://qulle.github.io/oltb/?oltb-marker={"title":"Marker Title","label":"Marker Label","description":"Information about the maker","icon":"exclamationTriangle.filled","iconFill":"%23FFFFFFFF","iconStroke":"%23FFFFFFFF","markerFill":"%23EB4542FF","markerStroke":"%23EB454266","layerName":"URL Marker","projection":"EPSG:4326","lon":18.0685,"lat":59.3293,"zoom":8}' target="_blank">demo page</a>.

The JSON object has the following structure.
```json
{
    "title": "Marker Title",
    "description": "Information about the maker",
    "icon": "exclamationTriangle.filled",
    "iconFill": "%23FFFFFFFF",
    "iconStroke": "%23FFFFFFFF",
    "label": "Marker Label",
    "markerFill": "%23EB4542FF",
    "markerStroke": "%23EB454266",
    "layerName": "URL Marker",
    "projection": "EPSG:4326",
    "lon": 18.0685,
    "lat": 59.3293,
    "zoom": 8
}
```

### Wind Barbs
Wind Barbs can be created in the map using the following manager.
```javascript
import { FeatureManager } from 'oltb/js/toolbar-managers/feature-manager/feature-manager';
```

To create a wind barb use the following object properties.
```javascript
const windSpeed = 12.5;
const windBarb = FeatureManager.generateWindBarb({
    lon: 18.0685,
    lat: 59.3293,
    title: 'Wind Barb',
    icon: {
        key: windSpeed,
        rotation: 210
    },
    label: {
        text: `${windSpeed}m/s`
    }
});
```

All available properties:
```javascript
({
    lon: undefined,
    lat: undefined,
    infoWindow: undefined,
    title: '',
    description: '',
    settings: {
        isClickable: true,
        isSelectable: false,
        isEditable: false,
        isDeletable: true,
        shouldReplaceHashtag: true
    },
    icon: {
        key: 0,
        width: 200,
        height: 200,
        rotation: 0,
        fill: '#3B4352FF',
        stroke: '#3B4352FF',
        strokeWidth: 3
    },
    label: {
        text: '',
        font: '14px Calibri',
        fill: '#FFFFFFFF',
        stroke: '#3B4352CC',
        strokeWidth: 8,
        useEllipsisAfter: 20,
        useUpperCase: false
    }
})
```

### Dialogs
To use the custom dialogs in the map, include the following module. All the dialogs uses trap focus and circles the tab-key to always stay in the opened dialog. A reference to the created dialog is returned.
```javascript
import { Dialog } from 'oltb/js/ui-common/ui-dialogs/dialog';
```

#### Alert
```javascript
Dialog.alert({
    title: 'Information',
    message: 'This is a custom alert message to inform the user',
    onConfirm: () => {
        console.log('Alert closed');
    }
});
```

All available properties:
```javascript
({
    title: 'Alert',           // Dialog title
    message: 'Alert message', // Dialog message
    confirmText: 'Ok',        // Confirm button text
    onConfirm: undefined      // Void callback with no parameters
});
```

#### Confirm
```javascript
Dialog.confirm({
    title: 'Delete layer',
    message: 'Do you want to delete the selected layer?',
    onConfirm: () => {
        console.log('Confirm button clicked');
    },
    onCancel: () => {
        console.log('Cancel button clicked');
    }
});
```

All available properties:
```javascript
({
    title: 'Alert',               // Dialog title
    message: 'Alert message',     // Dialog message
    confirmClass: Dialog.Success, // Dialog style (good/bad)
    confirmText: 'Confirm',       // Confirm button text
    cancelText: 'Cancel',         // Cancel button text
    onConfirm: undefined,         // Void callback with no parameters
    onCancel: undefined           // Void callback with no parameters
});
```

#### Prompt
```javascript
Dialog.prompt({
    title: 'Edit name',
    message: 'You are editing the main layer name',
    value: 'Current name',
    onConfirm: (result) => {
        console.log(result);
    },
    onCancel: () => {
        console.log('Cancel button clicked');
    }
});
```

All available properties:
```javascript
({
    title: 'Prompt',             // Dialog title
    message: 'Prompt message',   // Dialog message
    placeholder: undefined,      // Placeholder to show if no value
    value: 'Current value',      // Value to show in textbox 
    confirmClass: Dialog.Danger, // Dialog style (good/bad)
    confirmText: 'Confirm',      // Confirm button text
    cancelText: 'Cancel',        // Cancel button text
    onConfirm: undefined,        // Void callback with 1 string parameter
    onCancel: undefined,         // Void callback with no parameters,
    onInput: undefined           // Void callback with 1 string parameter
});
```

#### Select
```javascript
const languages = [
    {
        text: 'Swedish (sv-se)',
        value: 'sv-se'
    }, {
        text: 'English (en-us)',
        value: 'en-us'
    }
];

Dialog.select({
    title: 'Change Language',
    message: `Current language is <strong>English (en-us)</strong>`,
    value: 'en-us',
    options: languages,
    confirmText: 'Translate',
    onConfirm: (result) => {
        console.log(result.from, result.to);
    },
    onChange: (result) => {
        console.log(result);
    },
    onCancel: () => {
        console.log('Cancel button clicked');
    }
});
```

All available properties:
```javascript
({
    title: 'Prompt',             // Dialog title
    message: 'Select message',   // Dialog message
    value: 'Current value',      // Option to be selected 
    options: [],                 // Options to show in select
    confirmClass: Dialog.Danger, // Dialog style (good/bad)
    confirmText: 'Confirm',      // Confirm button text
    cancelText: 'Cancel',        // Cancel button text
    onConfirm: undefined,        // Void callback with 2 string parameter (value, new value)
    onCancel: undefined,         // Void callback with no parameters,
    onChange: undefined          // Void callback with 1 string parameter
});
```

### Modal
To use the custom modal in the map, include the following module. A reference to the created modal is returned.
```javascript
import { Modal } from 'oltb/js/ui-common/ui-modals/modal';
```

The modal uses trap focus to circle the tab-key.
```javascript
Modal.create({
    title: 'Title', 
    content: 'Text/HTML content',
    maximized: false,
    onClose: () => {
        console.log('Modal closed');
    }
});
```

The returned reference can be used to block the creation of a second modal if a button or shortcut key is pressed again. The `onClose` callback can be used to release the lock.
```javascript
onInfoToolClick() {
    if(this.infoModal) {
        return;
    }

    this.infoModal = Modal.create({
        title: 'Title', 
        content: 'Text/HTML content',
        onClose: () => {
            this.infoModal = undefined;
        }
    });
}
```

### Toast
To use the custom toasts in the map, include the following module. A reference to the created toast is returned.
```javascript
import { Toast } from 'oltb/js/ui-common/ui-toasts/toast';
```

There are four types of toast messages.
```javascript
Toast.info({
    title: 'Info',
    message: 'Item were removed from collection'
});

Toast.warning({
    title: 'Warning',
    message: 'Request took longer than expected'
});

Toast.success({
    title: 'Success',
    message: 'Changes were saved to database'
});

Toast.error({
    title: 'Error',
    message: 'Failed to contact database'
});
```

Another usecase is to only supply the key to the property in the translation file. The toast will now handle fetching of the title and message of the active language. This will also make it possible for the toast to do hot-swapping of the language if it is changed while a toast is displayed.
```javascript
Toast.info({
    i18nKey: 'bookmarkTool.toasts.infos.clearBookmarks'
});
```

Both pre- and post-fix can be added to the text. Example appending quantity to a toast: '4 bookmarks was cleared'.
```javascript
Toast.info({
    prefix: 4,
    i18nKey: 'bookmarkTool.toasts.infos.clearBookmarks'
});
```

Important that the targeted property in the translation-file has a `title` and `message` property as children.
```json
{
    "clearBookmarks": {
        "title": "Cleared",
        "message": "All stored bookmarks was cleared"
    }
}
```

To remove the toast after a specific time (ms), add the `autoremove` property.
```javascript
Toast.success({
    title: 'Success',
    message: 'Changes were saved to database', 
    autoremove: 4000
});
```

To close the toast from the code, store a reference to the toast and then call the remove method. The attribute `clickToRemove` is set to false, this means that the user can't click on the toast to remove it. The `spinner` attribute adds a loading animation to the toast.
```javascript
this.loadingToast = Toast.info({
    title: 'Info',
    message: 'Trying to find your location...', 
    clickToRemove: false,
    spinner: true
});

this.loadingToast.remove();
```

The returned reference to the toast can be used to block further actions while a task is being performed. The `onRemove` callback can be used to release the lock.
```javascript
myLocationToolClick() {
    if(this.loadingToast) {
        return;
    }

    this.loadingToast = Toast.info({
        title: 'Info',
        message: 'Trying to find your location...', 
        clickToRemove: false, 
        spinner: true,
        onRemove: () => {
            this.loadingToast = undefined;
        }
    });
}
```

### Icons
There are two modules for using SVG icons. One is for basic icons and the other one is for Wind Barb icons.

#### Basic Icons
Most of the icons are from [icons.getbootstrap.com](https://icons.getbootstrap.com/). Icons have been added on a as needed basis and far from all icons have been added.
```javascript
import { SvgPaths, getSvgIcon } from 'oltb/js/ui-icons/get-svg-icon';

const icon = getSvgIcon({
    path: SvgPaths.geoMarker.filled,
    class: 'some-class',
    width: 20,
    height: 20,
    fill: '#FFFFFFFF',
    stroke: 'none'
});
```

In general, two version of each icon exists (stroked and filled). Some icons don't have a filled version and some icons have a combination of both stroked and filled, these are called mixed. Where an icon is given as a string the name and version is separated using a period (.) `geoPin.filled`.
```javascript
const name = 'geoPin';                // https://icons.getbootstrap.com/
const version = 'filled';             // stroked | filled | mixed
const path = SvgPaths[name][version]; // The 'getSvgIcon' function wrapps the path with an svg element
```

#### WindBarb Icons
The Wind Barbs are available from 0 to 190 knots (0 to 97.5m/s). To get more information about the Wind Barbs visit my other project [github.com/qulle/svg-wind-barbs](https://github.com/qulle/svg-wind-barbs).
```javascript
import { getSvgWindBarb } from 'oltb/js/ui-icons/get-svg-wind-barb';

const icon = getSvgWindBarb({
    windSpeed: 25,
    width: 250,
    height: 250,
    fill: '#3B4352FF',
    stroke: '#3B4352FF',
    strokeWidth: 3
});
```

### Context Menu
To use the context menu start by importing the following module.
```javascript
import { ContextMenuTool } from 'oltb/js/toolbar-tools/context-menu-tool/context-menu-tool';
```

To create a context menu in the map call the constructor as any other tool.
```javascript
map.addControl(new ContextMenuTool());
```

To add items to the context menu use the static method `ContextMenuTool.addItem` and give a name and icon as well as a function to call when the item is clicked.
```javascript
ContextMenuTool.addItem({
    icon: '<svg>...</svg>', 
    name: 'Zoom home', 
    fn: this.handleResetToHome.bind(this)
});
```

The callback function recieves a references to the map, the clicked coordinates and the target element (the canvas).
```javascript
ContextMenuTool.addItem({
    icon: '<svg>...</svg>', 
    name: 'Clear settings', 
    fn: function(map, coordinates, target) {
        return Dialog.confirm({
            text: 'Do you want to clear all settings?',
            onConfirm: () => {
                localStorage.clear();
            }
        });
    }
});
```

It is not important in what order the menu or its items are added. If no menu exist all menu items will be queued and added once the menu is created.

To insert a separator in the menu add an empty object.
```javascript
ContextMenuTool.addItem({});
```

### State Management
To use state management start by importing the following module.
```javascript
import { StateManager } from 'oltb/js/toolbar-managers/state-manager/state-mananger';
```

State management is done through localStorage under the key `oltb-state`. First add a node name and an object to store default values.
```javascript
const LocalStorageNodeName = LocalStorageKeys.drawTool;
const LocalStorageDefaults = Object.freeze({
    active: false,
    collapsed: false,
    toolType: 'Polygon',
    strokeWidth: '2.5',
    strokeColor: '#4A86B8FF',
    fillColor: '#D7E3FA80'
});
```

Merge the default properties in `LocalStorageDefaults` along with any stored values from localStorage.
```javascript
this.localStorage = StateManager.getAndMergeStateObject(
    LocalStorageNodeName, 
    LocalStorageDefaults
);
```

To update the state in localStorage, call the `setStateObject` method and pass in the node name along with the updated state object.
```javascript
StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
```

### Debug Tool
To make debugging and diagnosting errors easier there is a tool named `DebugInfoTool`. This tool will gather information about the map such as zoomlevel, location, layers, rotation, projection etc and displays the information in a modal window. To hide the debug tool as default, add the parameter `onlyWhenGetParameter: true` to the tools constructor. Then add the get parameter to the url `/?oltb-debug=true` to show the tool. 

Adding the debug parameter will also enable the default context-menu in the browser and will also output information in the console from `html2canvas` when generating a PNG.

### Logging
Logging is done through the `LogManager`. This way all logging is done through one central place and will be outputted in the `DebugInfoModal`. There are five levels to use when logging.
```javascript
LogManager.logDebug(FILENAME, 'handleClick', 'User clicked tool');
LogManager.logInformation(FILENAME, 'onLayerCreated', 'Layer was created');
LogManager.logWarning(FILENAME, 'loadLayer', 'Could not load geojson file');
LogManager.logError(FILENAME, 'saveState', 'Error parsing JSON object');
LogManager.logFatal(FILENAME, 'globalErrorHandler', 'Uncaught error');
```

There is also the possibility to log complex objects insted of plain text.
```javascript
LogManager.logDebug(FILENAME, 'handleClick', {
    info: 'User clicked tool',
    url: 'localhost:1234',
    values: [1, 2, 3, 4]
});
```

### OLTB Namespace
All classes and id:s in the project are prefixed with the namespace `oltb`.

## Colors
The project's Theme colors and the full color palette are described below.

### Theme Colors
The Toolbar is available in both `light` and `dark` mode. I have decided to go for a small set of colors in both themes. This enables for a solid look-and-feel and association between colors and functionality. The `mid` color is to consider as the default normal color. For some situations the `light` and `dark` color is used in the normal state.
<table>
    <tr>
        <th>Blue</th>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/blue-100.svg"> #F0F6FF - $color-blue-100</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/blue-200.svg"> #D7E3FA - $color-blue-200</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/blue-300.svg"> #6397C2 - $color-blue-300</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/blue-400.svg"> #0166A5 - $color-blue-400</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/blue-500.svg"> #00385B - $color-blue-500</td>
    </tr>
    <tr>
        <th>Green</th>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/green-100.svg"> #DFFFFC - $color-green-100</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/green-200.svg"> #BCFAF4 - $color-green-200</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/green-300.svg"> #3CAEA3 - $color-green-300</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/green-400.svg"> #007C70 - $color-green-400</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/green-500.svg"> #004942 - $color-green-500</td>
    </tr>
    <tr>
        <th>Gray</th>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/gray-100.svg"> #F3F4F5 - $color-gray-100</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/gray-200.svg"> #D3D9E6 - $color-gray-200</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/gray-300.svg"> #959DAD - $color-gray-300</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/gray-400.svg"> #364159 - $color-gray-400</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/gray-500.svg"> #191E29 - $color-gray-500</td>
    </tr>
</table>

### Color Palette
The full color palette is displayed below.
<table>
    <tr>
        <th>Blue</th>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/blue-100.svg"> #F0F6FF - $color-blue-100</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/blue-200.svg"> #D7E3FA - $color-blue-200</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/blue-300.svg"> #6397C2 - $color-blue-300</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/blue-400.svg"> #0166A5 - $color-blue-400</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/blue-500.svg"> #00385B - $color-blue-500</td>
    </tr>
    <tr>
        <th>Indigo</th>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/indigo-100.svg"> #E7EFFF - $color-indigo-100</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/indigo-200.svg"> #C7D9F8 - $color-indigo-200</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/indigo-300.svg"> #5B88D6 - $color-indigo-300</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/indigo-400.svg"> #2357B1 - $color-indigo-400</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/indigo-500.svg"> #103677 - $color-indigo-500</td>
    </tr>
    <tr>
        <th>Purple</th>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/purple-100.svg"> #E8E6FF - $color-purple-100</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/purple-200.svg"> #D0CAFF - $color-purple-200</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/purple-300.svg"> #9085E4 - $color-purple-300</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/purple-400.svg"> #52489B - $color-purple-400</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/purple-500.svg"> #2E2769 - $color-purple-500</td>
    </tr>
    <tr>
        <th>Pink</th>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/pink-100.svg"> #FEEDFF - $color-pink-100</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/pink-200.svg"> #FEE6FF - $color-pink-200</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/pink-300.svg"> #E8A2EA - $color-pink-300</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/pink-400.svg"> #914594 - $color-pink-400</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/pink-500.svg"> #59275A - $color-pink-500</td>
    </tr>
    <tr>
        <th>Teal</th>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/teal-100.svg"> #DDFEFF - $color-teal-100</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/teal-200.svg"> #BCF8FA - $color-teal-200</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/teal-300.svg"> #56BABD - $color-teal-300</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/teal-400.svg"> #00959A - $color-teal-400</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/teal-500.svg"> #005255 - $color-teal-500</td>
    </tr>
    <tr>
        <th>Green</th>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/green-100.svg"> #DFFFFC - $color-green-100</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/green-200.svg"> #BCFAF4 - $color-green-200</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/green-300.svg"> #3CAEA3 - $color-green-300</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/green-400.svg"> #007C70 - $color-green-400</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/green-500.svg"> #004942 - $color-green-500</td>
    </tr>
    <tr>
        <th>Cyan</th>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/cyan-100.svg"> #E0F4FF - $color-cyan-100</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/cyan-200.svg"> #CEEEFF - $color-cyan-200</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/cyan-300.svg"> #68B9E5 - $color-cyan-300</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/cyan-400.svg"> #0080C5 - $color-cyan-400</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/cyan-500.svg"> #004367 - $color-cyan-500</td>
    </tr>
    <tr>
        <th>Yellow</th>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/yellow-100.svg"> #FFF8E1 - $color-yellow-100</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/yellow-200.svg"> #FAE59D - $color-yellow-200</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/yellow-300.svg"> #F6D574 - $color-yellow-300</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/yellow-400.svg"> #FBBD02 - $color-yellow-400</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/yellow-500.svg"> #493B10 - $color-yellow-500</td>
    </tr>
    <tr>
        <th>Orange</th>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/orange-100.svg"> #FFEDDB - $color-orange-100</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/orange-200.svg"> #FFDDBC - $color-orange-200</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/orange-300.svg"> #FCBE80 - $color-orange-300</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/orange-400.svg"> #F08741 - $color-orange-400</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/orange-500.svg"> #6B310A - $color-orange-500</td>
    </tr>
    <tr>
        <th>Red</th>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/red-100.svg"> #FFE6E6 - $color-red-100</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/red-200.svg"> #FDB5B4 - $color-red-200</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/red-300.svg"> #E96B69 - $color-red-300</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/red-400.svg"> #D64B49 - $color-red-400</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/red-500.svg"> #8D2120 - $color-red-500</td>
    </tr>
    <tr>
        <th>Gray</th>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/gray-100.svg"> #F3F4F5 - $color-gray-100</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/gray-200.svg"> #D3D9E6 - $color-gray-200</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/gray-300.svg"> #959DAD - $color-gray-300</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/gray-400.svg"> #3B4352 - $color-gray-400</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/gray-500.svg"> #212529 - $color-gray-500</td>
    </tr>
</table>

## Dependencies
1. [OpenLayers 10.6.1](https://openlayers.org/en/v10.6.1/apidoc/)
2. [Proj4 2.15.0](http://proj4js.org/)   
3. [Tippy.js 6.3.7](https://atomiks.github.io/tippyjs/)
4. [Bootstrap Icons](https://icons.getbootstrap.com/)
5. [Moment 2.30.1](https://momentjs.com/)
6. [A Color Picker 1.2.1](https://github.com/narsenico/a-color-picker)
7. [Plain JS Slidetoggle 2.0.0](https://github.com/ericbutler555/plain-js-slidetoggle)
8. [JSTS 2.12.1](https://github.com/bjornharrtell/jsts)
9. [Cycle.js](https://github.com/douglascrockford/JSON-js)
10. [Browser Dtector 4.1.0](https://github.com/sibiraj-s/browser-dtector)
11. [Sortable JS 1.15.6](https://github.com/SortableJS/Sortable)
12. [UUID JS 11.1.0](https://github.com/uuidjs/uuid)
13. [Lodash 4.17.21](https://github.com/lodash/lodash)
14. [Many Keys Map 2.0.1](https://github.com/fregante/many-keys-map)
15. [Axios 1.8.4](https://github.com/axios/axios)

## Dev Dependencies
1. [Parcel 2.14.4](https://parceljs.org/)
2. [@parcel/transformer-sass 2.14.4](https://github.com/parcel-bundler/parcel)
3. [Rollup 4.39.0](https://github.com/rollup/rollup)
4. [@rollup/plugin-commonjs 28.0.3](https://github.com/rollup/plugins/tree/master/packages/commonjs)
5. [@rollup/plugin-json 6.1.0](https://github.com/rollup/plugins/tree/master/packages/json)
6. [@rollup/plugin-node-resolve 16.0.1](https://github.com/rollup/plugins/tree/master/packages/node-resolve)
7. [@rollup-plugin-replace 6.0.2](https://github.com/rollup/plugins/tree/master/packages/replace)
8. [@rollup/plugin-terser 0.4.4](https://github.com/rollup/plugins/tree/master/packages/terser)
9. [rollup-plugin-license 3.6.0](https://github.com/mjeanroy/rollup-plugin-license)
10. [rollup-plugin-scss 4.0.1](https://github.com/thgh/rollup-plugin-scss)
11. [ESLint 9.24.0](https://github.com/eslint/eslint)
12. [Husky 9.1.7](https://github.com/typicode/husky)
13. [Lint Staged 15.5.0](https://github.com/lint-staged/lint-staged)
14. [Jest 29.7.0](https://github.com/jestjs/jest)
15. [Jest Environment JSDOM 29.7.0](https://github.com/jestjs/jest)
16. [Identity Obj Proxy 3.0.0](https://github.com/keyz/identity-obj-proxy)
17. [Cross Env 7.0.3](https://github.com/kentcdodds/cross-env)

## Maps
1. [Open Street Map](https://www.openstreetmap.org/)
2. [ArcGIS World Topo](https://www.arcgis.com/index.html)

## License
[BSD-2-Clause License](https://github.com/qulle/oltb/blob/main/LICENSE)

## Making A Release
```bash
# (1). Checkout and update main branch
$ git checkout main
$ git pull

# (2). Run tests
# Update test coverage shield in README.md with line coverage
$ npm run test
$ npm run test:coverage

# (3). Clean old data
$ npm run clean

# (4). Update oltb and ol version in: 
#      - package.json
#      - package-lock.json
#      - README.md
#          - Text
#          - CDN-links
#          - Version table 

# (5). Update version, date and dependencies in:
#      - rollup.cssbanner.mjs
#      - rollup.jsbanner.mjs

# (6). Create new dist
$ bash build-scripts/npm-dist.sh

# (7). Clean package.json in dist:
#      - repository
#      - scripts
#      - lint-staged
#      - files
#      - devDependencies

# (8). Setup examples
$ bash build-scripts/dist-examples-setup.sh

# (9). Manually update examples:
#      - NPM x 2
#      - CDN (also bump ol CDN-links in index.html)
#      - Angular (bump oltb version)
#      - React (bump oltb version)

# (10). Verify examples
$ npm run example:cdn:1
$ npm run example:npm:1
$ npm run example:npm:2

# (11). Cleanup examples
$ bash build-scripts/dist-examples-cleanup.sh

# (12). Publish package to NPM
$ bash build-scripts/npm-publish.sh

# (13). Commit and push updated examples to GitHub
$ git add .
$ git commit -m "New release vx.y.z"
$ git push

# (14). Create new demo, this will build the GitHub demo using the NPM version
$ bash build-scripts/github-demo.sh

# (15). Commit and push demo to GitHub
$ git push origin --delete gh-pages
$ git add demo -f
$ git commit -m "gh-pages demo release vx.y.z"
$ git subtree push --prefix demo origin gh-pages

# (16). Verify new demo
# https://qulle.github.io/oltb/

# (17). Clean temp demo commit
$ git reset --hard HEAD~1

# (18). Tag the release
$ git tag -a vx.y.z -m "vx.y.z"
$ git push origin --tags

# (19). Update the translation-repo with the <ab-cd>.json files for this release.
# https://github.com/qulle/oltb-language-files
```

## Update Dependencies
Check for dependency updates
```
$ npm outdated
```

Install dependency updates
```
$ npm update --save
```

Check for dependency security issues
```
$ npm audit
```

**Note:** that from npm version `7.0.0` the command `$ npm update` does not longer update the package.json file. From npm version `8.3.2` the command to run is `$ npm update --save` or to always apply the save option add `save=true` to the `.npmrc` file.

## Author
[Qulle](https://github.com/qulle/)