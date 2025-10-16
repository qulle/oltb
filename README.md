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
![Test Coverage](https://img.shields.io/badge/coverage-83.15%25-brightgreen?logo=jest)

</div>

## OLTB v3.5.0
OLTB is a Vanilla JS, portable mobile friendly GIS Toolbar, developed using OpenLayers 10.6.1. The Toolbar can be filled with any number of tools and can be used in both horizontal and vertical mode and is available in both light and dark theme.

## Demo
A picture says a thousand words but a **[Demo 🚀](https://qulle.github.io/oltb/)** says a million.

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
https://cdn.jsdelivr.net/npm/oltb@v3.5.0/dist/oltb.min.js
https://cdn.jsdelivr.net/npm/oltb@v3.5.0/dist/oltb.min.css
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
Examples for both the NPM and CDN version can be viewed in the **[Examples Directory 👀](https://github.com/qulle/oltb/tree/main/examples/)**.
- CDN
    - Vanilla JS (jsdelivr)
- NPM
    - Vanilla JS (Single OLTB module import)
    - Vanilla JS (Individual module import)
    - Angular 19
    - React 18

**Note:** To run Angular and React example, first run **npm install** in each of the example directories.

## Documentation
Have a look at the **[Internal Development Documentation 👓](https://github.com/qulle/oltb/blob/main/README_INTERNAL.md)**. Here you find detailed descriptions and code examples of how individual parts can be used.

## Key Features
- Draggable layers
- Create Map- and Feature layers on the fly
- Stores state in local-storage
- Draw objects including intersections
- Measure both length and areas
- Move vector-objects between feature-layers using cut, copy, paste
- Snap interactions
    - Snap to segments and vertices
    - Snap to helplines between mouse and vertices
- Merge drawings and measurements with different shape operations
- Generate Markers
- Generate Wind Barbs
- Save locations as Bookmarks
- Export PNG of canvas and additional HTML objects
- Compare maps side by side
- Light and Dark theme
- Vertical and Horizontal layout
- Built in debugging help
- Parameters for customizability
- Callback functions for integrations
- Internationalization, included are:
    - English
    - Swedish
    - Easily extend with your own JSON language file

## Language Files
There is a **[Language Project 🌎](https://github.com/qulle/oltb-language-files)** where all available JSON files are kept. If you have a language file, feel free to post a PR to include it for others to use in that repo.

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

## Versions
<table>
    <tr>
        <th>OpenLayers Toolbar (OLTB)</th>
        <th>OpenLayers (OL)</th>
        <th>Released (OLTB)</th>
        <th>Changelog (OLTB)</th>
    </tr>
    <tr><td>3.5.0</td><td>10.6.1</td><td>2025-10-04</td><td><a href="/changelog/v3.5.0.md">v3.5.0.md</a></td></tr>
    <tr><td>3.4.1</td><td>10.5.0</td><td>2025-04-14</td><td><a href="/changelog/v3.4.1.md">v3.4.1.md</a></td></tr>
    <tr><td>3.4.0</td><td>10.5.0</td><td>2025-04-12</td><td><a href="/changelog/v3.4.0.md">v3.4.0.md</a></td></tr>
    <tr><td>3.3.0</td><td>10.4.0</td><td>2025-03-13</td><td><a href="/changelog/v3.3.0.md">v3.3.0.md</a></td></tr>
    <tr><td>3.2.0</td><td>10.0.0</td><td>2024-08-16</td><td><a href="/changelog/v3.2.0.md">v3.2.0.md</a></td></tr>
    <tr><td>3.1.0</td><td>10.0.0</td><td>2024-08-04</td><td><a href="/changelog/v3.1.0.md">v3.1.0.md</a></td></tr>
    <tr><td>3.0.0</td><td>10.0.0</td><td>2024-08-01</td><td><a href="/changelog/v3.0.0.md">v3.0.0.md</a></td></tr>
    <tr><td>2.3.0</td><td>9.1.0</td><td>2024-05-12</td><td><a href="/changelog/v2.3.0.md">v2.3.0.md</a></td></tr>
    <tr><td>2.2.0</td><td>8.2.0</td><td>2024-02-12</td><td><a href="/changelog/v2.2.0.md">v2.2.0.md</a></td></tr>
    <tr><td>2.1.0</td><td>8.2.0</td><td>2024-01-31</td><td><a href="/changelog/v2.1.0.md">v2.1.0.md</a></td></tr>
    <tr><td>2.0.0</td><td>8.2.0</td><td>2024-01-14</td><td><a href="/changelog/v2.0.0.md">v2.0.0.md</a></td></tr>
    <tr><td>1.1.0</td><td>7.4.0</td><td>2023-06-21</td><td><a href="/changelog/v1.1.0.md">v1.1.0.md</a></td></tr>
    <tr><td>1.0.1</td><td>7.3.0</td><td>2023-03-20</td><td><a href="/changelog/v1.0.1.md">v1.0.1.md</a></td></tr>
    <tr><td>1.0.0</td><td>7.3.0</td><td>2023-03-20</td><td><a href="/changelog/v1.0.0.md">v1.0.0.md</a></td></tr>
</table>

## License
[BSD-2-Clause License](https://github.com/qulle/oltb/blob/main/LICENSE)

## Author
[Qulle](https://github.com/qulle/)