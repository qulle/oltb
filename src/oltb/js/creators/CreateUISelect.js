import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';

const DefaultOptions = Object.freeze({
    idPrefix: '',
    idPostfix: '',
    text: '',
    options: [],
    value: undefined
});

const createUISelect = function(options = {}) {
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

    const select = DOM.createElement({
        element: 'select', 
        id: `${options.idPrefix}${options.idPostfix}`,
        class: 'oltb-select'
    });

    options.options.forEach((item) => {
        const option = DOM.createElement({
            element: 'option', 
            text: item.text, 
            value: item.value
        });

        DOM.appendChildren(select, [
            option
        ]);
    });

    select.value = options.value ?? select.firstElementChild.value;

    DOM.appendChildren(wrapper, [
        label,
        select
    ]);

    return [ wrapper, select ];
}

export { createUISelect };