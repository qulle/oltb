import _ from "lodash";
import { DOM } from "../helpers/browser/DOM";

const DefaultOptions = Object.freeze({
    idPrefix: '',
    idPostfix: '',
    text: '',
    checked: false
});

const createUICheckbox = function(options = {}) {
    options = _.merge(_.cloneDeep(DefaultOptions), options);

    const wrapper = DOM.createElement({
        element: 'div',
        class: 'oltb-checkbox-wrapper'
    });

    const label = DOM.createElement({
        element: 'label',
        text: options.text,
        class: 'oltb-checkbox-wrapper__title oltb-label--inline oltb-m-0',
        attributes: {
            'for': `${options.idPrefix}${options.idPostfix}`
        }
    });

    const checkbox = DOM.createElement({
        element: 'input',
        id: `${options.idPrefix}${options.idPostfix}`,
        class: 'oltb-checkbox-wrapper__checkbox',
        attributes: {
            'type': 'checkbox'
        }
    });

    if(options.checked) {
        checkbox.setAttribute('checked', '');
    }

    DOM.appendChildren(wrapper, [
        checkbox, 
        label
    ]);

    return [ wrapper, checkbox ];
}

export { createUICheckbox };