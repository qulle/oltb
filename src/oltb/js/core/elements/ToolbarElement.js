import CONFIG from "../Config";
import StateManager from "../managers/StateManager";
import { EVENTS } from "../../helpers/constants/Events";
import { LOCAL_STORAGE_KEYS } from '../../helpers/constants/LocalStorageKeys';

const directionKey = LOCAL_STORAGE_KEYS.DirectionTool;
const themeKey = LOCAL_STORAGE_KEYS.ThemeTool;

const TOOLBAR_ELEMENT = document.getElementById('oltb');
TOOLBAR_ELEMENT.setAttribute('data-html2canvas-ignore', 'true');

// Check if the user has chosen dark theme
const isLSDarkTheme = (StateManager.getStateObject(themeKey) === 'dark');
if(isLSDarkTheme) {
    TOOLBAR_ELEMENT.classList.add('dark');
}

// Check if the user has chosen light theme 
const isLSLightTheme = (StateManager.getStateObject(themeKey) === 'light');
if(isLSLightTheme) {
    TOOLBAR_ELEMENT.classList.remove('dark');
}

// Check if the user has chosen horizontal layout 
const isLSHorizontal = (StateManager.getStateObject(directionKey) === 'row');
if(isLSHorizontal) {
    TOOLBAR_ELEMENT.classList.add('row');
}

// Check if the user has chosen vertical layout 
const isLSVertical = (StateManager.getStateObject(directionKey) === 'col');
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
        const distance = CONFIG.scrollDistance;
        this.scrollLeft += event.deltaY > 0 ? distance : -distance;
    }
});

export { TOOLBAR_ELEMENT };