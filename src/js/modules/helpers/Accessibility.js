import CONFIG from '../core/Config';
import { toolbarElement, toolboxElement, mapElement } from '../core/ElementReferences';
import { URIGet } from '../helpers/Browser/URIGet';
import { EVENTS } from './Constants/Events';

// Append version as custom attribute to the html element
document.documentElement.setAttribute('oltb-version', CONFIG.version);

// Remove default contextmenu, show if the get parameter ?debug=true exists
const debugParameter = URIGet('debug') === 'true';
mapElement.addEventListener(EVENTS.Browser.ContextMenu, function(event) {
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
    const toolbarWidth = toolbarElement.offsetWidth;
    const toolboxWidth = toolboxElement.offsetWidth;
    const rem = 16;
    
    if(windowWidth - ((3 * rem) + toolbarWidth + toolboxWidth) <= 0) {
        toolboxElement.classList.add('oltb-toolbox-container--collision');
    }else {
        toolboxElement.classList.remove('oltb-toolbox-container--collision');
    }
}

window.addEventListener(EVENTS.Browser.Resize, collisionDetection);
window.addEventListener(EVENTS.Browser.DOMContentLoaded, collisionDetection);
window.addEventListener(EVENTS.Custom.ToolbarDirectionChange, collisionDetection);