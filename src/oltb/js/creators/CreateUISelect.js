import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';
import { Events } from '../helpers/constants/Events';

const DefaultOptions = Object.freeze({
    idPrefix: '',
    idPostfix: '',
    text: '',
    options: [],
    value: undefined,
    default: undefined
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
        class: 'oltb-label oltb-label--inline-block',  
        attributes: {
            'for': `${options.idPrefix}${options.idPostfix}`
        }
    });

    if(options.default) {
        label.classList.add('oltb-label--clickable');
    }

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

    // Note:
    // To reset to the default selected item the user can press the label
    if(options.default) {
        label.addEventListener(Events.browser.click, (event) => {
            select.value = options.default
        });
    }

    DOM.appendChildren(wrapper, [
        label,
        select
    ]);

    return [ wrapper, select ];
}

export { createUISelect };