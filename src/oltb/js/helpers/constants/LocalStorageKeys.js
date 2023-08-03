// Note: These properties are placed inside the oltb object in localStorage
// So the don't need to be prefixed
const LocalStorageKeys = Object.freeze({
    mapData: 'common.mapdata',
    drawTool: 'tool.draw',
    homeTool: 'tool.home',
    editTool: 'tool.edit',
    layerTool: 'tool.layer',
    themeTool: 'tool.theme',
    magnifyTool: 'tool.magnify',
    measureTool: 'tool.measure',
    zoomBoxTool: 'tool.zoom.box',
    scissorsTool: 'tool.scissors',
    overviewTool: 'tool.overview',
    bookmarkTool: 'tool.bookmark',
    directionTool: 'tool.direction',
    splitViewTool: 'tool.splitview',
    graticuleTool: 'tool.graticule',
    scaleLineTool: 'tool.scaleline',
    coordinatesTool: 'tool.coordinates',
    settingsManager: 'manager.settings'
});

export { LocalStorageKeys };