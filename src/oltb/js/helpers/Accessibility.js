import CONFIG from '../core/Config';
import URLManager from '../core/managers/URLManager';
import { KEYS } from './constants/Key';
import { EVENTS } from './constants/Events';
import { TOOLBAR_ELEMENT, TOOLBOX_ELEMENT, MAP_ELEMENT } from '../core/elements/index';

// Set version as custom attribute to the html element
document.documentElement.setAttribute('oltb-version', CONFIG.version);

// Remove default contextmenu, show if the get parameter ?debug=true exists
const debugParameter = URLManager.getParameter('debug') === 'true';
MAP_ELEMENT.addEventListener(EVENTS.browser.contextMenu, function(event) {
    if(!debugParameter) {
        event.preventDefault();
    }
});

// Toggle class to be used in the SCSS to apply custom style only when the user uses the keyboard
document.body.addEventListener(EVENTS.browser.mouseDown, function(event) {
    document.body.classList.remove('oltb-using-keyboard');
});

document.body.addEventListener(EVENTS.browser.keyDown, function(event) {
    if(event.key.toLowerCase() === KEYS.tab) {
        document.body.classList.add('oltb-using-keyboard');
    }
});

// When toolbar is in horizontal mode check if it collides with the toolbox
const collisionDetection = function(event) {
    const windowWidth = window.innerWidth;
    const toolbarWidth = TOOLBAR_ELEMENT.offsetWidth;
    const toolboxWidth = TOOLBOX_ELEMENT.offsetWidth;
    
    if(windowWidth - ((3 * CONFIG.rem) + toolbarWidth + toolboxWidth) <= 0) {
        TOOLBOX_ELEMENT.classList.add('oltb-toolbox-container--collision');
    }else {
        TOOLBOX_ELEMENT.classList.remove('oltb-toolbox-container--collision');
    }
}

window.addEventListener(EVENTS.browser.resize, collisionDetection);
window.addEventListener(EVENTS.browser.contentLoaded, collisionDetection);
window.addEventListener(EVENTS.custom.toolbarDirectionChange, collisionDetection);