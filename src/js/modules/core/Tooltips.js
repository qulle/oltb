import 'tippy.js/dist/tippy.css';
import tippy from 'tippy.js';
import CONFIG from './Config';
import { delegate, createSingleton } from 'tippy.js';
import { MAP_ELEMENT } from './ElementReferences';
import { isHorizontal } from '../helpers/IsRowDirection';
import { EVENTS } from '../helpers/constants/Events';
import { colorPicker, onColorPickerTooltipShow } from './ColorPicker';

// (1). Create tippy singleton for the Toolbar
const toolButtonsTippySingleton = createSingleton([], {
    placement: 'right',
    appendTo: MAP_ELEMENT,
    offset: [0, 12],
    theme: 'oltb'
});

// (2). Create delegate tippy instances for static and dynamic elements inside the MAP_ELEMENT
// Add class [.oltb-tippy] and the title attribute to activate the tooltip
const mapTippyDelegate = delegate(MAP_ELEMENT, {
    content(reference) {
        const title = reference.getAttribute('title');
        reference.removeAttribute('title');
        return title;
    },
    target: '.oltb-tippy',
    placement: 'top',
    appendTo: MAP_ELEMENT,
    theme: 'oltb oltb-themed',
    delay: [600, 100]
});

// (3). Create delegate tippy instances for triggering a color-picker inside the MAP_ELEMENT
// Add class [.oltb-color-tippy] to activate the tooltip and the attribute [data-oltb-color-target] with a selector as value
const colorTippyDelegate = delegate(MAP_ELEMENT, {
    target: '.oltb-color-tippy',
    placement: 'left',
    offset: [0, 25],
    trigger: 'click',
    appendTo: MAP_ELEMENT,
    theme: 'oltb oltb-inverted-themed',
    interactive: true,
    allowHTML: true,
    onShow(instance) {
        onColorPickerTooltipShow(instance);
    },
    onHide(instance) {
        colorPicker.off(EVENTS.Browser.Change);
    },
    onHidden(instance) {
        instance.setContent(null);
    }
});

// (4). Create event callback functions
const onPlacementChange = function(event) {
    toolButtonsTippySingleton.setProps({
        placement: (window.innerWidth <= CONFIG.deviceWidth.sm || isHorizontal()) ? 'bottom' : 'right'
    });
}

const onDOMContentLoaded = function(event) {
    toolButtonsTippySingleton.setInstances(tippy('.oltb-tool-button'));
    onPlacementChange(event);
}

// (5). Registrate event handlers
window.addEventListener(EVENTS.Custom.ToolbarDirectionChange, onPlacementChange);
window.addEventListener(EVENTS.Browser.Resize, onPlacementChange);
window.addEventListener(EVENTS.Browser.DOMContentLoaded, onDOMContentLoaded);

export {
    toolButtonsTippySingleton, 
    mapTippyDelegate, 
    colorTippyDelegate
};