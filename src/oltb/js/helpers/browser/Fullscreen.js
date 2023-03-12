import { LogManager } from '../../core/managers/LogManager';

const FILENAME = 'browser/Fullscreen.js';

const FullscreenEvents = Object.freeze([
    'fullscreenchange',
    'webkitfullscreenchange',
    'MSFullscreenChange'
]);

const FullscreenEventType = Object.freeze({
    enterFullScreen: 'enterfullscreen',
    leaveFullScreen: 'leavefullscreen'
});

const isFullScreenSupported = function() {
    const body = document.body;
    
    const supported = !!(
        (body['webkitRequestFullscreen']) ||
        (body['msRequestFullscreen'] && document['msFullscreenEnabled']) ||
        (body.requestFullscreen && document.fullscreenEnabled)
    );

    if(!supported) {
        LogManager.logWarning(FILENAME, 'isFullScreenSupported', 'FullScreen is not supported in browser');
    }
        
    return supported;
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
    FullscreenEvents,
    FullscreenEventType,
    isFullScreenSupported,
    isFullScreen,
    requestFullScreen,
    requestFullScreenWithKeys,
    exitFullScreen
};