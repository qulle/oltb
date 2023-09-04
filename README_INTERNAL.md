<p align="center">
    <img src="https://raw.githubusercontent.com/qulle/oltb/main/images/oltb-full.svg" width="200" />
</p>

<h1 align="center">Toolbar for OpenLayers</h1>

## About
Detailed documentation how the Toolbar is structured, internal dependencies and how all parts are connected together.

## Table of contents
1. [Branches](#branches)
2. [Get Started](#get-started)
3. [Making A Release](#making-a-release)
4. [Update Dependencies](#update-dependencies)
5. [Browser Support](#browser-support)
6. [Localizations](#localizations)
7. [Colors](#colors) 
    1. [Theme Colors](#theme-colors)
    2. [Color Palette](#color-palette)
8. [About The Code](#about-the-code)
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
9. [License](#license)
10. [Author](#author)

## Branches
The `main` branch holds the latest features that are considered done and safe to use. The latest commit from the main branch is available on the [demo-page](https://qulle.github.io/oltb/) hosted in the `gh-pages` branch. Each released major, minor or patch version is tagged and can be checked out or downloaded from CDN and NPM.

## Get Started
The dev-environment uses NPM so you need to have [Node.js](https://nodejs.org/en/) installed. I use Node version *18.12.0* and NPM version *9.8.1*.

Clone the repo
```
$ git clone https://github.com/qulle/oltb.git
```

Install all dependencies from package.json
```
$ npm install
```

Start the dev server
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

# (4). Update version, date and dependencies in:
#      - rollup.cssbanner.mjs
#      - rollup.jsbanner.mjs

# (5). Create new dist
$ bash tasks/npm-dist.sh

# (6). Clean package.json in dist:
#      - repository
#      - scripts
#      - lint-staged
#      - files
#      - devDependencies

# (7). Setup examples
$ bash tasks/dist-examples-setup.sh

# (8). Manually update examples:
#      - NPM x 2
#      - CDN (also bump ol CDN-links in index.html)

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
$ git commit -m "New release vx.y.z"
$ git push

# (13). Create new demo, this will build the GitHub demo using the NPM version
$ bash tasks/github-demo.sh

# (14). Commit and push demo to GitHub
$ git push origin --delete gh-pages
$ git add demo -f
$ git commit -m "gh-pages demo release vx.y.z"
$ git subtree push --prefix demo origin gh-pages

# (15). Verify new demo
# https://qulle.github.io/oltb/

# (16). Clean temp demo commit
$ git reset --hard HEAD~1

# (17). Tag the release
$ git tag -a vx.y.x -m "vx.y.x"
$ git push origin --tags

# (18). Clean github.com/qulle/notification-endpoints
```

## Update Dependencies
Check for dependency updates
```
$ npm outdated
```

Check for dependency security issues
```
$ npm audit
```

Install dependency updates
```
$ npm update --save
```

**Note:** that from npm version `7.0.0` the command `$ npm update` does not longer update the package.json file. From npm version `8.3.2` the command to run is `$ npm update --save` or to always apply the save option add `save=true` to the `.npmrc` file.

## Browser Support 
Manually tested in modern browsers (Mozilla Firefox, Microsoft Edge, Google Chrome).

_IE is not supported, it's time to move on._

## Localizations
English is the default language. However the Toolbar can be extended with any other language. A second language (Swedish) is also shipped with the Toolbar in order to show how it is done. The available languages are controlled from `config.json` and added in to `/i18n/<code>.json`.

## Colors
The project's Theme colors and the full color palette are described below.

### Theme Colors
The Toolbar is available in both `light` and `dark` mode. I have decided to go for a small set of colors in both themes. This enables for a solid look-and-feel and association between colors and functionality. The `mid` color is to consider as the default normal color. For some situations the `light` and `dark` color is used in the normal state.
<table>
    <tr>
        <th>Blue</th>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/blue-light.svg"> #D7E3FA - $color-blue-light</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/blue-mid.svg"> #6397C2 - $color-blue-mid</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/blue-dark.svg"> #0166A5 - $color-blue-dark</td>
    </tr>
    <tr>
        <th>Green</th>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/green-light.svg"> #BCFAF4 - $color-green-light</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/green-mid.svg"> #3CAEA3 - $color-green-mid</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/green-dark.svg"> #007C70 - $color-green-dark</td>
    </tr>
    <tr>
        <th>Gray</th>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/gray-light.svg"> #D3D9E6 - $color-gray-light</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/gray-mid.svg"> #959DAD - $color-gray-mid</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/gray-dark.svg"> #3B4352 - $color-gray-dark</td>
    </tr>
</table>

### Color Palette
The full color palette is displayed below.
<table>
    <tr>
        <th>Blue</th>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/blue-light.svg"> #D7E3FA - $color-blue-light</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/blue-mid.svg"> #6397C2 - $color-blue-mid</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/blue-dark.svg"> #0166A5 - $color-blue-dark</td>
    </tr>
    <tr>
        <th>Indigo</th>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/indigo-light.svg"> #B1CAF6 - $color-indigo-light</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/indigo-mid.svg"> #5B88D6 - $color-indigo-mid</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/indigo-dark.svg"> #2357B1 - $color-indigo-dark</td>
    </tr>
    <tr>
        <th>Purple</th>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/purple-light.svg"> #D0CAFF - $color-purple-light</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/purple-mid.svg"> #9085E4 - $color-purple-mid</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/purple-dark.svg"> #493E9C - $color-purple-dark</td>
    </tr>
    <tr>
        <th>Pink</th>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/pink-light.svg"> #FEE6FF - $color-pink-light</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/pink-mid.svg"> #E8A2EA - $color-pink-mid</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/pink-dark.svg"> #914594 - $color-pink-dark</td>
    </tr>
    <tr>
        <th>Teal</th>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/teal-light.svg"> #BCF8FA - $color-teal-light</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/teal-mid.svg"> #56BABD - $color-teal-mid</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/teal-dark.svg"> #00959A - $color-teal-dark</td>
    </tr>
    <tr>
        <th>Cyan</th>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/cyan-light.svg"> #CEEEFF - $color-cyan-light</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/cyan-mid.svg"> #68B9E5 - $color-cyan-mid</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/cyan-dark.svg"> #0080C5 - $color-cyan-dark</td>
    </tr>
    <tr>
        <th>Green</th>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/green-light.svg"> #BCFAF4 - $color-green-light</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/green-mid.svg"> #3CAEA3 - $color-green-mid</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/green-dark.svg"> #007C70 - $color-green-dark</td>
    </tr>
    <tr>
        <th>Yellow</th>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/yellow-light.svg"> #FFF1C5 - $color-yellow-light</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/yellow-mid.svg"> #FBDD83 - $color-yellow-mid</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/yellow-dark.svg"> #FBBD02 - $color-yellow-dark</td>
    </tr>
    <tr>
        <th>Orange</th>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/orange-light.svg"> #FFDDBC - $color-orange-light</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/orange-mid.svg"> #FCBE80 - $color-orange-mid</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/orange-dark.svg"> #F67D2C - $color-orange-dark</td>
    </tr>
    <tr>
        <th>Red</th>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/red-light.svg"> #FDB5B4 - $color-red-light</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/red-mid.svg"> #E96B69 - $color-red-mid</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/red-dark.svg"> #EB4542 - $color-red-dark</td>
    </tr>
    <tr>
        <th>Gray</th>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/gray-light.svg"> #D3D9E6 - $color-gray-light</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/gray-mid.svg"> #959DAD - $color-gray-mid</td>
        <td><img valign="middle" src="https://raw.githubusercontent.com/qulle/oltb/main/images/colors/gray-dark.svg"> #3B4352 - $color-gray-dark</td>
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
The tools are located in the directory `src/oltb/js/tools`. Every tool has its own class and extend the Control-class from OpenLayers.
```javascript
class CoordinatesTool extends Control {}
```

When using the custom tools, all that is needed is to import the module(s) you want to have in your Toolbar.
```javascript
import { HomeTool } from 'oltb/js/tools/HomeTool';
import { DrawTool } from 'oltb/js/tools/DrawTool';
import { EditTool } from 'oltb/js/tools/EditTool';
import { InfoTool } from 'oltb/js/tools/InfoTool';
import { HelpTool } from 'oltb/js/tools/HelpTool';
import { ThemeTool } from 'oltb/js/tools/ThemeTool';
import { LayerTool } from 'oltb/js/tools/LayerTool';
import { ZoomInTool } from 'oltb/js/tools/ZoomInTool';
import { ZoomBoxTool } from 'oltb/js/tools/ZoomBoxTool';
import { MeasureTool } from 'oltb/js/tools/MeasureTool';
import { MagnifyTool } from 'oltb/js/tools/MagnifyTool';
import { ZoomOutTool } from 'oltb/js/tools/ZoomOutTool';
import { RefreshTool } from 'oltb/js/tools/RefreshTool';
import { SettingsTool } from 'oltb/js/tools/SettingsTool';
import { OverviewTool } from 'oltb/js/tools/OverviewTool';
import { ScissorsTool } from 'oltb/js/tools/ScissorsTool';
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
import { TranslationTool } from 'oltb/js/tools/TranslationTool';
import { HiddenAboutTool } from 'oltb/js/tools/hidden-tools/HiddenAboutTool';
import { NotificationTool } from 'oltb/js/tools/NotificationTool';
import { HiddenMarkerTool } from 'oltb/js/tools/hidden-tools/HiddenMarkerTool';
import { ImportVectorLayerTool } from 'oltb/js/tools/ImportVectorLayerTool';
import { HiddenMapNavigationTool } from 'oltb/js/tools/hidden-tools/HiddenMapNavigationTool';
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
    new ZoomBoxTool(),
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
    new InfoTool(),
    new NotificationTool(),
    new TranslationTool(),
    new HelpTool(),
    new SettingsTool(),
    new DebugInfoTool()
    new HiddenAboutTool()
])
```

### Callback Functions And Constructor Parameters
Tools that in any way change the map, create, modify or delete objects have several different callback functions that return data to you. All tools in the main Toolbar have at least one callback that is named `click`.
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
    new ZoomBoxTool({
        onInitiated: function() {
            console.log('ZoomBoxTool: Initiated');
        },
        onClicked: function() {
            console.log('ZoomBoxTool: Clicked');
        },
        onBrowserStateCleared: function() {
            console.log('ZoomBoxTool: State cleared');
        },
        onStart: function(event) {
            console.log('ZoomBoxTool: Start', event);
        },
        onEnd: function(event) {
            console.log('ZoomBoxTool: End', event);
        },
        onDrag: function(event) {
            console.log('ZoomBoxTool: Drag', event);
        },
        onCancel: function(event) {
            console.log('ZoomBoxTool: Cancel', event);
        },
        onError: function(event) {
            console.log('ZoomBoxTool: Error', event);
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
        onRemovedFeature: function(feature) {
            console.log('EditTool: Removed feature', feature);
        },
        onError: function(event) {
            console.log('EditTool: Error');
        },
        onSnapped: function(event) {
            console.log('EditTool: Snapped');
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
    new ContextMenu()
])
```

### Hidden Tools
Tools refered to as hidden tools are tools that only add functionality via the context menu. The hidden tools are used to enable the same type of setup and callback functions that exists on all other tools. 

### Shortcut Keys
All tools have a shortcut key for ease of use and speeds up the handling of the Toolbar. The shortcut key is displayed in the tooltip on the corresponding tool. All shortcut keys are stored in the module `oltb/js/helpers/Constants/ShortcutKeys`.
```javascript
const ShortcutKeys = Object.freeze({
    areaOverview: 'A',
    bookmark: 'B',
    coordinates: 'C'
    ...
});
```

### Managers
There are a number of so-called managers located in `oltb/js/managers`. These are to be considered as self-isolated classes that have no dependencies to the tools, but the other way around. The managers are the central hub of the application that provides data to all other parties and among themselves.

The managers are initiated in two steps. The first one is the base initiation that is done before the map is created.
```javascript
BootstrapManager.initAsync([
    { manager: LogManager },
    { manager: ErrorManager },
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

The second and third step is to pass the created map as reference to all managers. After that the ready method is called which will fire of a event that components and managers will listen for in order to do the final configurations now when both the DOM, Map and Toolbar is ready to be used. 
```javascript
BootstrapManager.setMap(map);
```

### Custom Projections
You can define custom projections in the file `oltb/js/managers/ProjectionManager.js`. This manager keeps track of all added projections. If you want to change the default projection used, there is a general config module `oltb/js/Config` where you can change that. More projections can be fetched at [https://epsg.io/](https://epsg.io/).

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
Layers are added to the map using the `LayerManager`. The manager handels internal functionality and fires of events that the LayerTool captures to create the UI.

Layers can be added at any time during the applications lifetime. If the map is not ready to recieve a layer the manager will queue the layer and add it to the map once the manager is initiated with a reference to the map.

There are two types of layers, `map`- and `feature`-layers. Exampels of adding different types of layers are available in the [examples directory](https://github.com/qulle/oltb/tree/main/examples/).

**Note:** Both the DrawTool and MeasureTool add features through the LayerManager and not directly to the source of the layer. This is because the LayerManager also keeps tracks of all features so that the Snap interaction can work.

### Markers
Markers can be created in the map using the following module.
```javascript
import { generateIconMarker } from 'oltb/js/generators/GenerateIconMarker';
```

To create a marker use the following object properties.
```javascript
const marker = generateIconMarker({
    lon: 18.0685,
    lat: 59.3293,
    title: 'Marker Title',
    description: 'Marker description',
    label: 'Marker Title',
    markerFill: '#0166A5FF',
    markerStroke: '#FFFFFFFF',
    icon: 'geoPin.filled'
});
```

All available properties:
```javascript
({
    lon: 18.0685,                      // Lon coordinate
    lat: 59.3293,                      // Lat coordinate
    title: 'Marker Title',             // Marker infowindow title
    description: 'Marker description', // Marker infowindow description
    width: 14,                         // Marker width
    radius: 14,                        // Marker height
    markerFill: '#0166A5FF',           // Marker fill color
    markerStroke: '#FFFFFFFF',         // Marker stroke color
    icon: 'geoPin.filled',             // Icon key
    iconWidth: 14,                     // Icon width
    iconHeight: 14,                    // Icon height
    label: 'Marker Title',             // Label over marker
    labelFill: '#FFFFFF',              // Label fill color
    labelStroke: '#3B4352CC',          // Label stroke color
    labelStrokeWidth: 12,              // Label stroke width
    labelFont: '14px Calibri',         // Label font
    labelUseEllipsisAfter: 20,         // Use ellipsis (...) dots if text is to long
    labelUseUpperCase: false,          // If label should be in uppercase
    notSelectable: true,               // If edit tool can select the marker
    infoWindow: undefined,             // Info window to show on click
    replaceHashtag: true               // Replace color hex (UrlMarkers)
});
```

#### URL Markers
A marker can be created by providing the `oltb-marker` object as the GET parameter with the following syntax.
```
/?oltb-marker={"title":"Marker Title", "label": "Marker Title","description":"Information about the maker","icon":"exclamationTriangle.filled","markerFill":"EB4542FF","markerStroke":"FFFFFFFF","layerName":"URL Marker","projection":"EPSG:4326","lon":18.0685,"lat":59.3293,"zoom":8}
```

Test the marker above using the <a href='https://qulle.github.io/oltb/?oltb-marker={"title":"Marker Title", "label": "Marker Title","description":"Information about the maker","icon":"exclamationTriangle.filled","markerFill":"EB4542FF","markerStroke":"FFFFFFFF","layerName":"URL Marker","projection":"EPSG:4326","lon":18.0685,"lat":59.3293,"zoom":8}' target="_blank">demo page</a>.

The JSON object has the following structure.
```json
{
    "title": "Marker Title",
    "description": "Information about the maker",
    "icon": "exclamationTriangle.filled",
    "label": "Marker Title",
    "markerFill": "EB4542FF",
    "markerStroke": "FFFFFFFF",
    "layerName": "URL Marker",
    "projection": "EPSG:4326",
    "lon": 18.0685,
    "lat": 59.3293,
    "zoom": 8
}
```

### Wind Barbs
// TODO

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
    cancelText: 'Cancel'         // Cancel button text
    onConfirm: undefined,        // Void callback with 1 string parameter
    onCancel: undefined          // Void callback with no parameters,
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
    options: []                  // Options to show in select
    confirmClass: Dialog.Danger, // Dialog style (good/bad)
    confirmText: 'Confirm',      // Confirm button text
    cancelText: 'Cancel'         // Cancel button text
    onConfirm: undefined,        // Void callback with 2 string parameter (value, new value)
    onCancel: undefined          // Void callback with no parameters,
    onChange: undefined          // Void callback with 1 string parameter
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

A reference to the created modal is returned from the create function. This can be used to block the creation of a second modal if a button or shortcut key is pressed again. The `onClose` callback can be used to release the lock.
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
Most of the icons are from [icons.getbootstrap.com](https://icons.getbootstrap.com/). Icons have been added on a as needed basis and far from all icons have been added.
```javascript
import { SvgPaths, getIcon } from 'oltb/js/GetIcon';

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
import { getWindBarb } from 'oltb/js/GetWindBarb';

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
ContextMenu.addItem({});
```

### State Management
To use state management start by importing the following module.
```javascript
import { StateManager } from 'oltb/js/managers/StateManager';
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

## Dependencies
1. [OpenLayers 7.4.0](https://openlayers.org/en/v7.4.0/apidoc/)
2. [Proj4 2.9.0](http://proj4js.org/)   
3. [Tippy.js 6.3.7](https://atomiks.github.io/tippyjs/)
4. [Bootstrap Icons](https://icons.getbootstrap.com/)
5. [Moment 2.29.4](https://momentjs.com/)
6. [A Color Picker 1.2.1](https://github.com/narsenico/a-color-picker)
7. [Plain JS Slidetoggle 2.0.0](https://github.com/ericbutler555/plain-js-slidetoggle)
8. [JSTS 2.9.3](https://github.com/bjornharrtell/jsts)
9. [Cycle.js](https://github.com/douglascrockford/JSON-js)
10. [Browser Dtector 3.3.0](https://github.com/sibiraj-s/browser-dtector)
11. [Sortable JS 1.15.0](https://github.com/SortableJS/Sortable)
12. [UUID JS 9.0.0](https://github.com/uuidjs/uuid)
13. [Lodash 4.17.21](https://github.com/lodash/lodash)

## Dev Dependencies
1. [Parcel 2.9.2](https://parceljs.org/)
2. [@parcel/transformer-sass 2.9.2](https://github.com/parcel-bundler/parcel)
3. [Rollup 3.25.1](https://github.com/rollup/rollup)
4. [@rollup/plugin-commonjs 25.0.2](https://github.com/rollup/plugins/tree/master/packages/commonjs)
5. [@rollup/plugin-json 6.0.0](https://github.com/rollup/plugins/tree/master/packages/json)
6. [@rollup/plugin-node-resolve 15.1.0](https://github.com/rollup/plugins/tree/master/packages/node-resolve)
7. [@rollup-plugin-replace 5.0.2](https://github.com/rollup/plugins/tree/master/packages/replace)
8. [@rollup/plugin-terser 0.4.3](https://github.com/rollup/plugins/tree/master/packages/terser)
9. [rollup-plugin-license 3.0.1](https://github.com/mjeanroy/rollup-plugin-license)
10. [rollup-plugin-scss 4.0.0](https://github.com/thgh/rollup-plugin-scss)

## Maps
1. [Open Street Map](https://www.openstreetmap.org/)
2. [Stamen Maps](http://maps.stamen.com/)
3. [ArcGIS World Topo](https://www.arcgis.com/index.html)

## License
[BSD-2-Clause License](https://github.com/qulle/oltb/blob/main/LICENSE)

## Author
[Qulle](https://github.com/qulle/)