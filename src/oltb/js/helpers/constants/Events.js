const FILENAME = 'constants/Events.js';

const EVENTS = Object.freeze({
    Browser: Object.freeze({
        Click: 'click',
        ContextMenu: 'contextmenu',
        KeyUp: 'keyup',
        KeyDown: 'keydown',
        Resize: 'resize',
        Wheel: 'wheel',
        Change: 'change',
        MouseDown: 'mousedown',
        MouseMove: 'mousemove',
        MouseOut: 'mouseout',
        ContentLoaded: 'DOMContentLoaded',
        FullScreenChange: 'fullscreenchange',
        Load: 'load',
        Input: 'input'
    }),
    OpenLayers: Object.freeze({
        Add: 'add',
        Remove: 'remove',
        DrawStart: 'drawstart',
        DrawEnd: 'drawend',
        DrawAbort: 'drawabort',
        ModifyStart: 'modifystart',
        ModifyEnd: 'modifyend',
        MoveEnd: 'moveend',
        TranslateStart: 'translatestart',
        TranslateEnd: 'translateend',
        Error: 'error',
        Change: 'change',
        PropertyChange: 'propertychange',
        PreRender: 'prerender',
        PostRender: 'postrender',
        RenderComplete: 'rendercomplete',
        SingleClick: 'singleclick',
        PointerMove: 'pointermove'
    }),
    Custom: Object.freeze({
        ToolbarDirectionChange: 'oltb.toolbar.direction.change',
        SettingsCleared: 'oltb.settings.cleared',
        MapLayerAdded: 'oltb.mapLayer.added',
        MapLayerRemoved: 'oltb.mapLayer.removed',
        FeatureLayerAdded: 'oltb.featureLayer.added',
        FeatureLayerRemoved: 'oltb.featureLayer.removed',
        FeatureEdited: 'oltb.feature.edited',
        FeatureRemoved: 'oltb.feature.removed',
        ColorChange: 'oltb.color.change'
    })
});

export { EVENTS };