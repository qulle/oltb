import { mapElement } from './MapElement';

// Create toolbox element to add each separate tools parameters to
const toolboxElement = document.createElement('div');
toolboxElement.className = 'oltb-toolbox-container';

// Add the toolbox to the ol-map
mapElement.appendChild(toolboxElement);

export { toolboxElement };