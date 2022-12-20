import { DOM } from '../../helpers/browser/DOM';
import { MAP_ELEMENT } from './MapElement';

const TOAST_ELEMENT = DOM.createElement({
    element: 'div', 
    class: 'oltb-toast-container',
    attributes: {
        'data-html2canvas-ignore': 'true'
    }
});

MAP_ELEMENT.appendChild(TOAST_ELEMENT);

export { TOAST_ELEMENT }