import 'tippy.js/dist/tippy.css';
import tippy from 'tippy.js';
import DOM from '../helpers/Browser/DOM';
import { delegate, createSingleton } from 'tippy.js';
import { mapElement } from './ElementReferences';
import { isHorizontal } from '../helpers/IsRowDirection';
import { eventDispatcher } from '../helpers/Browser/EventDispatcher';
import { EVENTS } from '../helpers/Constants/Events';

const AColorPicker = require('a-color-picker');

// Create tippy singleton for toolbar
const toolButtonsTippySingleton = createSingleton([], {
    placement: 'right',
    appendTo: mapElement,
    moveTransition: 'transform 0.2s ease-out',
    offset: [0, 12],
    theme: 'oltb'
});

// Delegate tippy instances for static and dynamic elements inside the #map
// Add class .oltb-tippy and the title attribute to activate the tooltip
const mapTippyDelegate = delegate(mapElement, {
    content(reference) {
        const title = reference.getAttribute('title');
        reference.removeAttribute('title');
        return title;
    },
    target: '.oltb-tippy',
    placement: 'top',
    appendTo: mapElement,
    theme: 'oltb oltb-themed',
    delay: [600, 100]
});

// Color-picker element to instantiate  the ACP.
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

// A singleton color-picker
const colorPicker = AColorPicker.createPicker(colorPickerElement);

// Delegate tippy instances for triggering a color-picker inside the #map
// Add class .oltb-color-tippy to activate the tooltip and the attribute data-oltb-color-target with a selector as value
const colorTippyDelegate = delegate(mapElement, {
    target: '.oltb-color-tippy',
    placement: 'left',
    offset: [0, 25],
    trigger: 'click',
    appendTo: mapElement,
    theme: 'oltb oltb-reversed-themed',
    interactive: true,
    allowHTML: true,
    onShow(instance) {
        // Placement help
        instance.setProps({
            placement: (window.innerWidth <= 576 || isHorizontal()) ? 'bottom' : 'left'
        });

        const selector = instance.reference.getAttribute('data-oltb-color-target');
        const target = document.querySelector(selector);

        instance.setContent(colorPickerElement);
        colorPicker.setColor(instance.reference.getAttribute('data-oltb-color'));
        colorPicker.on(EVENTS.Browser.Change, (picker, color) => {
            // Force to always produce with alpha value
            // Important to be hex. Sometimes the two last digits are replaced with  fixed alpha value
            color = AColorPicker.parseColor(color, 'hexcss4');

            // Update color on the ColorPicker
            target.setAttribute('data-oltb-color', color);
            target.firstElementChild.style.backgroundColor = color;

            // Dispatch event to let tools know that color has changed.
            eventDispatcher([instance.reference], 'oltb.color.change');
        });
    },
    onHide(instance) {
        colorPicker.off(EVENTS.Browser.Change);
    },
    onHidden(instance) {
        instance.setContent(null);
    }
});

// Change direction for toolbutton tooltip on smaller devices
const tooltipPlacement = function(event) {
    toolButtonsTippySingleton.setProps({
        placement: (window.innerWidth <= 576 || isHorizontal()) ? 'bottom' : 'right'
    });
}

const initTooltipsWhenDOMContentLoaded = function(event) {
    toolButtonsTippySingleton.setInstances(tippy('.oltb-tool-button'));
    tooltipPlacement(event);
}

window.addEventListener(EVENTS.Browser.Resize, tooltipPlacement);
window.addEventListener(EVENTS.Browser.DOMContentLoaded, initTooltipsWhenDOMContentLoaded);
window.addEventListener(EVENTS.Custom.ToolbarDirectionChange, tooltipPlacement);

export {
    toolButtonsTippySingleton, 
    mapTippyDelegate, 
    colorTippyDelegate
};