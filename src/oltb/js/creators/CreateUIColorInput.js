import _ from "lodash";
import { DOM } from "../helpers/browser/DOM";

const DefaultOptions = Object.freeze({
    idPrefix: '',
    idPostfix: '',
    text: '',
    color: ''
});

const createUIColorInput = function(options = {}) {
    options = _.merge(_.cloneDeep(DefaultOptions), options);

    const wrapper = DOM.createElement({
        element: 'div',
        class: 'oltb-mt-0625'
    });

    const label = DOM.createElement({
        element: 'label', 
        text: options.text,
        class: 'oltb-label', 
        attributes: {
            'for': `${options.idPrefix}${options.idPostfix}`
        }
    });

    const input = DOM.createElement({
        element: 'div',
        id: `${options.idPrefix}${options.idPostfix}`,
        class: 'oltb-color-input oltb-color-tippy',
        attributes: {
            'tabindex': 0,
            'data-oltb-color-target': `#${options.idPrefix}${options.idPostfix}`,
            'data-oltb-color': options.color
        }
    });

    const inputInner = DOM.createElement({
        element: 'div',
        style: `background-color: ${options.color}`,
        class: 'oltb-color-input__inner'
    });

    DOM.appendChildren(input, [
        inputInner
    ]);

    DOM.appendChildren(wrapper, [
        label,
        input
    ]);

    return [wrapper, input];
}

export { createUIColorInput };