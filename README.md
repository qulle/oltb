# OpenLayers Toolbar - OLTB
### Lightweight GIS toolbar developed for OpenLayers 7.1.0. The toolbar can be filled with any number of tools and can be used in both horizontal and vertical mode and is available in both light and dark theme.

## Latest build - [Demo](https://qulle.github.io/oltb/)
The latest build is built using the last official release `v1.0.0-beta2` but may contain more features that have been added since then. Check the releases tab or the commit tags for specific versions.

## Screenshots
A picture says more than a thousand words, but the demo above says it all.

### Light theme
![Screenshot Light Theme](images/demo-light.png?raw=true "Screenshot Light Theme")

### Dark theme
![Screenshot Dark Theme](images/demo-dark.png?raw=true "Screenshot Dark Theme")

## Table of contents
1. [Branches](#branches)
2. [Request new Feature or report a Bug](#request-new-feature-or-report-a-bug)
3. [Get started](#get-started)
4. [Browser support](#browser-support)
5. [Architecture model](#architecture-model)
6. [Colors](#colors) 
    1. [Theme colors](#theme-colors)
    2. [Color palette](#color-palette)
8. [About the code](#about-the-code)
    1. [HTML](#html)
    2. [SCSS](#scss)
    3. [JavaScript](#javascript)
    4. [Callback functions and constructor parameters](#callback-functions-and-constructor-parameters)
    5. [Store data locally instead of via API](#store-data-locally-instead-of-via-api)
    6. [Hidden tools](#hidden-tools)
    7. [Shortcut keys](#shortcut-keys)
    8. [Custom projections](#custom-projections)
    9. [Layers](#layers)
    10. [Dialogs](#dialogs)
        1. [Alert](#alert)
        2. [Confirm](#confirm)
        3. [Prompt](#prompt)
    11. [Modal](#modal)
    12. [Toast](#toast)
    13. [Icons](#icons)
        1. [Basic icons](#basic-icons)
        2. [Windbarb icons](#windbarb-icons)
    14. [Context menu](#context-menu)
    15. [State Management](#state-management)
    16. [Debug tool](#debug-tool)
    17. [OLTB namespace](#oltb-namespace)
9. [External GitHub projects](#external-github-projects)
10. [Maps used in the demo](#maps-used-in-the-demo)
11. [License](#license)
12. [Author](#author)

## Branches
The `main` branch always holds the latest features that are considered done. The latest commit from the main branch is available on the demo-page hosted on the `gh-pages` branch.

Use a descriptive prefix to categorize the intent with each created branch:
- `bug/exception-editing-marker`
- `feature/new-format-to-layer-export`
- `documentation/updating-browser-support-list`
- `refactoring/updating-ol-version`

## Request new Feature or report a Bug
If you want to request a new Feature or report a Bug in the latest release on the `main` branch start by:

1. Check if the feature/bug exists on the latest commit on the `main` branch.
2. Check if there is an open issue.
3. If no issue is open, please create one and tag **@qulle**.

Use the existing `labels` to tag your issue.

## Get started
The dev-environment uses NPM so you need to have [Node.js](https://nodejs.org/en/) installed. I use Node version *16.16.0* and NPM version *8.16.0*.

Clone the repo.
```
$ git clone https://github.com/qulle/oltb.git
```

Install all dependencies from package.json.
```
$ npm install
```

Start the [Parcel](https://parceljs.org/) server.
```
$ npm start
```

Make build for distribution.
```
$ npm run build
```

Use the following command to remove dist directory. Uses `rm -rf dist/ .parcel-cache/`
```
$ npm run clean
```

Check for dependency updates.
```
$ npm outdated
```

Install dependency updates.
```
$ npm update --save
```

**Note** that from npm version `7.0.0` the command `$ npm update` does not longer update the `package.json` file. From npm version `8.3.2` the command to run is `$ npm update --save` or to always apply the save option add `save=true` to the `.npmrc` file.

## Browser support 
Manually tested in modern browsers (Mozilla Firefox, Microsoft Edge, Google Chrome).

_IE is not supported, it's time to move on._

## Architecture model
![Architecture model](images/architecture.svg?raw=true "Architecture model")
Model showing my intentions of how an application could be built to keep the responsibility of each part separated and not end up with application specific code inside the toolbar.

## Colors
The project's Theme colors and the full color palette are described below.

### Theme colors
The toolbar is awailable in both `light` and `dark` mode. I have decided to go for a small set of colors in both themes. This enables for a solid look-and-feel and association between colors and functionality. The `mid` color is to consider as the default normal color. For some situations the `light` and `dark` color is used in the normal state.
<table>
    <tr>
        <th>Blue</th>
        <td><img valign="middle" src="./images/colors/blue-light.svg"> #D7E3FA - $color-blue-light</td>
        <td><img valign="middle" src="./images/colors/blue-mid.svg"> #6397C2 - $color-blue-mid</td>
        <td><img valign="middle" src="./images/colors/blue-dark.svg"> #0166A5 - $color-blue-dark</td>
    </tr>
    <tr>
        <th>Green</th>
        <td><img valign="middle" src="./images/colors/green-light.svg"> #BCFAF4 - $color-green-light</td>
        <td><img valign="middle" src="./images/colors/green-mid.svg"> #3CAEA3 - $color-green-mid</td>
        <td><img valign="middle" src="./images/colors/green-dark.svg"> #007C70 - $color-green-dark</td>
    </tr>
    <tr>
        <th>Gray</th>
        <td><img valign="middle" src="./images/colors/gray-light.svg"> #D3D9E6 - $color-gray-light</td>
        <td><img valign="middle" src="./images/colors/gray-mid.svg"> #959DAD - $color-gray-mid</td>
        <td><img valign="middle" src="./images/colors/gray-dark.svg"> #3B4352 - $color-gray-dark</td>
    </tr>
</table>

### Color palette
The full color palette is displayed below.
<table>
    <tr>
        <th>Blue</th>
        <td><img valign="middle" src="./images/colors/blue-light.svg"> #D7E3FA - $color-blue-light</td>
        <td><img valign="middle" src="./images/colors/blue-mid.svg"> #6397C2 - $color-blue-mid</td>
        <td><img valign="middle" src="./images/colors/blue-dark.svg"> #0166A5 - $color-blue-dark</td>
    </tr>
    <tr>
        <th>Green</th>
        <td><img valign="middle" src="./images/colors/green-light.svg"> #BCFAF4 - $color-green-light</td>
        <td><img valign="middle" src="./images/colors/green-mid.svg"> #3CAEA3 - $color-green-mid</td>
        <td><img valign="middle" src="./images/colors/green-dark.svg"> #007C70 - $color-green-dark</td>
    </tr>
    <tr>
        <th>Yellow</th>
        <td><img valign="middle" src="./images/colors/yellow-light.svg"> #FFF1C5 - $color-yellow-light</td>
        <td><img valign="middle" src="./images/colors/yellow-mid.svg"> #FBDD83 - $color-yellow-mid</td>
        <td><img valign="middle" src="./images/colors/yellow-dark.svg"> #FBBD02 - $color-yellow-dark</td>
    </tr>
    <tr>
        <th>Orange</th>
        <td><img valign="middle" src="./images/colors/orange-light.svg"> #FFDDBC - $color-orange-light</td>
        <td><img valign="middle" src="./images/colors/orange-mid.svg"> #FCBE80 - $color-orange-mid</td>
        <td><img valign="middle" src="./images/colors/orange-dark.svg"> #F67D2C - $color-orange-dark</td>
    </tr>
    <tr>
        <th>Red</th>
        <td><img valign="middle" src="./images/colors/red-light.svg"> #FDB5B4 - $color-red-light</td>
        <td><img valign="middle" src="./images/colors/red-mid.svg"> #E96B69 - $color-red-mid</td>
        <td><img valign="middle" src="./images/colors/red-dark.svg"> #EB4542 - $color-red-dark</td>
    </tr>
    <tr>
        <th>Gray</th>
        <td><img valign="middle" src="./images/colors/gray-light.svg"> #D3D9E6 - $color-gray-light</td>
        <td><img valign="middle" src="./images/colors/gray-mid.svg"> #959DAD - $color-gray-mid</td>
        <td><img valign="middle" src="./images/colors/gray-dark.svg"> #3B4352 - $color-gray-dark</td>
    </tr>
</table>

## About the code
Below is the basic HTML and JavaScript structure used in the project. For a complete example of how to set up the code go to `map.js` in the `src/js` directory. 

### HTML
```HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, user-scalable=0" />
    <link rel="stylesheet" href="./scss/map.scss">
    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
    <title>OLTB - Toolbar for OpenLayers</title>
</head>
<body>
    <div id="oltb"></div>

    <div id="map" tabindex="0"></div>

    <script type="module" src="./js/map.js"></script>
</body>
</html>
```

The toolbar is vertical by default, add class `row` to change direction. The user can change the direction using the tool `DirectionToggle`
```HTML
<div id="oltb" class="row"></div>
```

The toolbar theme is light by default, add class `dark` to change theme. The user can change the theme using the tool `ThemeToggle`
```HTML
<div id="oltb" class="dark"></div>
```

### SCSS
SCSS and HTML is written with [BEM](http://getbem.com/introduction/) (ish) naming convention.
```css
.block {}
.block__element {}
.block__element--modifier {}
```

### JavaScript
The JavaScript tool-buttons are located in the `src/js/modules/tools` directory. Every tool has its own class and extend the Control-class from OpenLayers.
```javascript
class Coordinates extends Control {}
```

When using the custom tools, all that is needed is to import the module(s) you want to have in your toolbar
```javascript
import HiddenMarkerTool from './modules/tools/hidden-tools/MarkerTool';
import HiddenMapNavigationTool from './modules/tools/hidden-tools/MapNavigationTool';
import HomeTool from './modules/tools/HomeTool';
import ZoomInTool from './modules/tools/ZoomInTool';
import ZoomOutTool from './modules/tools/ZoomOutTool';
import FullScreenTool from './modules/tools/FullScreenTool';
import ExportPNGTool from './modules/tools/ExportPNGTool';
import DrawTool from './modules/tools/DrawTool';
import MeasureTool from './modules/tools/MeasureTool';
import EditTool from './modules/tools/EditTool';
import BookmarkTool from './modules/tools/BookmarkTool';
import LayerTool from './modules/tools/LayerTool';
import SplitViewTool from './modules/tools/SplitViewTool';
import OverviewTool from './modules/tools/OverviewTool';
import GraticuleTool from './modules/tools/GraticuleTool';
import MagnifyTool from './modules/tools/MagnifyTool';
import ResetNorthTool from './modules/tools/ResetNorthTool';
import CoordinatesTool from './modules/tools/CoordinatesTool';
import MyLocationTool from './modules/tools/MyLocationTool';
import ImportVectorLayerTool from './modules/tools/ImportVectorLayerTool';
import ScaleLineTool from './modules/tools/ScaleLineTool';
import RefreshTool from './modules/tools/RefreshTool';
import ThemeTool from './modules/tools/ThemeTool';
import DirectionTool from './modules/tools/DirectionTool';
import InfoTool from './modules/tools/InfoTool';
import NotificationTool from './modules/tools/NotificationTool';
import HelpTool from './modules/tools/HelpTool';
import SettingsTool from './modules/tools/SettingsTool';
import DebugInfoTool from './modules/tools/DebugInfoTool';
import HiddenAboutTool from './modules/tools/hidden-tools/AboutTool';
```

and then calling the constructor in the array inside the extend method. The tools are added to the toolbar in the order you include them in this array.
```javascript
controls: defaultControls({
    zoom: false, 
    rotate: false, 
    attribution: SettingsManager.getSetting('show.attributions')
}).extend([
    new HiddenMarkerTool(),
    new HiddenMapNavigationTool(),
    new HomeTool(),
    new ZoomInTool(),
    new ZoomOutTool(),
    new FullScreenTool(),
    new ExportPNGTool(),
    new DrawTool(),
    new MeasureTool(),
    new EditTool(),
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
    new InfoTool(),
    new NotificationTool(),
    new HelpTool(),
    new SettingsTool(),
    new DebugInfoTool()
    new HiddenAboutTool()
])
```

### Callback functions and constructor parameters
Tools that in any way change the map, create, modify or delete objects have several different callback functions that return data to you. All tools in the main toolbar have at least one callback that is named `click`.
```javascript
controls: defaultControls({
    zoom: false, 
    rotate: false, 
    attribution: SettingsManager.getSetting('show.attributions')
}).extend([
    new HiddenMarkerTool({
        added: function(marker) {
                console.log('Marker added', marker);
        },
        removed: function(marker) {
            console.log('Marker removed', marker);
        },
        edited: function(before, after) {
            console.log('Marker edited', before, after);
        }
    }),
    new HiddenMapNavigationTool({
        focusZoom: 10
    }),
    new HomeTool({
        lon: 25.5809,
        lat: 23.7588,
        zoom: 3,
        click: function() {
            console.log('HomeTool click');
        },
        home: function() {
            console.log('Map zoomed home');
        }
    }),
    new ZoomInTool({
        click: function() {
            console.log('ZoomInTool clicked');
        },
        zoomed: function() {
            console.log('Zoomed in');
        }
    }),
    new ZoomOutTool({
        click: function() {
            console.log('ZoomOutTool clicked');
        },
        zoomed: function() {
            console.log('Zoomed out');
        }
    }),
    new FullScreenTool({
        click: function() {
            console.log('FullScreenTool clicked');
        },
        enter: function(event) {
            console.log('Enter fullscreen mode', event);
        },
        leave: function(event) {
            console.log('Leave fullscreen mode', event);
        }
    }),
    new ExportPNGTool({
        click: function() {
            console.log('ExportPNGTool clicked');
        },
        exported: function() {
            console.log('Map exported as png');
        }
    }),
    new DrawTool({
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
    }),
    new MeasureTool({
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
    }),
    new EditTool({
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
    }),
    new BookmarkTool({
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
    }),
    new LayerTool({
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
    }),
    new SplitViewTool({
        click: function() {
            console.log('SplitViewTool clicked');
        }
    }),
    new OverviewTool({
        click: function() {
            console.log('OverviewTool clicked');
        }
    }),
    new GraticuleTool({
        color: 'rgba(59, 67, 82, 0.9)',
        dashed: true,
        width: 2,
        showLabels: true,
        wrapX: true,
        click: function() {
            console.log('GraticuleTool clicked');
        }
    }),
    new MagnifyTool({
        click: function() {
            console.log('MagnifyTool clicked');
        }
    }),
    new ResetNorthTool({
        click: function() {
            console.log('ResetNorthTool clicked');
        },
        reset: function() {
            console.log('Map north reset');
        }
    }),
    new CoordinatesTool({
        click: function() {
            console.log('CoordinatesTool clicked');
        },
        mapClicked: function(coordinates) {
            console.log('You clicked at', coordinates);
        }
    }),
    new MyLocationTool({
        enableHighAccuracy: true,
        timeout: 10000,
        click: function() {
            console.log('MyLocationTool clicked');
        },
        location: function(location) {
            console.log('Location', location);
        },
        error: function(error) {
            console.log('Location error', error);
        }
    }),
    new ImportVectorLayerTool({
        click: function() {
            console.log('ImportVectorLayerTool clicked');
        },
        imported: function(features) {
            console.log('Imported', features);
        },
        error: function(filename, error) {
            console.log('Error when importing file:', filename, error);
        }
    }),
    new ScaleLineTool({
        units: 'metric',
        click: function() {
            console.log('ScaleLineTool clicked');
        }
    }),
    new RefreshTool({
        click: function() {
            console.log('RefreshTool clicked');
        }
    }),
    new ThemeTool({
        click: function() {
            console.log('ThemeTool clicked');
        },
        changed: function(theme) {
            console.log('Theme changed to', theme);
        }
    }),
    new DirectionTool({
        click: function() {
            console.log('DirectionTool clicked');
        },
        changed: function(direction) {
            console.log('Direction changed to', direction);
        }
    }),
    new InfoTool({
        title: 'Hey!', 
        content: '<p>This is a <em>modal window</em>, here you can place some text about your application or links to external resources.</p>',
        click: function() {
            console.log('InfoTool clicked');
        }
    }),
    new NotificationTool({
        click: function() {
            console.log('NotificationTool clicked');
        }
    }),
    new HelpTool({
        url: 'https://github.com/qulle/oltb',
        target: '_blank',
        click: function() {
            console.log('HelpTool clicked');
        }
    }),
    new SettingsTool({
        click: function() {
            console.log('SettingsTool clicked');
        },
        cleared: function() {
            console.log('Settings cleared');
        }
    }),
    new DebugInfoTool({
        click: function() {
            console.log('DebugInfoTool clicked');
        }
    }),
    new HiddenAboutTool(),
    new ContextMenu({
        name: CONTEXT_MENUS.MainMap, 
        selector: '#map canvas'
    })
])
```

### Store data locally instead of via API
Tools that create objects at runtime, for example the BookmarkTool, LayerTool etc. returns data via the callback functions. There is also the possibility for these tools to store the created objects in localStorage instead. This is done by setting the constructor parameter `storeDataInLocalStorage: true`. This can be useful if you want to create a map-viewer that can persists data between page load but have no need for an additionall long-term storage via API. 

**Note** At the moment only the BookmarkTool has this feature fully implemented. The Map also stores base data (zoom, lon, lat) in localStorage. You can read more about the State Management [here](#state-management). 

### Hidden tools
Tools refered to as hidden tools are tools that only add functionality via the context menu. The hidden tools are used to enable the same type of callback functions in the constructor as every other tool. 

### Shortcut keys
All tools have a shortcut key for ease of use and speeds up the handling of the toolbar and map. The shortcut key is displayed in the tooltip on the corresponding tool. All shortcut keys are stored in the module `./modules/helpers/Constants/ShortcutKeys`.
```javascript
const SHORTCUT_KEYS = {
    AreaOverview: 'A',
    Bookmark: 'B',
    Coordinates: 'C'
    ...
};
```

### Custom projections
You can define custom projections in the file `./modules/epsg/Projections`. This file is registrated in `proj4.js` and the projections can be used throughout the project. If you want to change the default projection used, there is a general config module `./modules/core/Config` where you can change that. More projections can be fetched here [https://epsg.io/](https://epsg.io/).

### Layers
Layers are added to the map using the `LayerManager`. The manager handels internal functionality and fires of events that the layer-tool captures to create the UI.

Layers can be added at any time during the applications lifetime. If the map is not ready to recieve a layer the manager will queue the layer and add it to the map once the manager is initiated with a reference to the map.

There are two types of layers, `map`- and `feature`-layers. Create layers using a separate file that is included in the `map.js` file. Exampels of adding different types of layers and attach infowindows can be found at the following location.
```js
import './modules/layers/Maps';
import './modules/layers/Countries';
import './modules/layers/Continents';
import './modules/layers/Wind';
import './modules/layers/Capitals';
```

### Dialogs
To use the custom dialogs in the map, include the following module. All the dialogs uses trap focus and circles the tab-key to always stay in the opened dialog.
```javascript
import Dialog from './modules/common/Dialog';
```

#### Alert
```javascript
Dialog.alert({text: 'This is a custom alert message'});
```
To change the text in the button, add the property `confirmText: 'Your text'`.

#### Confirm
```javascript
Dialog.confirm({
    text: 'Do you want to delete this layer?',
    onConfirm: function() {
        console.log('Confirm button clicked');
    },
    onCancel: function() {
        console.log('Cancel button clicked');
    }
});
```

To have a `success` confirm dialog, add the property `confirmClass: Dialog.Success`. To change the text of the confirm button, add the property `confirmText: 'Your text'`.

#### Prompt
```javascript
Dialog.prompt({
    text: 'Change name of layer',
    value: 'Current name',
    onConfirm: function(result) {
        console.log(result);
    },
    onCancel: function() {
        console.log('Cancel button clicked');
    }
});
```
To have a `danger` prompt dialog, add the property `confirmClass: Dialog.Danger`. To change the text of the confirm button, add the property `confirmText: 'Your text'`.

The dialogs could be extended with more options, but i want to keep the configuration as simple as possible.

### Modal
To use the custom modal in the map, include the following module.
```javascript
import Modal from './modules/common/Modal';
```

The modal uses the trap focus to circle the tab-key.
```javascript
Modal.create({
    title: 'Title', 
    content: 'Text/HTML content'
});
```

A reference to the created modal is returned from the create function. This can be used to block the creation of a second modal if a button is pressed again. The onClose callback can be used to release the lock.
```javascript
infoToolClick() {
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
To use the custom toasts in the map, include the following module.
```javascript
import Toast from './modules/common/Toast';
```

There are four types of toast messages.
```javascript
Toast.info({text: 'Item were removed from collection'});
Toast.warning({text: 'Request took longer than expected'});
Toast.success({text: 'Changes were saved to database'});
Toast.error({text: 'Failed to contact database'});
```

To remove the toast after a specific time (ms), add the `autoremove` property.
```javascript
Toast.success({
    text: 'Changes were saved to database', 
    autoremove: 4000
});
```

To close the toast from the code, store a reference to the toast and then call the remove method. The attribute `clickToRemove` is set to false, this means that the user can't click on the toast to remove it. The `spinner` attribute adds a loading animation to the toast.
```javascript
this.loadingToast = Toast.info({
    text: 'Trying to find your location...', 
    clickToRemove: false,
    spinner: true,
});

this.loadingToast.remove();
```

The returned reference to the toast can be used to block further actions while a task is being performed. The onRemove callback can be used to release the lock.
```javascript
myLocationToolClick() {
    if(this.loadingToast) {
        return;
    }

    this.loadingToast = Toast.info({
        text: 'Trying to find your location...', 
        clickToRemove: false, 
        spinner: true,
        onRemove: () => {
            this.loadingToast = undefined;
        }
    });
}
```

### Icons
There are two modules for using SVG icons. One is for basic icons and the other one is for windbarb icons.

#### Basic icons
Most of the icons are from the excellent [icons.getbootstrap.com](https://icons.getbootstrap.com/). Icons have been added on a as needed basis and far from all icons have been added.
```javascript
import { getIcon, SVG_PATHS } from './modules/core/SVGIcons';

const icon = getIcon({
    path: SVG_PATHS.GeoMarkerFilled,
    class: 'some-class',
    width: 20,
    height: 20,
    fill: 'rgb(255, 255, 255)',
    stroke: 'none'
});
```

#### Windbarb icons
The windbarbs are available from 0 to 190 knots (0 to 97.5m/s). To get more information about the windbarbs visit my other project [github.com/qulle/svg-wind-barbs](https://github.com/qulle/svg-wind-barbs).
```javascript
import { getWindBarb } from './modules/core/SVGWindbarbs';

const icon = getWindBarb({
    windSpeed: 25,
    width: 250,
    height: 250,
    fill: 'rgb(59, 67, 82)',
    stroke: 'rgb(59, 67, 82)',
    strokeWidth: 3
});
```

### Context menu
To use the context menu start by importing the following module.
```javascript
import ContextMenu from './modules/common/ContextMenu';
```

To create a context menu call the constructor and give a unique name as the first argument and a selector to trigger the menu. The context menu class extends the Control class from OpenLayers.
```javascript
map.addControl(new ContextMenu({
    name: CONTEXT_MENUS.MainMap, 
    selector: '#map canvas'
});
```

There is a module for storing context menu names located in `./modules/helpers/Constants/ContextMenus`.
```javascript
const CONTEXT_MENUS = {
    MainMap: 'main.map.context.menu'
};
```

To add items to the context menu use the function `addContextMenuItem` and give the name that matches the context menu aswell as the name/label of the item, the icon and a function to call when the item is clicked.
```javascript
addContextMenuItem(CONTEXT_MENUS.MainMap, {icon: '<svg>...</svg>', name: 'Zoom home', fn: this.handleResetToHome.bind(this)});
```

The callback function recieves a references to the map, the clicked coordinates and the target element (the canvas).
```javascript
addContextMenuItem(CONTEXT_MENUS.MainMap, {icon: '<svg>...</svg>', name: 'Clear settings', fn: function(map, coordinates, target) {
    Dialog.confirm({
        text: 'Do you want to clear all settings?',
        onConfirm: function() {
            localStorage.clear();
        }
    });
}});
```

It is not important in what order the menu or its items are created. If no menu exist with the given name all menu items will be stored and added once the menu is created.

To insert a separator in the menu add an empty object.
```javascript
addContextMenuItem(CONTEXT_MENUS.MainMap, {});
```

### State Management
To use state management start by importing the following module.
```javascript
import StateManager from './modules/core/managers/StateManager';
```

State management is done through localStorage. First add a node name and an object to store default values.
```javascript
const LOCAL_STORAGE_NODE_NAME = 'drawTool';
const LOCAL_STORAGE_DEFAULTS = {
    active: false,
    collapsed: false,
    toolTypeIndex: 5,
    strokeColor: '#4A86B8',
    strokeWidth: 2,
    fillColor: '#FFFFFF80'
};
```

These two nextcomming lines merges potential stored data into a runtime copy of the default properties located in `LOCAL_STORAGE_DEFAULTS`. The spread operator is a really nice feature for this operation.
```javascript
const localStorageState = JSON.parse(StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME)) || {};
this.localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...localStorageState };
```

To update the state in localStorage, call the `updateStateObject` method and pass in the node name along with the updated state object.
```javascript
StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
```

### Debug tool
To make debugging and diagnosting errors easier there is a tool named `DebugInfo`. This tool will gather information about the map such as zoomlevel, location, layers, rotation, projection etc and displays the information in a modal window. To hide the debug tool as default, add the parameter `showWhenGetParameter: true` and add the get parameter to the url `/?debug=true` to show the tool. Adding the debug parameter will also enable the default context-menu in the browser.

### OLTB namespace
All classes and id:s in the project are prefixed with the namespace `oltb`. Data is also stored in local storage under the key `oltb-state`. 

## External GitHub projects
1. [OpenLayers 7.1.0](https://openlayers.org/en/v7.1.0/apidoc/)
2. [Parcel 2.7.0](https://parceljs.org/)
3. [Tippy.js 6.3.7](https://atomiks.github.io/tippyjs/)
4. [Bootstrap Icons](https://icons.getbootstrap.com/)
5. [A Color Picker 1.2.1](https://github.com/narsenico/a-color-picker)
6. [Plain JS Slidetoggle 2.0.0](https://github.com/ericbutler555/plain-js-slidetoggle)
7. [JSTS 2.9.2](https://github.com/bjornharrtell/jsts)

## Maps used in the demo
1. [OpenStreetMap](https://www.openstreetmap.org/)
2. [Maps.Stamen.Com](http://maps.stamen.com/)
3. [ArcGIS World Topo](https://www.arcgis.com/index.html)

## License
[BSD-2-Clause License](LICENSE)

## Author
[Qulle](https://github.com/qulle/)