import DOM from '../../helpers/Browser/DOM';
import { mapElement } from './MapElement';

const toastElement = DOM.createElement({
    element: 'div', 
    class: 'oltb-toast-container'
});

mapElement.appendChild(toastElement);

export { toastElement }