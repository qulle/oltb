const EVENTS = {
    browser: {
        click: 'click',
        contextMenu: 'contextmenu',
        keyUp: 'keyup',
        keyDown: 'keydown',
        resize: 'resize',
        wheel: 'wheel',
        change: 'change',
        mouseDown: 'mousedown',
        mouseMove: 'mousemove',
        mouseOut: 'mouseout',
        contentLoaded: 'DOMContentLoaded',
        fullScreenChange: 'fullscreenchange',
        load: 'load',
        input: 'input'
    },
    ol: {
        add: 'add',
        remove: 'remove',
        drawStart: 'drawstart',
        drawEnd: 'drawend',
        drawAbort: 'drawabort',
        modifyStart: 'modifystart',
        modifyEnd: 'modifyend',
        moveEnd: 'moveend',
        translateStart: 'translatestart',
        translateEnd: 'translateend',
        error: 'error',
        change: 'change',
        propertyChange: 'propertychange',
        preRender: 'prerender',
        postRender: 'postrender',
        renderComplete: 'rendercomplete',
        singleClick: 'singleclick',
        pointerMove: 'pointermove'
    },
    custom: {
        toolbarDirectionChange: 'oltb.toolbar.direction.change',
        settingsCleared: 'oltb.settings.cleared',
        mapLayerAdded: 'oltb.mapLayer.added',
        mapLayerRemoved: 'oltb.mapLayer.removed',
        featureLayerAdded: 'oltb.featureLayer.added',
        featureLayerRemoved: 'oltb.featureLayer.removed',
        featureEdited: 'oltb.feature.edited',
        featureRemoved: 'oltb.feature.removed',
        colorChange: 'oltb.color.change'
    }
};

export { EVENTS };