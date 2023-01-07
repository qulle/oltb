import { DOM } from '../helpers/browser/DOM';
import { CONFIG } from '../core/Config';
import { Overlay } from 'ol';

const generateTooltip = function(data = '') {
    const tooltip = DOM.createElement({
        element: 'div',
        class: 'oltb-overlay-tooltip'
    });

    const item = DOM.createElement({
        html: data,
        element: 'span',
        class: 'oltb-overlay-tooltip__item'
    });

    tooltip.appendChild(item);

    const overlay = new Overlay({
        element: tooltip,
        positioning: 'bottom-center',
        offset: [
            CONFIG.OverlayOffset.Horizontal,
            CONFIG.OverlayOffset.Vertical
        ]
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