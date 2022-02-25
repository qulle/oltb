import ModalBase from '../../common/Modals/ModalBase';
import SettingsManager from '../../core/Managers/SettingsManager';
import DOM from '../../helpers/DOM';

class SettingsModal extends ModalBase {
    constructor() {
        super('Settings');

        const documentfragment = document.createDocumentFragment();
        const interactions = SettingsManager.getSettings();
        
        interactions.forEach((valueObj, key) => {
            const checkboxWrapper = DOM.createElement({element: 'div',
                attributes: {
                    class: 'oltb-checkbox-wrapper'
                }
            });

            const label = DOM.createElement({element: 'label',
                text: valueObj.text,
                attributes: {
                    class: 'oltb-checkbox-wrapper__title oltb-label--inline oltb-m-0',
                    for: key
                }
            });

            const checkbox = DOM.createElement({element: 'input',
                attributes: {
                    class: 'oltb-checkbox-wrapper__checkbox',
                    id: key,
                    type: 'checkbox'
                }
            });

            if(valueObj.state) {
                checkbox.setAttribute('checked', '');
            }

            checkbox.addEventListener('change', function(event) {
                SettingsManager.setSetting(key, this.checked);
            });

            DOM.appendChildren(checkboxWrapper, [checkbox, label]);

            documentfragment.appendChild(checkboxWrapper);
        });

        this.show(documentfragment);
    }
}

export default SettingsModal;