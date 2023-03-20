# Ideas

- Projections, how to make it work with ex. EPSG:3006, having issues with Markers not ending up on correct positions on the map and the GraticuleTool is not working.

- New tool, Center square/crosshair. A simple tool that just toggles a crosshair in the middle of the map. User can set color and basic style in constructor.

- New tool, Save button that gathers all information necessary. The consumer can then decide what to do with the information.

- Add contextmenu button to export all feature layers as one layer containing every feature. Both as KML and GeoJSON.

- Add Cut, Copy, Paste of features that are selected in the EditTool.

- Bug/Lack of functionality. Not getting style for the Markers to be export in KML or GeoJSON, seems like this is not meant to be working for Point geometries. Drawings exported as KML get the correct style, also when it is imported again.

- Add option to create a InfoWindow to any selected feature object.

- New tool, HelicopterTool that uses a Marker as the base and then have circles surrounding it that shows the distance that it travels at given speed and time.

- New tool, SearchTool that opens modal window. Takes parameters from user and performs fetch requests and outputs the result in different ways with possibilities to create objects in the map.

- New manager, OperationsManager, that all other tools and managers will push, pop items to a stack that later can be used to undo actions.

- Add another Marker, smaller diameter without an icon. 

- New manager, LocalizationManager to handle support for multiple languages.