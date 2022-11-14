import StateManager from "../managers/StateManager";
import { EVENTS } from "../../helpers/constants/Events";

const TOOLBAR_ELEMENT = document.getElementById('oltb');
TOOLBAR_ELEMENT.setAttribute('data-html2canvas-ignore', 'true');

// (1). Check if the user has chosen dark theme
const isLSDarkTheme = (StateManager.getStateObject('theme') === 'dark');
if(isLSDarkTheme) {
    TOOLBAR_ELEMENT.classList.add('dark');
}

// (2). Check if the user has chosen light theme 
const isLSLightTheme = (StateManager.getStateObject('theme') === 'light');
if(isLSLightTheme) {
    TOOLBAR_ELEMENT.classList.remove('dark');
}

// (3). Check if the user has chosen horizontal layout 
const isLSHorizontal = (StateManager.getStateObject('direction') === 'row');
if(isLSHorizontal) {
    TOOLBAR_ELEMENT.classList.add('row');
}

// (4). Check if the user has chosen vertical layout 
const isLSVertical = (StateManager.getStateObject('direction') === 'col');
if(isLSVertical) {
    TOOLBAR_ELEMENT.classList.remove('row');
}

// (5). Add dark class to body, this will control the color for the entire project
if(TOOLBAR_ELEMENT.classList.contains('dark')) {
    document.body.classList.add('oltb-dark');
}

// (6). For consistency also add the row class to the body
if(TOOLBAR_ELEMENT.classList.contains('row')) {
    document.body.classList.add('oltb-row');
}

// (7). Change how the scrollwheel behaves when toolbar is in horizontal mode
TOOLBAR_ELEMENT.addEventListener(EVENTS.Browser.Wheel, function(event) {
    if(!event.ctrlKey) {
        this.scrollLeft += event.deltaY > 0 ? 100 : -100;
    }
});

export { TOOLBAR_ELEMENT };