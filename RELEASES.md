# Releases

## 1.0.0-beta3
2022-10-19

Some of the changes done in this version are:

- Updated to latest version of OpenLayers 7.1.0
- Updated Parcel bundler to latest version 2.7.0
- Added new tool to show Lon/Lat lines (GraticuleTool)
- Added new tool to fetch news from the GitHub repo (NotificationTool)
- Added click-callback to all tools
- Added example layers, both map- and feature-layers
- Added shape functionality, Union, Difference, Intersection, SymDifference
- Added more functionality to the Edit tool
- Added Windbarb module
- Added functionality to export the entire map as PNG, not only the Canvas
- Added re-activation of tools that are active before the application is reloaded (F5)
- Added functionality to make intersections (holes) using the Draw tool
- Added functionality to trigger InfoWindow to show on features (MyLocation tool) as example
- Separated code into smaller parts in own modules
- Fixed Bookmark rename tooltip error
- Fixed projection issue in ImportVectorLayer tool
- Added functionality for multiple tooltips, ex. when using the Coordinate tool and the Measuring tool together
- Refactored LayerManager and improved functionality when adding layers
- Refactored all tools to have same naming convention (always end with Tool in the name)
- Removed the need for a global object inside the window-object
- Code refactoring and improvements

## 1.0.0-beta2
2022-06-09

Some of the changes done in this version are:

- Updated to latest version of OpenLayers 6.14.1
- Updated the Parcel bundler to latest version 2.6.0
- Updated theme, a more solid look and feel for both the light and dark theme
- New tool for miniature map overview
- Added support for import/export vector layer as both GeoJSON and KML
- Added support for collapsible sections in the toolbox
- Extended support for keeping state in local storage
- Extended config options in constructor for the layer tool
- Bug fixes
- Code refactoring and improvements

For a complete changelog please see the commit history on the develop branch.

## 1.0.0-beta1
2022-02-25

First beta release.