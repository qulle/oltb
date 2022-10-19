import URLManager from '../core/managers/URLManager';
import CONFIG from '../core/Config';
import { TOOLBAR_ELEMENT, TOOLBOX_ELEMENT, MAP_ELEMENT } from '../core/ElementReferences';
import { EVENTS } from './constants/Events';

// (1). Set version as custom attribute to the html element
document.documentElement.setAttribute('oltb-version', CONFIG.version);

// (2). Remove default contextmenu, show if the get parameter ?debug=true exists
const debugParameter = URLManager.getParameter('debug') === 'true';
MAP_ELEMENT.addEventListener(EVENTS.Browser.ContextMenu, function(event) {
    if(!debugParameter) {
        event.preventDefault();
    }
});

// (3). Toggle class to be used in the SCSS to apply custom style only when the user uses the keyboard
document.body.addEventListener(EVENTS.Browser.MouseDown, function(event) {
    document.body.classList.remove('oltb-using-keyboard');
});

document.body.addEventListener(EVENTS.Browser.KeyDown, function(event) {
    if(event.key.toLowerCase() === 'tab') {
        document.body.classList.add('oltb-using-keyboard');
    }
});

// (4). When toolbar is in horizontal mode check if it collides with the toolbox
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