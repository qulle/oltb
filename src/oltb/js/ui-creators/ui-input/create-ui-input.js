import _ from 'lodash';
import { DOM } from '../../browser-helpers/dom-factory';

const DefaultOptions = Object.freeze({
    idPrefix: '',
    idPostfix: '',
    text: '',
    value: '',
    placeholder: ''
});

const createUIInput = function(options = {}) {
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
        element: 'input', 
        id: `${options.idPrefix}${options.idPostfix}`,
        class: 'oltb-input',
        value: options.value, 
        attributes: {
            'type': 'text',
            'placeholder': options.placeholder
        }
    });

    DOM.appendChildren(wrapper, [
        label,
        input
    ]);

    return [ wrapper, input ];
}

export { createUIInput };