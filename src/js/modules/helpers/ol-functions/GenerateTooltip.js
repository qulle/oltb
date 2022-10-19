import DOM from '../browser/DOM';
import { Overlay } from 'ol';

const generateTooltip = function(data = '') {
    const wrapper = DOM.createElement({
        element: 'div',
        class: 'oltb-overlay-tooltip'
    });

    const item = DOM.createElement({
        html: data,
        element: 'span',
        class: 'oltb-overlay-tooltip__item'
    });

    wrapper.appendChild(item);

    const overlay = new Overlay({
        element: wrapper,
        offset: [0, -7],
        positioning: 'bottom-center'
    });

    return {
        getOverlay: () => {
            return overlay;
        },
        setPosition: (position) => {
            overlay.setPosition(position);
        },
        setData: (data) => {
            item.innerHTML = data;
        }
    };
}

export { generateTooltip };