const Events = Object.freeze({
    browser: Object.freeze({
        change: 'change',
        click: 'click',
        contentLoaded: 'DOMContentLoaded',
        contextMenu: 'contextmenu',
        error: 'error',
        fullScreenChange: 'fullscreenchange',
        input: 'input',
        keyDown: 'keydown',
        keyUp: 'keyup',
        load: 'load',
        mouseDown: 'mousedown',
        mouseMove: 'mousemove',
        mouseOut: 'mouseout',
        resize: 'resize',
        wheel: 'wheel'
    }),
    openLayers: Object.freeze({
        add: 'add',
        boxCancel: 'boxcancel',
        boxDrag: 'boxdrag',
        boxEnd: 'boxend',
        boxStart: 'boxstart',
        change: 'change',
        drawAbort: 'drawabort',
        drawEnd: 'drawend',
        drawStart: 'drawstart',
        error: 'error',
        modifyEnd: 'modifyend',
        modifyStart: 'modifystart',
        moveEnd: 'moveend',
        pointerMove: 'pointermove',
        postRender: 'postrender',
        preRender: 'prerender',
        propertyChange: 'propertychange',
        remove: 'remove',
        renderComplete: 'rendercomplete',
        singleClick: 'singleclick',
        snap: 'snap',
        translateEnd: 'translateend',
        translateStart: 'translatestart'
    }),
    custom: Object.freeze({
        activeFeatureLayerChange: 'oltb.active.feature.layer.change',
        browserStateCleared: 'oltb.browser.state.cleared',
        colorChange: 'oltb.color.change',
        featureEdited: 'oltb.feature.edited',
        featureLayerAdded: 'oltb.featureLayer.added',
        featureLayerRemoved: 'oltb.featureLayer.removed',
        featureRemoved: 'oltb.feature.removed',
        mapLayerAdded: 'oltb.mapLayer.added',
        mapLayerRemoved: 'oltb.mapLayer.removed',
        ready: 'oltb.is.ready',
        toolbarDirectionChange: 'oltb.toolbar.direction.change'
    })
});

export { Events };