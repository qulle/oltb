import { DOM } from '../helpers/browser/DOM';
import { Config } from '../core/Config';
import { Overlay } from 'ol';

const createUITooltip = function(data = '') {
    const tooltip = DOM.createElement({
        element: 'div',
        class: 'oltb-overlay-tooltip'
    });

    const item = DOM.createElement({
        html: data,
        element: 'span',
        class: 'oltb-overlay-tooltip__item'
    });

    DOM.appendChildren(tooltip, [
        item
    ]);

    const overlay = new Overlay({
        element: tooltip,
        positioning: 'bottom-center',
        offset: [
            Config.overlayOffset.horizontal,
            Config.overlayOffset.vertical
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

export { createUITooltip };