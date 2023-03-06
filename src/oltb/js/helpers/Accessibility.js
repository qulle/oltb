import { KEYS } from './constants/Keys';
import { CONFIG } from '../core/Config';
import { EVENTS } from './constants/Events';
import { LogManager } from '../core/managers/LogManager';
import { UrlManager } from '../core/managers/UrlManager';
import { TOOLBAR_ELEMENT, TOOLBOX_ELEMENT, MAP_ELEMENT } from '../core/elements/index';

const FILENAME = 'helpers/Accessibility.js';

// Set version as custom attribute to the html element
document.documentElement.setAttribute('oltb-version', CONFIG.Version);
LogManager.logInformation(FILENAME, 'fileScope', `Running version ${CONFIG.Version}`);

const isDebug = UrlManager.getParameter('debug') === 'true';
if(Boolean(isDebug)) {
    LogManager.logInformation(FILENAME, 'fileScope', 'Debugging');
}

// Remove default contextmenu, show if the get parameter ?debug=true exists
MAP_ELEMENT.addEventListener(EVENTS.Browser.ContextMenu, function(event) {
    if(!Boolean(isDebug)) {
        event.preventDefault();
    }
});

// Toggle class to be used in the SCSS to apply custom style only when the user uses the keyboard
document.body.addEventListener(EVENTS.Browser.MouseDown, function(event) {
    document.body.classList.remove('oltb-using-keyboard');
});

document.body.addEventListener(EVENTS.Browser.KeyDown, function(event) {
    if(event.key.toLowerCase() === KEYS.Tab) {
        document.body.classList.add('oltb-using-keyboard');
    }
});

// When toolbar is in horizontal mode check if it collides with the toolbox
const collisionDetection = function(event) {
    const windowWidth = window.innerWidth;
    const toolbarWidth = TOOLBAR_ELEMENT.offsetWidth;
    const toolboxWidth = TOOLBOX_ELEMENT.offsetWidth;
    
    if(windowWidth - ((3 * CONFIG.Browser.REM) + toolbarWidth + toolboxWidth) <= 0) {
        TOOLBOX_ELEMENT.classList.add('oltb-toolbox-container--collision');
    }else {
        TOOLBOX_ELEMENT.classList.remove('oltb-toolbox-container--collision');
    }
}

window.addEventListener(EVENTS.Browser.Resize, collisionDetection);
window.addEventListener(EVENTS.Browser.ContentLoaded, collisionDetection);
window.addEventListener(EVENTS.Custom.ToolbarDirectionChange, collisionDetection);