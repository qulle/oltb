import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';
import { Events } from '../helpers/constants/Events';

const CLASS_COLOR_INPUT = 'oltb-color-input';

const DefaultOptions = Object.freeze({
    idPrefix: '',
    idPostfix: '',
    text: '',
    color: '',
    default: undefined
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
        class: 'oltb-label oltb-label--inline-block', 
        attributes: {
            'for': `${options.idPrefix}${options.idPostfix}`
        }
    });

    if(options.default) {
        label.classList.add('oltb-label--clickable');
    }

    const input = DOM.createElement({
        element: 'div',
        id: `${options.idPrefix}${options.idPostfix}`,
        class: `${CLASS_COLOR_INPUT} oltb-color-tippy`,
        attributes: {
            'tabindex': 0,
            'data-oltb-color-target': `#${options.idPrefix}${options.idPostfix}`,
            'data-oltb-color': options.color
        }
    });

    const inputInner = DOM.createElement({
        element: 'div',
        style: `background-color: ${options.color}`,
        class: `${CLASS_COLOR_INPUT}__inner`
    });

    // Note:
    // To reset to the default color the user can press the label
    if(options.default) {
        label.addEventListener(Events.browser.click, (event) => {
            input.setAttribute('data-oltb-color', options.default);
            inputInner.style.backgroundColor = options.default;
        });
    }

    DOM.appendChildren(input, [
        inputInner
    ]);

    DOM.appendChildren(wrapper, [
        label,
        input
    ]);

    return [ wrapper, input ];
}

export { createUIColorInput };