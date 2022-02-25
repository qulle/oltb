import { mapElement } from './MapElement';

const toastElement = document.createElement('div');
toastElement.setAttribute('id', 'oltb-toast-container');

mapElement.appendChild(toastElement);

export { toastElement }