import { LogManager } from '../../managers/LogManager';

const FILENAME = 'browser/Fullscreen.js';

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
    const body = window.document.body;
    
    const supported = !!(
        (body['webkitRequestFullscreen']) ||
        (body['msRequestFullscreen'] && document['msFullscreenEnabled']) ||
        (body.requestFullscreen && window.document.fullscreenEnabled)
    );

    if(!supported) {
        LogManager.logWarning(FILENAME, 'isFullScreenSupported', 'FullScreen is not supported by browser');
    }
        
    return supported;
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