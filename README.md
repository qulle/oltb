<p align="center">
    <img src="https://raw.githubusercontent.com/qulle/oltb/main/images/oltb-full.svg" width="200" />
</p>

<h1 align="center">Toolbar for OpenLayers</h1>

<div align="center">

![License: BSD-2-Clause](https://img.shields.io/badge/License-BSD%202--Clause-blue?logo=github&logoColor=fff)
[![Demo](https://img.shields.io/badge/Demo-Available-brightgreen.svg?logo=github&logoColor=fff)](https://qulle.github.io/oltb/)
![npm downloads](https://img.shields.io/npm/dm/oltb?logo=npm&logoColor=fff)
![npm version](https://img.shields.io/npm/v/oltb?logo=npm&logoColor=fff)
![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/oltb?logo=jsdelivr&logoColor=fff)

<!-- TODO: 
    1. Perhaps add in future:
    ![GitHub issues](https://img.shields.io/github/issues/qulle/oltb?logo=github&logoColor=fff)
    ![GitHub pull requests](https://img.shields.io/github/issues-pr/qulle/oltb?logo=github&logoColor=fff)

    2. Add YML config for Build and Test using GitHub Actions
    3. Add YML config for Snyk
!-->

</div>

## OLTB v3.0.0-dev
OLTB is a Vanilla JS, portable mobile friendly GIS Toolbar, developed using OpenLayers 9.1.0. The Toolbar can be filled with any number of tools and can be used in both horizontal and vertical mode and is available in both light and dark theme.

## Latest Build
A picture says a thousand words but a **[Demo 🚀](https://qulle.github.io/oltb/)** says a million.

## Screenshots
![Screenshot Light Theme](https://raw.githubusercontent.com/qulle/oltb/wip-3.0.0/images/demo-light.png?raw=true "Screenshot Light Theme")
<p align="center"><em>Light theme</em></p>

![Screenshot Dark Theme](https://raw.githubusercontent.com/qulle/oltb/wip-3.0.0/images/demo-dark.png?raw=true "Screenshot Dark Theme")
<p align="center"><em>Dark theme</em></p>

![Screenshot Sprite](https://raw.githubusercontent.com/qulle/oltb/wip-3.0.0/images/demo-sprite.png?raw=true "Screenshot Sprite")
<p align="center"><em>Add Map Layer | Debug Information | Add Marker</em></p>

## NPM
```
$ npm install oltb
```

## CDN 
```
https://cdn.jsdelivr.net/npm/oltb@v2.3.0/dist/oltb.min.js
https://cdn.jsdelivr.net/npm/oltb@v2.3.0/dist/oltb.min.css
```

## Get Started
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

## Examples
Examples for both the NPM and CDN version can be viewed in the [examples directory](https://github.com/qulle/oltb/tree/main/examples/). Use Git history and the tagged releases to look at older examples.

## Documentation
Have a look at the [Internal Development Documentation](https://github.com/qulle/oltb/blob/main/README_INTERNAL.md). Here you find detailed descriptions and code examples of how individual parts can be used.

## Key Features
- Draggable layers
- Create Map- and Feature layers on the fly
- Stores state in local storage
- Draw objects including intersections
- Measure both length and areas
- Snap interactions
- Merge drawings and measurements with different shape operations
- Generate Markers
- Generate Wind Barbs
- Save locations as Bookmarks
- Export PNG of canvas and additional HTML objects
- Compare maps side by side
- Light and Dark mode
- Vertical and Horizontal mode
- Built in debugging help
- Parameters for customizability
- Callback functions for integrations
- Internationalization, included are:
    - English
    - Swedish
    - Easily extend with your own JSON language file

## Tools
The following tools are implemented in the project. The tools are devided in two different categories, Hidden and Non-Hidden tools. The differenc is that Hidden tools are not displayed in the Toolbar, but only add functionality in the contextmenu.

### Hidden Tools
- HiddenAboutTool
- HiddenMapNavigationTool
- HiddenMarkerTool

### Tools
- BookmarkTool
- CoordinatesTool
- DebugInfoToo
- DirectionTool
- DrawTool
- EditTool
- ScissorsTool
- ExportPngTool
- FullscreenTool
- GraticuleTool
- HelpTool
- HomeTool
- ImportVectorLayerTool
- InfoTool
- LayerTool
- MagnifyTool
- MeasureTool
- MyLocationTool
- OverviewTool
- RefreshTool
- ResetNorthTool
- ScaleLineTool
- SettingsTool
- SplitViewTool
- ThemeTool
- ToolboxTool
- ZoomboxTool
- ZoomInTool
- ZoomOutTool

## License
[BSD-2-Clause License](https://github.com/qulle/oltb/blob/main/LICENSE)

## Author
[Qulle](https://github.com/qulle/)