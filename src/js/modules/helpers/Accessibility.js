import Config from '../core/Config';
import { toolbarElement, toolboxElement, mapElement } from '../core/ElementReferences';

// Append version as custom attribute to the html element
document.documentElement.setAttribute('oltb-version', Config.version);

// Remove default contextmenu
mapElement.oncontextmenu = function(event) { 
    return false; 
};

// Accessibility help
// This will toggle the class using-keyboard on the body,
// that class can then be used in the SASS to apply custom focus/active style only when the user uses the keyboard
document.body.addEventListener('mousedown', function(event) {
    document.body.classList.remove('oltb-using-keyboard');
});

document.body.addEventListener('keydown', function(event) {
    if(event.key === 'Tab') {
        document.body.classList.add('oltb-using-keyboard');
    }
});

// Change how the scrollwheel behaves
window.addEventListener('wheel', function(event) {
    if(!event.ctrlKey) {
        if(event.deltaY > 0) {
            toolbarElement.scrollLeft += 100;
        }else {
            toolbarElement.scrollLeft -= 100;
        }
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

window.addEventListener('resize', collisionDetection);
window.addEventListener('DOMContentLoaded', collisionDetection);
window.addEventListener('oltb.toolbar.direction.change', collisionDetection);