import { DOM } from '../helpers/browser/DOM';
import { Config } from '../core/Config';
import { Overlay } from 'ol';

const CLASS_OVERLAY_TOOLTIP = 'oltb-overlay-tooltip';

const createUITooltip = function(data = '') {
    const tooltip = DOM.createElement({
        element: 'div',
        class: CLASS_OVERLAY_TOOLTIP
    });

    const item = DOM.createElement({
        html: data,
        element: 'span',
        class: `${CLASS_OVERLAY_TOOLTIP}__item`
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