import DOM from '../../helpers/Browser/DOM';
import { MAP_ELEMENT } from './MapElement';

const TOAST_ELEMENT = DOM.createElement({
    element: 'div', 
    class: 'oltb-toast-container'
});

MAP_ELEMENT.appendChild(TOAST_ELEMENT);

export { TOAST_ELEMENT }