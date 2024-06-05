import { DOM } from '../../browser-helpers/dom-factory';
import { Overlay } from 'ol';
import { ConfigManager } from '../../toolbar-managers/config-manager/config-manager';

const CLASS__OVERLAY_TOOLTIP = 'oltb-overlay-tooltip';

const createUITooltip = function(data = '') {
    const tooltip = DOM.createElement({
        element: 'div',
        class: CLASS__OVERLAY_TOOLTIP
    });

    const item = DOM.createElement({
        element: 'span',
        html: data,
        class: `${CLASS__OVERLAY_TOOLTIP}__item`
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
        getPositioin: () => {
            return overlay.getPosition();
        },
        setData: (data) => {
            item.innerHTML = data;
        },
        getData: () => {
            return item.innerHTML;
        }
    };
}

export { createUITooltip };