<p align="center">
    <img src="https://raw.githubusercontent.com/qulle/oltb/main/images/oltb-full.svg" width="200" />
</p>

<h1 align="center">Toolbar for OpenLayers</h1>

## OLTB v1.1.0
OLTB is a Vanilla JS, portable mobile friendly GIS Toolbar, developed using OpenLayers 8.2.0. The Toolbar can be filled with any number of tools and can be used in both horizontal and vertical mode and is available in both light and dark theme.

## Latest Build - [Demo](https://qulle.github.io/oltb/)
The latest demo is built using the last official release.

## Screenshots
![Screenshot Light Theme](https://raw.githubusercontent.com/qulle/oltb/main/images/demo-light.png?raw=true "Screenshot Light Theme")
<p align="center"><em>Light theme</em></p>

![Screenshot Dark Theme](https://raw.githubusercontent.com/qulle/oltb/main/images/demo-dark.png?raw=true "Screenshot Dark Theme")
<p align="center"><em>Dark theme</em></p>

## NPM
```
$ npm install oltb
```

## CDN 
```
https://cdn.jsdelivr.net/npm/oltb@v1.1.0/dist/oltb.min.js
https://cdn.jsdelivr.net/npm/oltb@v1.1.0/dist/oltb.min.css
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
- Internationalization are shipped with project, included are:
    - English
    - Swedish

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