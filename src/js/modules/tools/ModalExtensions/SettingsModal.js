import ModalBase from '../../common/Modals/ModalBase';
import SettingsManager from '../../core/Managers/SettingsManager';
import DOM from '../../helpers/Browser/DOM';

class SettingsModal extends ModalBase {
    constructor(options = {}) {
        super('Settings', options.onClose);

        const modalContent = DOM.createElement({
            element: 'div',
            class: 'oltb-modal__content'
        });

        const interactions = SettingsManager.getSettings();
        
        interactions.forEach((valueObj, key) => {
            const checkboxWrapper = DOM.createElement({
                element: 'div',
                class: 'oltb-checkbox-wrapper'
            });

            const label = DOM.createElement({
                element: 'label',
                text: valueObj.text,
                class: 'oltb-checkbox-wrapper__title oltb-label--inline oltb-m-0',
                attributes: {
                    for: key
                }
            });

            const checkbox = DOM.createElement({
                element: 'input',
                id: key,
                class: 'oltb-checkbox-wrapper__checkbox',
                attributes: {
                    type: 'checkbox'
                },
                listeners: {
                    'click': () => SettingsManager.setSetting(key, checkbox.checked)
                }
            });

            if(valueObj.state) {
                checkbox.setAttribute('checked', '');
            }

            DOM.appendChildren(checkboxWrapper, [
                checkbox, 
                label
            ]);
            
            modalContent.appendChild(checkboxWrapper);
        });

        this.show(modalContent);
    }
}

export default SettingsModal;