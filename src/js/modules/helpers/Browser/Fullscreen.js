const events = [
    'fullscreenchange',
    'webkitfullscreenchange',
    'MSFullscreenChange'
];
  
const FullScreenEventType = {
    ENTERFULLSCREEN: 'enterfullscreen',
    LEAVEFULLSCREEN: 'leavefullscreen'
};

const isFullScreenSupported = function() {
    const body = document.body;
    
    return !!(
        body['webkitRequestFullscreen'] ||
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
        document.exitFullscreen();
    }else if(document['msExitFullscreen']) {
        document['msExitFullscreen']();
    }else if(document['webkitExitFullscreen']) {
        document['webkitExitFullscreen']();
    }
}

export {
    events,
    FullScreenEventType,
    isFullScreenSupported,
    isFullScreen,
    requestFullScreen,
    requestFullScreenWithKeys,
    exitFullScreen
};