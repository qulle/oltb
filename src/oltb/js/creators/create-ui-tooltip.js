import { DOM } from '../helpers/browser/DOM';
import { Overlay } from 'ol';
import { ConfigManager } from '../managers/ConfigManager';

const CLASS_OVERLAY_TOOLTIP = 'oltb-overlay-tooltip';

const createUITooltip = function(data = '') {
    const tooltip = DOM.createElement({
        element: 'div',
        class: CLASS_OVERLAY_TOOLTIP
    });

    const item = DOM.createElement({
        element: 'span',
        html: data,
        class: `${CLASS_OVERLAY_TOOLTIP}__item`
    });

    DOM.appendChildren(tooltip, [
        item
    ]);

    const overlayOffset = ConfigManager.getConfig().overlayOffset;
    const overlay = new Overlay({
        element: tooltip,
        positioning: 'bottom-center',
        offset: [
            overlayOffset.horizontal,
            overlayOffset.vertical
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