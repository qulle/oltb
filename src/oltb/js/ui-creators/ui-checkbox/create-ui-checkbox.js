import _ from 'lodash';
import { DOM } from '../../browser-helpers/dom-factory';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';

const CLASS__CHECKBOX_WRAPPER = 'oltb-checkbox-wrapper';

const DefaultOptions = Object.freeze({
    idPrefix: '',
    idPostfix: '',
    i18nKey: undefined,
    text: '',
    checked: false,
    bottomMargin: false,
    listeners: []
});

const createUICheckbox = function(options = {}) {
    options = _.merge(_.cloneDeep(DefaultOptions), options);

    const wrapper = DOM.createElement({
        element: 'div',
        class: `${CLASS__CHECKBOX_WRAPPER} ${ options.bottomMargin 
            ? `${CLASS__CHECKBOX_WRAPPER}--margin` 
            : ''
        }`
    });

    // Note:
    // If the i18nKey is specified, the language must be fetched
    // The key is also appended to the title and message element
    // so that a active toast can do a hot-swap of the displayed language
    if(options.i18nKey) {
        options.text = TranslationManager.get(options.i18nKey);
    }

    const label = DOM.createElement({
        element: 'label',
        text: options.text,
        class: `${CLASS__CHECKBOX_WRAPPER}__title oltb-label--inline oltb-m-0`,
        attributes: {
            'for': `${options.idPrefix}${options.idPostfix}`,
            ...(options.i18nKey && {
                'data-oltb-i18n': options.i18nKey
            })
        }
    });

    const checkbox = DOM.createElement({
        element: 'input',
        id: `${options.idPrefix}${options.idPostfix}`,
        class: `${CLASS__CHECKBOX_WRAPPER}__checkbox`,
        attributes: {
            'type': 'checkbox'
        }
    });

    if(options.checked) {
        checkbox.setAttribute('checked', '');
    }

    // Note:
    // Attach given callbacks, given as object or list of
    for(const listener in options.listeners) {
        const callbacks = options.listeners[listener];

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