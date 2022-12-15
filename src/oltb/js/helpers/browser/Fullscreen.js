const FULL_SCREEN_EVENTS = [
    'fullscreenchange',
    'webkitfullscreenchange',
    'MSFullscreenChange'
];
  
const FULL_SCREEN_EVENT_TYPE = {
    enterFullScreen: 'enterfullscreen',
    leaveFullScreen: 'leavefullscreen'
};

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
    if(document.exitFullscreen) {
        return document.exitFullscreen();
    }else if(document['msExitFullscreen']) {
        return document['msExitFullscreen']();
    }else if(document['webkitExitFullscreen']) {
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