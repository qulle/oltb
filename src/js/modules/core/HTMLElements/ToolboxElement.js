import DOM from '../../helpers/Browser/DOM';
import { mapElement } from './MapElement';

const toolboxElement = DOM.createElement({
    element: 'div', 
    class: 'oltb-toolbox-container'
});

mapElement.appendChild(toolboxElement);

export { toolboxElement };