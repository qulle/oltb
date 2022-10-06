import CONFIG from './Config';
import DOM from '../helpers/browser/DOM';
import { isHorizontal } from '../helpers/IsRowDirection';
import { EVENTS } from '../helpers/constants/Events';
import { eventDispatcher } from '../helpers/Browser/EventDispatcher';

const AColorPicker = require('a-color-picker');

// (1). Create element to host ACP instance
const colorPickerElement = DOM.createElement({
    element: 'div', 
    id: 'otlb-color-picker',
    class: 'oltb-mt-0313 oltb-mb-0313',
    attributes: {
        'acp-color': '#D7E3FA',
        'acp-show-alpha': 'yes',
        'acp-show-rgb': 'no',
        'acp-show-hsl': 'no',
        'acp-show-hex': 'yes',
        'acp-palette': '#FFFFFF|#D7E3FA|#6397C2|#0166A5|#BCFAF4|#3CAEA3|#007C70|#FFF1C5|#FBDD83|#FBBD02|#FFDDBC|#FCBE80|#FCBE80|#F67D2C|#FDB5B4|#E96B69|#EB4542|#D3D9E6|#959DAD|#3B4352|#000000'
    }
});

// (2). Create the ACP instance
const colorPicker = AColorPicker.createPicker(colorPickerElement);

// (3). Callback function for Tooltip onShow ACP
const onColorPickerTooltipShow = function(instance) {
    instance.setProps({
        placement: (window.innerWidth <= CONFIG.deviceWidth.sm || isHorizontal()) ? 'bottom' : 'left'
    });

    const selector = instance.reference.getAttribute('data-oltb-color-target');
    const target = document.querySelector(selector);

    instance.setContent(colorPickerElement);

    colorPicker.setColor(instance.reference.getAttribute('data-oltb-color'));
    colorPicker.on(EVENTS.Browser.Change, (picker, color) => {
        // Important to be always be HEX with Alpha value, sometimes the two last digits are replaced with fixed alpha value
        color = AColorPicker.parseColor(color, 'hexcss4');

        // Update color on the ColorPicker
        target.setAttribute('data-oltb-color', color);
        target.firstElementChild.style.backgroundColor = color;

        // Dispatch event to let tools know that color has changed.
        eventDispatcher([instance.reference], EVENTS.Custom.ColorChange);
    });
}

export {
    colorPicker,
    onColorPickerTooltipShow
};