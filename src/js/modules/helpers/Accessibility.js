import URLManager from '../core/Managers/URLManager';
import CONFIG from '../core/Config';
import { TOOLBAR_ELEMENT, TOOLBOX_ELEMENT, MAP_ELEMENT } from '../core/ElementReferences';
import { EVENTS } from './Constants/Events';

// Append version as custom attribute to the html element
document.documentElement.setAttribute('oltb-version', CONFIG.version);

// Remove default contextmenu, show if the get parameter ?debug=true exists
const debugParameter = URLManager.getParameter('debug') === 'true';
MAP_ELEMENT.addEventListener(EVENTS.Browser.ContextMenu, function(event) {
    if(!debugParameter) {
        event.preventDefault();
    }
});

// Accessibility help
// This will toggle the class using-keyboard on the body,
// that class can then be used in the SASS to apply custom focus/active style only when the user uses the keyboard
document.body.addEventListener(EVENTS.Browser.MouseDown, function(event) {
    document.body.classList.remove('oltb-using-keyboard');
});

document.body.addEventListener(EVENTS.Browser.KeyDown, function(event) {
    if(event.key.toLowerCase() === 'tab') {
        document.body.classList.add('oltb-using-keyboard');
    }
});

const collisionDetection = function(event) {
    const windowWidth = window.innerWidth;
    const toolbarWidth = TOOLBAR_ELEMENT.offsetWidth;
    const toolboxWidth = TOOLBOX_ELEMENT.offsetWidth;
    const rem = 16;
    
    if(windowWidth - ((3 * rem) + toolbarWidth + toolboxWidth) <= 0) {
        TOOLBOX_ELEMENT.classList.add('oltb-toolbox-container--collision');
    }else {
        TOOLBOX_ELEMENT.classList.remove('oltb-toolbox-container--collision');
    }
}

window.addEventListener(EVENTS.Browser.Resize, collisionDetection);
window.addEventListener(EVENTS.Browser.DOMContentLoaded, collisionDetection);
window.addEventListener(EVENTS.Custom.ToolbarDirectionChange, collisionDetection);