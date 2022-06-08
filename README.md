# OpenLayers Toolbar - OLTB
### Lightweight GIS toolbar developed for OpenLayers 6.14.1. The toolbar can be filled with any number of tools and can be used in both horizontal and vertical mode and is available in both light and dark theme.

## Current version 1.0.0-beta2 - [Demo](https://qulle.github.io/oltb/)

## Screenshots
A picture says more than a thousand words, but the demo above says it all.

### Light theme
![Screenshot Light Theme](images/demo-light.png?raw=true "Screenshot Light Theme")

### Dark theme
![Screenshot Dark Theme](images/demo-dark.png?raw=true "Screenshot Dark Theme")

## Table of contents
1. [Branches](#branches)
2. [Report a bug](#report-a-bug)
3. [Request a new feature](#request-a-new-feature)
4. [Get started](#get-started)
5. [Browser support](#browser-support)
6. [Architecture model](#architecture-model)
7. [Colors](#colors) 
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
    9. [Dialogs](#dialogs)
        1. [Alert](#alert)
        2. [Confirm](#confirm)
        3. [Prompt](#prompt)
    10. [Modal](#modal)
    11. [Toast](#toast)
    12. [Context menu](#context-menu)
    13. [State Management](#state-management)
    14. [Debug tool](#debug-tool)
    15. [OLTB namespace](#oltb-namespace)
9. [External GitHub projects](#external-github-projects)
10. [Maps used in the demo](#maps-used-in-the-demo)
11. [License](#license)
12. [Author](#author)

## Branches
There are two branches in the repository. The `main` branch which contains the releases and the `develop` branch which also contains all upcomming commits for the next release. So if you want to test the latest features go checkout the `develop` branch. The `gh-pages` branch is just for the latest build from the main branch that hosts the demo-page.

## Report a bug
If you find a bug in the latest release on the `main` branch start by:

1. Check if the bug exists on the `develop` branch.
2. Check if there is an open issue.
3. If no issue is open, please create one and tag **@qulle**.

Use the existing `labels` to tag your issue.

## Request a new feature
If you are missing a feature in the latest release on the `main` branch start by:

1. Check if the feature already has been implemented on the `develop` branch.
2. Check if there is an open request in the issue tracker.
3. If no request is open, please create one and tag **@qulle**.

Use the existing `labels` to tag your request.

## Get started
The dev-environment uses NPM so you need to have [Node.js](https://nodejs.org/en/) installed. I use Node version *16.14.2* and NPM version *8.7.0*.

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

Use the following command to remove dist directory. Uses `rm -rf dist/`
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
Manually tested in modern browsers.
- Windows 10 
    - `Mozilla Firefox 101.0` 
    - `Microsoft Edge 102.0.1245.33`
    - `Google Chrome 102.0.5005.63`
- Samsung S9 
    - `Google Chrome 100.0.4896.127`

_IE is not supported, it's time to move on._

## Architecture model
![Architecture model](images/architecture.svg?raw=true "Architecture model")
Architecture model showing my intentions of how an application could be built to keep the responsibility of each part separated and not end up with application specific code inside the toolbar.

## Colors
The design of the toolbar is very much closely related to the colors used. Here follows a deeper explanation as to how i use the colors in the project.

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
    <link rel="icon" type="image/x-icon" href="./favicon.ico" />
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
import Overview from './modules/tools/Overview';
import Magnify from './modules/tools/Magnify';
import ResetNorth from './modules/tools/ResetNorth';
import Coordinates from './modules/tools/Coordinates';
import MyLocation from './modules/tools/MyLocation';
import ImportVectorLayer from './modules/tools/ImportVectorLayer';
import ScaleLineTool from './modules/tools/ScaleLineTool';
import Refresh from './modules/tools/Refresh';
import ThemeToggle from './modules/tools/ThemeToggle';
import DirectionToggle from './modules/tools/DirectionToggle';
import Info from './modules/tools/Info';
import Help from './modules/tools/Help';
import Settings from './modules/tools/Settings';
import DebugInfo from './modules/tools/DebugInfo';
import HiddenAbout from './modules/tools/HiddenTools/About';
```

and then calling the constructor in the array inside the extend method. The tools are added to the toolbar in the order you include them in this array.
```javascript
controls: defaultControls({
    zoom: false, 
    rotate: false, 
    attribution: SettingsManager.getSetting('showAttributions')
}).extend([
    new HiddenMarker(),
    new HiddenMapNavigation(),
    new Home(),
    new ZoomIn(),
    new ZoomOut(),
    new FullScreen(),
    new ExportPNG(),
    new DrawTool(),
    new MeasureTool(),
    new Edit(),
    new Bookmark(),
    new Layers(),
    new SplitView(),
    new Overview(),
    new Magnify(),
    new ResetNorth(),
    new Coordinates(),
    new MyLocation(),
    new ImportVectorLayer(),
    new ScaleLineTool(),
    new Refresh(),
    new ThemeToggle(),
    new DirectionToggle(),
    new Info(),
    new Help(),
    new Settings(),
    new DebugInfo()
    new HiddenAbout()
])
```

### Callback functions and constructor parameters
Tools that in any way change the map, create, modify or delete objects have several different callback functions that return data to you. 
```javascript
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
            console.log('Measure end');
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
        storeDataInLocalStorage: true,
        added: function(bookmark) {
            console.log('Bookmark added', bookmark);
        },
        removed: function(bookmark) {
            console.log('Bookmark removed', bookmark);
        },
        zoomedTo: function(bookmark) {
            console.log('Zoomed to bookmark', bookmark);
        },
        cleared: function() {
            console.log('Bookmarks cleared');
        }
    }),
    new Layers({
        disableMapCreateLayerButton: false,
        disableMapLayerVisibilityButton: false,
        disableMapLayerEditButton: false,
        disableMapLayerDeleteButton: false,
        disableFeatureCreateLayerButton: false,
        disableFeatureLayerVisibilityButton: false,
        disableFeatureLayerEditButton: false,
        disableFeatureLayerDeleteButton: false,
        disableFeatureLayerDownloadButton: false,
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
            console.log('Feature layer added', layerObject);
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
    new Overview(),
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
    new ImportVectorLayer({
        imported: function(features) {
            console.log('Imported', features);
        },
        error: function(filename, error) {
            console.log('Error when importing file:', filename, error);
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
        content: '<p>This is a <em>modal window</em>, here you can place some text about your application or links to external resources.</p>'
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
    new DebugInfo({
        showWhenGetParameter: true
    }),
    new HiddenAbout()
])
```

### Store data locally instead of via API
Tools that create objects at runtime, for example the BookmarkTool, LayerTool etc. returns data via the callback functions. There is also the possibility for these tools to store the created objects in localStorage instead. This is done by setting the constructor parameter `storeDataInLocalStorage: true`. This can be useful if you want to create a map-viewer that can persists data between page load but have no need for an additionall long-term storage via API. 

**Note** At the moment only the BookmarkTool has this feature fully implemented. The Map also stores base data (zoom, lon, lat) in localStorage. You can read more about the State Management [here](#state-management). 

### Hidden tools
Tools refered to as hidden tools are tools that only add functionality via the context menu. The hidden tools are used to enable the same type of callback functions in the constructor as every other tool. 

### Shortcut keys
All tools have a shortcut key for ease of use and speeds up the handling of the toolbar and map. The shortcut key is displayed in the tooltip on the corresponding tool.

### Custom projections
You can define custom projections in the file `./modules/epsg/Projections`.
This file is imported in the main `map.js` file and your projection can be used throughout the project. If you want to change the default proejction used, there is a general config file `./modules/core/Config.js` where you can change that.

### Dialogs
To use the custom dialogs in the map, include the following module.
All the dialogs uses trap focus and circles the tab-key to always stay in the opened dialog.
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
Toast.success({text: 'Changes were saved to database', autoremove: 3000});
```

To close the toast from the code, store a reference to the toast and then call the remove method. The attribute `clickToClose` is set to false, this means that the user can't click on the toast to close it.
```javascript
const loadingToast = Toast.info({text: 'Trying to find your location...', clickToClose: false});

loadingToast.remove();
```

To add a loading spinner in the toast. Add the `spinner` property.
```javascript
const loadingToast = Toast.info({text: 'Trying to find your location...', clickToClose: false, spinner: true});
```

### Context menu
To use the context menu start by importing the following module.
```javascript
import ContextMenu from './modules/common/ContextMenu';
```

To create a context menu call the constructor and give a unique name as the first argument and a selector to trigger the menu. The context menu class extends the Control class from OpenLayers.
```javascript
map.addControl(new ContextMenu({
    name: 'main.map.context.menu', 
    selector: '#map canvas'
});
```

To add items to the context menu use the function `addContextMenuItem` and give the name that matches the context menu aswell as the name/label of the item, the icon and a function to call when the item is clicked.
```javascript
addContextMenuItem('main.map.context.menu', {icon: '<svg>...</svg>', name: 'Zoom home', fn: this.handleResetToHome.bind(this)});
```

The callback function recieves a references to the map, the clicked coordinates and the target element (the canvas).
```javascript
addContextMenuItem('main.map.context.menu', {icon: '<svg>...</svg>', name: 'Clear settings', fn: function(map, coordinates, target) {
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
addContextMenuItem('main.map.context.menu', {});
```

### State Management
To use state management start by importing the following module.
```javascript
import StateManager from './modules/core/Managers/StateManager';
```

State management is done through localStorage. First add a node name and an object to store default values.
```javascript
const LOCAL_STORAGE_NODE_NAME = 'drawTool';
const LOCAL_STORAGE_PROPS = {
    collapsed: false,
    toolTypeIndex: 5,
    strokeColor: '#4A86B8',
    strokeWidth: 2,
    fillColor: '#FFFFFFFF'
};
```

These two nextcomming lines merges potential stored data into a runtime copy of the default properties located in `LOCAL_STORAGE_PROPS`. The spread operator is a really nice feature for this operation.
```javascript
// Load potential stored data from localStorage
const loadedPropertiesFromLocalStorage = JSON.parse(StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME)) || {};

// Merge the potential data replacing the default values
this.localStorage = {...LOCAL_STORAGE_PROPS, ...loadedPropertiesFromLocalStorage};
```

To update the state in localStorage, call the `updateStateObject` method and pass in the node name along with the updated state object.
```javascript
StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
```

### Debug tool
To make debugging and diagnosting errors easier there is a tool named `DebugInfo`. This tool will gather information about the map such as zoomlevel, location, layers, rotation, projection etc and displays the information in a modal window. To hide the debug tool as default, add the parameter `showWhenGetParameter: true` and add the get parameter to the url `/?debug=true` to show the tool. Adding the debug parameter will also enable the default context-menu in the browser.

### OLTB namespace
For some tools and features data is stored on the global window object. The name that is reserved for the toolbar is `window.oltb`. Data is stored in local storage under the key `oltb-state`. 

All classes and id:s in the project are also prefixed with the namespace `oltb`.

## External GitHub projects
1. [OpenLayers 6.14.1](https://openlayers.org/en/v6.14.1/apidoc/)
2. [Tippy.js 6.3.7](https://atomiks.github.io/tippyjs/)
3. [Bootstrap Icons](https://icons.getbootstrap.com/)
4. [A Color Picker 1.2.1](https://github.com/narsenico/a-color-picker)
5. [Plain JS Slidetoggle 2.0.0](https://github.com/ericbutler555/plain-js-slidetoggle)

## Maps used in the demo
1. [OpenStreetMap](https://www.openstreetmap.org/)
2. [Maps.Stamen.Com](http://maps.stamen.com/)
3. [ArcGIS World Topo](https://www.arcgis.com/index.html)

## License
[BSD-2-Clause License](LICENSE)

## Author
[Qulle](https://github.com/qulle/)