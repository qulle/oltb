const FILENAME = 'browser/Fullscreen.js';
const FULL_SCREEN_EVENTS = Object.freeze([
    'fullscreenchange',
    'webkitfullscreenchange',
    'MSFullscreenChange'
]);
  
const FULL_SCREEN_EVENT_TYPE = Object.freeze({
    EnterFullScreen: 'enterfullscreen',
    LeaveFullScreen: 'leavefullscreen'
});

const isFullScreenSupported = function() {
    const body = document.body;
    
    return !!(
        (body['webkitRequestFullscreen']) ||
        (body['msRequestFullscreen'] && document['msFullscreenEnabled']) ||
        (body.requestFullscreen && document.fullscreenEnabled)
    );
}

const isFullScreen = function() {
    return !!(
        document['webkitIsFullScreen'] ||
        document['msFullscreenElement'] ||
        document.fullscreenElement
    );
}

const requestFullScreen = function(element) {
    if(Boolean(element.requestFullscreen)) {
        element.requestFullscreen();
    }else if(Boolean(element['msRequestFullscreen'])) {
        element['msRequestFullscreen']();
    }else if(Boolean(element['webkitRequestFullscreen'])) {
        element['webkitRequestFullscreen']();
    }
}
  
const requestFullScreenWithKeys = function(element) {
    if(Boolean(element['webkitRequestFullscreen'])) {
        element['webkitRequestFullscreen']();
    }else {
        requestFullScreen(element);
    }
}
  
const exitFullScreen = function() {
    if(Boolean(document.exitFullscreen)) {
        return document.exitFullscreen();
    }else if(Boolean(document['msExitFullscreen'])) {
        return document['msExitFullscreen']();
    }else if(Boolean(document['webkitExitFullscreen'])) {
        return document['webkitExitFullscreen']();
    }
}

export {
    FULL_SCREEN_EVENTS,
    FULL_SCREEN_EVENT_TYPE,
    isFullScreenSupported,
    isFullScreen,
    requestFullScreen,
    requestFullScreenWithKeys,
    exitFullScreen
};