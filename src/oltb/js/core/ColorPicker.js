import * as AColorPicker from 'a-color-picker';
import { DOM } from '../helpers/browser/DOM';
import { CONFIG } from './Config';
import { EVENTS } from '../helpers/constants/Events';
import { isHorizontal } from '../helpers/IsRowDirection';
import { eventDispatcher } from '../helpers/browser/EventDispatcher';

const FILENAME = 'core/ColorPicker.js';

// Create element to host ACP instance
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
        'acp-palette': '#FFFFFF|#D7E3FA|#6397C2|#0166A5|#B1CAF6|#5B88D6|#2357B1|#D0CAFF|#9085E4|#493E9C|#FEE6FF|#E8A2EA|#914594|#BCF8FA|#56BABD|#00959A|#CEEEFF|#68B9E5|#0080C5|#BCFAF4|#3CAEA3|#007C70|#FFF1C5|#FBDD83|#FBBD02|#FFDDBC|#FCBE80|#F67D2C|#FDB5B4|#E96B69|#EB4542|#D3D9E6|#959DAD|#3B4352|#000000'
    }
});

// Create the ACP instance
const colorPicker = AColorPicker.createPicker(colorPickerElement);

const onColorPickerTooltipShow = function(instance) {
    instance.setProps({
        placement: (
            window.innerWidth <= CONFIG.DeviceWidth.SM || 
            isHorizontal()
        ) ? 'bottom' : 'left'
    });

    const selector = instance.reference.getAttribute('data-oltb-color-target');
    const target = document.querySelector(selector);

    instance.setContent(colorPickerElement);

    colorPicker.setColor(instance.reference.getAttribute('data-oltb-color'));
    colorPicker.on(EVENTS.Browser.Change, (picker, color) => {
        // Important to always be HEX with Alpha value
        // Sometimes the two last digits are replaced with fixed alpha value
        color = AColorPicker.parseColor(color, 'hexcss4');

        // Update color on the ACP instance
        target.setAttribute('data-oltb-color', color);
        target.firstElementChild.style.backgroundColor = color;

        eventDispatcher([instance.reference], EVENTS.Custom.ColorChange);
    });
}

export { colorPicker, onColorPickerTooltipShow };