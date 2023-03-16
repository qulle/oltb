<p align="center">
	<img src="images/oltb-full.svg" width="200" />
</p>

<h1 align="center">Toolbar for OpenLayers</h1>

## About
Detailed documentation how the toolbar is structured, internal dependencies and how all parts are connected together.

## Table of contents
1. [Branches](#branches)
2. [Get Started](#get-started)
3. [Making A Release](#making-a-release)
4. [Browser Support](#browser-support)
5. [Colors](#colors) 
    1. [Theme Colors](#theme-colors)
    2. [Color Palette](#color-palette)
6. [About The Code](#about-the-code)
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
7. [License](#license)
8. [Author](#author)

## Branches
The `main` branch always holds the latest features that are considered done. The latest commit from the main branch is available on the demo-page hosted in the `gh-pages` branch.

## Get Started
The dev-environment uses NPM so you need to have [Node.js](https://nodejs.org/en/) installed. I use Node version *18.12.0* and NPM version *8.16.0*.

Clone the repo.
```
$ git clone https://github.com/qulle/oltb.git
```

Install all dependencies from package.json.
```
$ npm install
```

Start the dev server.
```
$ npm start
```

Make GitHub demo build.
```
$ bash tasks/github_demo.sh
```

Make NPM library build.
```
$ bash tasks/npm_dist.sh
```

Use the following command clean all.
```
$ npm run clean
```

Check for dependency updates.
```
$ npm outdated
```

Check for dependency security issues.
```
$ npm audit
```

Install dependency updates.
```
$ npm update --save
```

**Note:** that from npm version `7.0.0` the command `$ npm update` does not longer update the `package.json` file. From npm version `8.3.2` the command to run is `$ npm update --save` or to always apply the save option add `save=true` to the `.npmrc` file.

## Making A Release
```bash
# (1). Checkout and update main branch
$ git checkout main
$ git pull

# (2). Clean old data
$ npm run clean

# (3). Update version in: 
#      - package.json
#      - README.md
#      - README_INTERNAL.md

# (4). Update version and dependencies in:
#      - rollup.cssbanner.mjs
#      - rollup.jsbanner.mjs

# (5). Create new dist directory
$ bash tasks/npm-dist.sh

# (6). Clean package.json in dist:
#      - repository
#      - scripts
#      - files
#      - devDependencies

# (7). Setup examples
$ bash tasks/dist-examples-setup.sh

# (8). Manually update examples:
#      - NPM x 2
#      - CDN

# (9). Verify examples
$ npm run example:one
$ npm run example:two
$ npm run example:three

# (10). Cleanup examples
$ bash tasks/dist-examples-cleanup.sh

# (11). Publish package to NPM
$ bash tasks/npm-publish.sh

# (12). Commit and push updated examples to GitHub
$ git add .
$ git commit -m "New release x.y.z"
$ git push

# (13). Create new demo, this will build the GitHub demo using the NPM version
$ bash tasks/github-demo.sh

# (14). Commit and push demo to GitHub
$ git push origin --delete gh-pages
$ git add dist -f
$ git commit -m "gh-pages demo release x.y.z"
$ git subtree push --prefix dist origin gh-pages

# (15). Verify new demo
# https://qulle.github.io/oltb/

# (16). Clean temp demo commit
$ git reset --hard HEAD~1

# (17). Tag the release
git tag -a vx.y.x -m "vx.y.x"
git push origin --tags

# (18). Clean github.com/qulle/notification-endpoints
```

## Browser Support 
Manually tested in modern browsers (Mozilla Firefox, Microsoft Edge, Google Chrome).

_IE is not supported, it's time to move on._

## Colors
The project's Theme colors and the full color palette are described below.

### Theme Colors
The toolbar is available in both `light` and `dark` mode. I have decided to go for a small set of colors in both themes. This enables for a solid look-and-feel and association between colors and functionality. The `mid` color is to consider as the default normal color. For some situations the `light` and `dark` color is used in the normal state.
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

### Color Palette
The full color palette is displayed below.
<table>
    <tr>
        <th>Blue</th>
        <td><img valign="middle" src="./images/colors/blue-light.svg"> #D7E3FA - $color-blue-light</td>
        <td><img valign="middle" src="./images/colors/blue-mid.svg"> #6397C2 - $color-blue-mid</td>
        <td><img valign="middle" src="./images/colors/blue-dark.svg"> #0166A5 - $color-blue-dark</td>
    </tr>
    <tr>
        <th>Indigo</th>
        <td><img valign="middle" src="./images/colors/indigo-light.svg"> #B1CAF6 - $color-indigo-light</td>
        <td><img valign="middle" src="./images/colors/indigo-mid.svg"> #5B88D6 - $color-indigo-mid</td>
        <td><img valign="middle" src="./images/colors/indigo-dark.svg"> #2357B1 - $color-indigo-dark</td>
    </tr>
    <tr>
        <th>Purple</th>
        <td><img valign="middle" src="./images/colors/purple-light.svg"> #D0CAFF - $color-purple-light</td>
        <td><img valign="middle" src="./images/colors/purple-mid.svg"> #9085E4 - $color-purple-mid</td>
        <td><img valign="middle" src="./images/colors/purple-dark.svg"> #493E9C - $color-purple-dark</td>
    </tr>
    <tr>
        <th>Pink</th>
        <td><img valign="middle" src="./images/colors/pink-light.svg"> #FEE6FF - $color-pink-light</td>
        <td><img valign="middle" src="./images/colors/pink-mid.svg"> #E8A2EA - $color-pink-mid</td>
        <td><img valign="middle" src="./images/colors/pink-dark.svg"> #914594 - $color-pink-dark</td>
    </tr>
    <tr>
        <th>Teal</th>
        <td><img valign="middle" src="./images/colors/teal-light.svg"> #BCF8FA - $color-teal-light</td>
        <td><img valign="middle" src="./images/colors/teal-mid.svg"> #56BABD - $color-teal-mid</td>
        <td><img valign="middle" src="./images/colors/teal-dark.svg"> #00959A - $color-teal-dark</td>
    </tr>
    <tr>
        <th>Cyan</th>
        <td><img valign="middle" src="./images/colors/cyan-light.svg"> #CEEEFF - $color-cyan-light</td>
        <td><img valign="middle" src="./images/colors/cyan-mid.svg"> #68B9E5 - $color-cyan-mid</td>
        <td><img valign="middle" src="./images/colors/cyan-dark.svg"> #0080C5 - $color-cyan-dark</td>
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

## About The Code
Below is the basic HTML and JavaScript structure used in the project. For a complete example of how to set up the code go to the [examples directory](https://github.com/qulle/oltb/tree/main/examples/).

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

The toolbar is vertical by default, add class `row` to change direction. The user can change the direction using the tool `DirectionTool`.
```HTML
<div id="oltb" class="row"></div>
```

The toolbar theme is light by default, add class `dark` to change theme. The user can change the theme using the tool `ThemeTool`.
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
The tools are located in the directory `src/oltb/js/modules/tools`. Every tool has its own class and extend the Control-class from OpenLayers.
```javascript
class CoordinatesTool extends Control {}
```

When using the custom tools, all that is needed is to import the module(s) you want to have in your toolbar.
```javascript
import { HomeTool } from 'oltb/js/tools/HomeTool';
import { DrawTool } from 'oltb/js/tools/DrawTool';
import { EditTool } from 'oltb/js/tools/EditTool';
import { InfoTool } from 'oltb/js/tools/InfoTool';
import { HelpTool } from 'oltb/js/tools/HelpTool';
import { ThemeTool } from 'oltb/js/tools/ThemeTool';
import { LayerTool } from 'oltb/js/tools/LayerTool';
import { ZoomInTool } from 'oltb/js/tools/ZoomInTool';
import { MeasureTool } from 'oltb/js/tools/MeasureTool';
import { MagnifyTool } from 'oltb/js/tools/MagnifyTool';
import { ZoomOutTool } from 'oltb/js/tools/ZoomOutTool';
import { RefreshTool } from 'oltb/js/tools/RefreshTool';
import { SettingsTool } from 'oltb/js/tools/SettingsTool';
import { OverviewTool } from 'oltb/js/tools/OverviewTool';
import { BookmarkTool } from 'oltb/js/tools/BookmarkTool';
import { DirectionTool } from 'oltb/js/tools/DirectionTool';
import { DebugInfoTool } from 'oltb/js/tools/DebugInfoTool';
import { SplitViewTool } from 'oltb/js/tools/SplitViewTool';
import { ExportPngTool } from 'oltb/js/tools/ExportPngTool';
import { ScaleLineTool } from 'oltb/js/tools/ScaleLineTool';
import { GraticuleTool } from 'oltb/js/tools/GraticuleTool';
import { MyLocationTool } from 'oltb/js/tools/MyLocationTool';
import { ResetNorthTool } from 'oltb/js/tools/ResetNorthTool';
import { FullscreenTool } from 'oltb/js/tools/FullscreenTool';
import { CoordinatesTool } from 'oltb/js/tools/CoordinatesTool';
import { HiddenAboutTool } from 'oltb/js/tools/hidden-tools/HiddenAboutTool';
import { NotificationTool } from 'oltb/js/tools/NotificationTool';
import { HiddenMarkerTool } from 'oltb/js/tools/hidden-tools/HiddenMarkerTool';
import { ImportVectorLayerTool } from 'oltb/js/tools/ImportVectorLayerTool';
import { HiddenMapNavigationTool } from 'oltb/js/tools/hidden-tools/HiddenMapNavigationTool';
```

Then call the constructor for each tool in the extend method. The tools are added to the toolbar in the order you include them in the array.
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
    new FullscreenTool(),
    new ExportPngTool(),
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

### Callback Functions And Constructor Parameters
Tools that in any way change the map, create, modify or delete objects have several different callback functions that return data to you. All tools in the main toolbar have at least one callback that is named `click`.
```javascript
controls: defaultControls({
    zoom: false, 
    rotate: false
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
        lon: 18.1201,
        lat: 35.3518,
        zoom: 3,
        click: function() {
            console.log('HomeTool click');
        },
        home: function() {
            console.log('Map zoomed home');
        }
    }),
    new ZoomInTool({
        delta: 1,
        click: function() {
            console.log('ZoomInTool clicked');
        },
        zoomed: function() {
            console.log('Zoomed in');
        }
    }),
    new ZoomOutTool({
        delta: -1,
        click: function() {
            console.log('ZoomOutTool clicked');
        },
        zoomed: function() {
            console.log('Zoomed out');
        }
    }),
    new FullscreenTool({
        click: function() {
            console.log('FullscreenTool clicked');
        },
        enter: function(event) {
            console.log('Enter fullscreen mode', event);
        },
        leave: function(event) {
            console.log('Leave fullscreen mode', event);
        }
    }),
    new ExportPngTool({
        filename: 'map-image-export',
        appendTime: true,
        click: function() {
            console.log('ExportPngTool clicked');
        },
        exported: function(filename, content) {
            console.log('Map exported as png', filename, content);
        },
        error: function(error) {
            console.log('Error exporting png', error);
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
        featureLayerDownloaded: function(layerWrapper, filename, content) {
            console.log('Feature layer downloaded', layerWrapper, filename, content);
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
        color: '#3B4352E6',
        dashed: true,
        width: 2,
        showLabels: true,
        wrapX: true,
        click: function() {
            console.log('GraticuleTool clicked');
        }
    }),
    new MagnifyTool({
        radius: 75,
        min: 25,
        max: 150,
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
        onlyWhenGetParameter: false,
        click: function() {
            console.log('DebugInfoTool clicked');
        }
    }),
    new HiddenAboutTool(),
    new ContextMenu()
])
```

### Store Data Locally
Tools that create objects at runtime, for example the BookmarkTool, LayerTool etc. returns data via the callback functions. There is also the possibility for these tools to store the created objects in localStorage instead. This is done by setting the constructor parameter `storeDataInLocalStorage: true`. This can be useful if you want to create a map-viewer that can persists data between page load but have no need for an additionall long-term storage via API. 

**Note:** At the moment only the BookmarkTool has this feature implemented. The Map also stores base data (zoom, lon, lat) in localStorage. You can read more about the State Management [here](#state-management). 

### Hidden Tools
Tools refered to as hidden tools are tools that only add functionality via the context menu. The hidden tools are used to enable the same type of callback functions that exists on all other tools. 

### Shortcut Keys
All tools have a shortcut key for ease of use and speeds up the handling of the toolbar. The shortcut key is displayed in the tooltip on the corresponding tool. All shortcut keys are stored in the module `oltb/js/helpers/Constants/ShortcutKeys`.
```javascript
const ShortcutKeys = {
    areaOverview: 'A',
    bookmark: 'B',
    coordinates: 'C'
    ...
};
```

### Managers
There are a number of so-called managers located in `oltb/js/core/managers`. These are to be considered as self-isolated classes that have no dependencies to the tools, but the other way around. The managers are the central hub of the application that provides data to all other parties and among themselves.

The managers are initiated in two steps. The first one is the base initiation that is done before the map is created.
```javascript
BootstrapManager.init([
    LogManager,
    StateManager,
    ElementManager,
    ProjectionManager,
    LayerManager,
    TippyManager,
    TooltipManager,
    UrlManager,
    ToolManager,
    SettingsManager,
    InfoWindowManager,
    ColorPickerManager,
    AccessibilityManager
]);
```

The second step is after the map has been created, passing the map-reference to all managers to complete the initiation process.
```javascript
BootstrapManager.setMap(map);
```

### Custom Projections
You can define custom projections in the file `oltb/js/core/managers/ProjectionManager.js`. This manager keeps track of all added projections. If you want to change the default projection used, there is a general config module `oltb/js/core/Config` where you can change that. More projections can be fetched at [https://epsg.io/](https://epsg.io/).

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
Layers are added to the map using the `LayerManager`. The manager handels internal functionality and fires of events that the layer-tool captures to create the UI.

Layers can be added at any time during the applications lifetime. If the map is not ready to recieve a layer the manager will queue the layer and add it to the map once the manager is initiated with a reference to the map.

There are two types of layers, `map`- and `feature`-layers. Exampels of adding different types of layers are available in the [examples directory](https://github.com/qulle/oltb/tree/main/examples/).

### Markers
Markers can be created in the map using the following module.
```javascript
import { generateMarker } from 'oltb/js/generators/GenerateMarker';
```

To create a marker use the following object properties.
```javascript
const marker = generateMarker({
    lon: 18.0685,
    lat: 59.3293,
    title: 'Marker Title',
    description: 'Marker description',
    backgroundColor: '#0166A5FF',
    color: '#FFFFFFFF',
    icon: 'GeoPin.Filled'
});
```

Other properties that you can add are:
```javascript
({
    width: 15,           // Circle stroke width
    radius: 15,          // Circle radius
    iconWidth: 14,       // Height of icon (px)
    iconHeight: 14,      // Width of icon (px)
    infoWindow: '',      // HTML Content to show when user click on marker
    notSelectable: true, // If the marker can be selected by the Edit Tool
});
```

#### URL Markers
A marker can be created by providing the `oltb-marker` object as the GET parameter according to the following syntax.
```
/?oltb-marker={"title":"Marker Title","description":"Information about the maker","icon":"exclamationTriangle.filled","fill":"EB4542FF","stroke":"FFFFFFFF","layerName":"URL Marker","projection":"EPSG:4326","lon":18.0685,"lat":59.3293,"zoom":8}
```

Test the marker above using the <a href='https://qulle.github.io/oltb/?oltb-marker={"title":"Marker Title","description":"Information about the maker","icon":"ExclamationTriangle.Filled","backgroundColor":"EB4542FF","color":"FFFFFFFF","layerName":"URL Marker","projection":"EPSG:4326","lon":18.0685,"lat":59.3293,"zoom":8}' target="_blank">demo page</a>.

The JSON object has the following structure.
```json
{
    "title": "Marker Title",
    "description": "Information about the maker",
    "icon": "exclamationTriangle.filled",
    "fill": "EB4542FF",
    "stroke": "FFFFFFFF",
    "layerName": "URL Marker",
    "projection": "EPSG:4326",
    "lon": 18.0685,
    "lat": 59.3293,
    "zoom": 8
}
```

### Dialogs
To use the custom dialogs in the map, include the following module. All the dialogs uses trap focus and circles the tab-key to always stay in the opened dialog.
```javascript
import { Dialog } from 'oltb/js/common/Dialog';
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

Other properties that you can add are:
```javascript
({
    confirmText: 'Your text' // Changes text on the confirm button
});
```

#### Confirm
```javascript
Dialog.confirm({
    title: 'Delete layer',
    message: 'Do you want to delete the selected layer?',
    onConfirm: function() {
        console.log('Confirm button clicked');
    },
    onCancel: function() {
        console.log('Cancel button clicked');
    }
});
```

Other properties that you can add are:
```javascript
({
    confirmClass: Dialog.Success, // Changes to a success dialog
    confirmText: 'Your text',     // Changes text on the confirm button
    cancelText: 'Your text'       // Changes text on the cancel button
});
```

#### Prompt
```javascript
Dialog.prompt({
    title: 'Edit name',
    message: 'You are editing the main layer name',
    value: 'Current name',
    onConfirm: function(result) {
        console.log(result);
    },
    onCancel: function() {
        console.log('Cancel button clicked');
    }
});
```

Other properties that you can add are:
```javascript
({
    confirmClass: Dialog.Danger, // Changes to a danger dialog
    confirmText: 'Your text',    // Changes text on the confirm button
    cancelText: 'Your text'      // Changes text on the cancel button
});
```

### Modal
To use the custom modal in the map, include the following module.
```javascript
import { Modal } from 'oltb/js/common/Modal';
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

A reference to the created modal is returned from the create function. This can be used to block the creation of a second modal if a button is pressed again. The `onClose` callback can be used to release the lock.
```javascript
infoToolClick() {
    if(Boolean(this.infoModal)) {
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
import { Toast } from 'oltb/js/common/Toast';
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
    spinner: true,
});

this.loadingToast.remove();
```

The returned reference to the toast can be used to block further actions while a task is being performed. The `onRemove` callback can be used to release the lock.
```javascript
myLocationToolClick() {
    if(Boolean(this.loadingToast)) {
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
Most of the icons are from the excellent [icons.getbootstrap.com](https://icons.getbootstrap.com/). Icons have been added on a as needed basis and far from all icons have been added.
```javascript
import { SvgPaths, getIcon } from 'oltb/js/core/GetIcon';

const icon = getIcon({
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
const path = SvgPaths[name][version]; // The 'getIcon' function wrapps the path with an svg element
```

#### WindBarb Icons
The Wind Barbs are available from 0 to 190 knots (0 to 97.5m/s). To get more information about the Wind Barbs visit my other project [github.com/qulle/svg-wind-barbs](https://github.com/qulle/svg-wind-barbs).
```javascript
import { getWindBarb } from 'oltb/js/core/GetWindBarb';

const icon = getWindBarb({
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
import { ContextMenu } from 'oltb/js/common/ContextMenu';
```

To create a context menu in the map call the constructor as any other tool. The context menu class extends the Control-class from OpenLayers.
```javascript
map.addControl(new ContextMenu());
```

To add items to the context menu use the static method `ContextMenu.addItem` and give a name and icon as well as a function to call when the item is clicked.
```javascript
ContextMenu.addItem({
    icon: '<svg>...</svg>', 
    name: 'Zoom home', 
    fn: this.handleResetToHome.bind(this)
});
```

The callback function recieves a references to the map, the clicked coordinates and the target element (the canvas).
```javascript
ContextMenu.addItem({
    icon: '<svg>...</svg>', 
    name: 'Clear settings', 
    fn: function(map, coordinates, target) {
        Dialog.confirm({
            text: 'Do you want to clear all settings?',
            onConfirm: function() {
                localStorage.clear();
            }
        });
    }
});
```

It is not important in what order the menu or its items are added. If no menu exist all menu items will be queued and added once the menu is created.

To insert a separator in the menu add an empty object.
```javascript
ContextMenu.addItem({});
```

### State Management
To use state management start by importing the following module.
```javascript
import { StateManager } from 'oltb/js/core/managers/StateManager';
```

State management is done through localStorage. First add a node name and an object to store default values.
```javascript
const LocalStorageNodeName = LocalStorageKeys.drawTool;
const LocalStorageDefaults = {
    active: false,
    collapsed: false,
    toolTypeIndex: 5,
    strokeColor: '#4A86B8FF',
    strokeWidth: 2,
    fillColor: '#FFFFFF80'
};
```

These two nextcomming lines merges stored data into a runtime copy of the default properties located in `LocalStorageDefaults`. The spread operator is a really nice feature for this operation.
```javascript
const localStorageState = StateManager.getStateObject(LocalStorageNodeName);
this.localStorage = { ...LocalStorageDefaults, ...localStorageState };
```

To update the state in localStorage, call the `setStateObject` method and pass in the node name along with the updated state object.
```javascript
StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
```

### Debug Tool
To make debugging and diagnosting errors easier there is a tool named `DebugInfoTool`. This tool will gather information about the map such as zoomlevel, location, layers, rotation, projection etc and displays the information in a modal window. To hide the debug tool as default, add the parameter `onlyWhenGetParameter: true` and add the get parameter to the url `/?oltb-debug=true` to show the tool. Adding the debug parameter will also enable the default context-menu in the browser.

### Logging
Logging is done through the `LogManager`. This way all logging is done through one central place and will be outputted in the `DebugInfoModal`. There are four levels to use when logging.
```javascript
LogManager.logDebug(FILENAME, 'handleClick', 'User clicked tool');
LogManager.logInformation(FILENAME, 'onLayerCreated', 'Layer was created');
LogManager.logWarning(FILENAME, 'loadLayer', 'Could not load geojson file');
LogManager.logError(FILENAME, 'saveState', 'Error parsing JSON object');
```

There is also the possibility to log complex objects insted of plain text.
```javascript
LogManager.logDebug(FILENAME, 'handleClick', {
    info: 'User clicked tool',
    url: 'localhost:1234',
    values: [1, 2, 3, 4]
});
```

Add the get parameter to the url `/?oltb-debug=true` to also display the logged messages in the browser console.

### OLTB Namespace
All classes and id:s in the project are prefixed with the namespace `oltb`. Data is also stored in local storage under the key `oltb-state`. 

## License
[BSD-2-Clause License](LICENSE)

## Author
[Qulle](https://github.com/qulle/)