import DOM from '../../helpers/Browser/DOM';
import { MAP_ELEMENT } from './MapElement';

const TOOLBOX_ELEMENT = DOM.createElement({
    element: 'div', 
    class: 'oltb-toolbox-container'
});

MAP_ELEMENT.appendChild(TOOLBOX_ELEMENT);

export { TOOLBOX_ELEMENT };