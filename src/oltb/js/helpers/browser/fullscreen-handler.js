const FullscreenEvents = Object.freeze([
    'fullscreenchange',
    'webkitfullscreenchange',
    'MSFullscreenChange'
]);

const FullscreenEventTypes = Object.freeze({
    enterFullScreen: 'enterfullscreen',
    leaveFullScreen: 'leavefullscreen'
});

const isFullScreenSupported = function() {
    return !!(
        (window.document.body['webkitRequestFullscreen']) ||
        (window.document.body['msRequestFullscreen'] && document['msFullscreenEnabled']) ||
        (window.document.body.requestFullscreen && window.document.fullscreenEnabled)
    );
}

const isFullScreen = function() {
    return !!(
        document['webkitIsFullScreen'] ||
        document['msFullscreenElement'] ||
        window.document.fullscreenElement
    );
}

const requestFullScreen = function(element) {
    if(element.requestFullscreen) {
        element.requestFullscreen();
    }else if(element['msRequestFullscreen']) {
        element['msRequestFullscreen']();
    }else if(element['webkitRequestFullscreen']) {
        element['webkitRequestFullscreen']();
    }
}
  
const requestFullScreenWithKeys = function(element) {
    if(element['webkitRequestFullscreen']) {
        element['webkitRequestFullscreen']();
    }else {
        requestFullScreen(element);
    }
}
  
const exitFullScreen = function() {
    if(window.document.exitFullscreen) {
        return window.document.exitFullscreen();
    }else if(document['msExitFullscreen']) {
        return document['msExitFullscreen']();
    }else if(document['webkitExitFullscreen']) {
        return document['webkitExitFullscreen']();
    }
}

export {
    FullscreenEvents,
    FullscreenEventTypes,
    isFullScreenSupported,
    isFullScreen,
    requestFullScreen,
    requestFullScreenWithKeys,
    exitFullScreen
};