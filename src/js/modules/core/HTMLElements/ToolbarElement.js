import StateManager from "../Managers/StateManager";
import { EVENTS } from "../../helpers/Constants/Events";

const TOOLBAR_ELEMENT = document.getElementById('oltb');
TOOLBAR_ELEMENT.setAttribute('data-html2canvas-ignore', 'true');

// Check if the user hav chosen dark theme
const isLSDarkTheme = (StateManager.getStateObject('theme') === 'dark');
if(isLSDarkTheme) {
    TOOLBAR_ELEMENT.classList.add('dark');
}

// Check if the user hav chosen light theme 
const isLSLightTheme = (StateManager.getStateObject('theme') === 'light');
if(isLSLightTheme) {
    TOOLBAR_ELEMENT.classList.remove('dark');
}

// Check if the user hav chosen horizontal layout 
const isLSHorizontal = (StateManager.getStateObject('direction') === 'row');
if(isLSHorizontal) {
    TOOLBAR_ELEMENT.classList.add('row');
}

// Check if the user hav chosen vertical layout 
const isLSVertical = (StateManager.getStateObject('direction') === 'col');
if(isLSVertical) {
    TOOLBAR_ELEMENT.classList.remove('row');
}

// Add dark class to body, this will control the color for the entire project
if(TOOLBAR_ELEMENT.classList.contains('dark')) {
    document.body.classList.add('oltb-dark');
}

// For consistency also add the row class to the body
if(TOOLBAR_ELEMENT.classList.contains('row')) {
    document.body.classList.add('oltb-row');
}

// Change how the scrollwheel behaves when toolbar is in horizontal mode
TOOLBAR_ELEMENT.addEventListener(EVENTS.Browser.Wheel, function(event) {
    if(!event.ctrlKey) {
        this.scrollLeft += event.deltaY > 0 ? 100 : -100;
    }
});

export { TOOLBAR_ELEMENT };