import ModalBase from '../../common/modals/ModalBase';
import SettingsManager from '../../core/managers/SettingsManager';
import DOM from '../../helpers/Browser/DOM';

class SettingsModal extends ModalBase {
    constructor(options = {}) {
        super('Settings', options.onClose);

        const modalContent = DOM.createElement({
            element: 'div',
            class: 'oltb-modal__content'
        });

        const settings = SettingsManager.getSettings();
        
        settings.forEach((settingObj, key) => {
            const checkboxWrapper = DOM.createElement({
                element: 'div',
                class: 'oltb-checkbox-wrapper'
            });

            const label = DOM.createElement({
                element: 'label',
                text: settingObj.text,
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

            if(settingObj.state) {
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