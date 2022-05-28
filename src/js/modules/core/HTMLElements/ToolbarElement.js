import StateManager from "../Managers/StateManager";

const toolbarElement = document.getElementById('oltb');

// Check if the user hav chosen dark theme
const isLSDarkTheme = (StateManager.getStateObject('theme') === 'dark');
if(isLSDarkTheme) {
    toolbarElement.classList.add('dark');
}

// Check if the user hav chosen light theme 
const isLSLightTheme = (StateManager.getStateObject('theme') === 'light');
if(isLSLightTheme) {
    toolbarElement.classList.remove('dark');
}

// Check if the user hav chosen horizontal layout 
const isLSHorizontal = (StateManager.getStateObject('direction') === 'row');
if(isLSHorizontal) {
    toolbarElement.classList.add('row');
}

// Check if the user hav chosen vertical layout 
const isLSVertical = (StateManager.getStateObject('direction') === 'col');
if(isLSVertical) {
    toolbarElement.classList.remove('row');
}

// Add dark class to body, this will control the color for the entire project
if(toolbarElement.classList.contains('dark')) {
    document.body.classList.add('oltb-dark');
}

// For consistency also add the row class to the body
if(toolbarElement.classList.contains('row')) {
    document.body.classList.add('oltb-row');
}

// Change how the scrollwheel behaves when toolbar is in horizontal mode
toolbarElement.addEventListener('wheel', function(event) {
    if(!event.ctrlKey) {
        this.scrollLeft += event.deltaY > 0 ? 100 : -100;
    }
});

export { toolbarElement };