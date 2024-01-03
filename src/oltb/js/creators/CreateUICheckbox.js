import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';

const CLASS_CHECKBOX_WRAPPER = 'oltb-checkbox-wrapper';

const DefaultOptions = Object.freeze({
    idPrefix: '',
    idPostfix: '',
    text: '',
    checked: false,
    bottomMargin: false
});

const createUICheckbox = function(options = {}) {
    options = _.merge(_.cloneDeep(DefaultOptions), options);

    const wrapper = DOM.createElement({
        element: 'div',
        class: `${CLASS_CHECKBOX_WRAPPER} ${ options.bottomMargin 
            ? `${CLASS_CHECKBOX_WRAPPER}--margin` 
            : ''
        }`
    });

    const label = DOM.createElement({
        element: 'label',
        text: options.text,
        class: `${CLASS_CHECKBOX_WRAPPER}__title oltb-label--inline oltb-m-0`,
        attributes: {
            'for': `${options.idPrefix}${options.idPostfix}`
        }
    });

    const checkbox = DOM.createElement({
        element: 'input',
        id: `${options.idPrefix}${options.idPostfix}`,
        class: `${CLASS_CHECKBOX_WRAPPER}__checkbox`,
        attributes: {
            'type': 'checkbox'
        }
    });

    if(options.checked) {
        checkbox.setAttribute('checked', '');
    }

    // Attach given listeners and callbacks
    for(const listener in options.listeners) {
        const callbacks = options.listeners[listener];

        // Note:
        // The callback(s) can be given as a single reference or as a array of many 
        if(Array.isArray(callbacks)) {
            callbacks.forEach((callback) => {
                checkbox.addEventListener(listener, callback);
            });
        }else {
            checkbox.addEventListener(listener, callbacks);
        }
    }

    DOM.appendChildren(wrapper, [
        checkbox, 
        label
    ]);

    return [ wrapper, checkbox ];
}

export { createUICheckbox };