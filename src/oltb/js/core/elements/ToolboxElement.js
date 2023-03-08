import { DOM } from '../../helpers/browser/DOM';
import { CONFIG } from '../Config';
import { EVENTS } from '../../helpers/constants/Events';
import { MAP_ELEMENT, TOOLBAR_ELEMENT } from './index';

const FILENAME = 'elements/ToolboxElement.js';
const TOOLBOX_ELEMENT = DOM.createElement({
    element: 'div', 
    class: 'oltb-toolbox-container',
    attributes: {
        'data-html2canvas-ignore': 'true'
    }
});

MAP_ELEMENT.appendChild(TOOLBOX_ELEMENT);

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

export { TOOLBOX_ELEMENT };