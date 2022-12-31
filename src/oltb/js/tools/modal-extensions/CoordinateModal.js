import { DOM } from '../../helpers/browser/DOM';
import { ModalBase } from '../../common/modals/ModalBase';
import { isDarkTheme } from '../../helpers/IsDarkTheme';

const ID_PREFIX = 'oltb-coordinate-modal';
const DEFAULT_OPTIONS = Object.freeze({
    onClose: undefined,
    onNavigate: undefined,
    onCancel: undefined
});

class CoordinateModal extends ModalBase {
    #state = new Map();

    constructor(options = {}) {
        super('Coordinates', options.onClose);
        this.options = { ...DEFAULT_OPTIONS, ...options };

        const modalContent = DOM.createElement({
            element: 'div',
            class: 'oltb-modal__content'
        });

        // Create textbox for marker latitude
        const latWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        latWrapper.appendChild(DOM.createElement({
            element: 'label', 
            text: 'Latitud',
            class: 'oltb-label', 
            attributes: {
                for: `${ID_PREFIX}-marker-lat`
            }
        }));

        const latText = DOM.createElement({
            element: 'input',
            id: `${ID_PREFIX}-marker-lat`,
            class: 'oltb-input',
            value: '',
            attributes: {
                placeholder: '51.5072',
                type: 'text'
            }
        });

        latWrapper.appendChild(latText);

        // Create textbox for marker longitude
        const lonWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        lonWrapper.appendChild(DOM.createElement({
            element: 'label', 
            text: 'Longitud', 
            class: 'oltb-label',
            attributes: {
                for: `${ID_PREFIX}-marker-lon`
            }
        }));

        const lonText = DOM.createElement({
            element: 'input',
            id: `${ID_PREFIX}-marker-lon`,
            class: 'oltb-input',
            value: '',
            attributes: {
                placeholder: '0.1276',
                type: 'text'
            }
        });

        lonWrapper.appendChild(lonText);

        
        // Create buttons for create and cancel
        const buttonsWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-d-flex oltb-justify-content-between oltb-mt-15'
        });

        const navigateButton = DOM.createElement({
            element: 'button', 
            text: 'Navigate to',
            class: 'oltb-dialog__btn oltb-btn oltb-btn--green-mid', 
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': () => {
                    this.close();
                    typeof this.options.onNavigate === 'function' && this.options.onNavigate([
                        lonText.value,
                        latText.value
                    ]);
                }
            }
        });

        const cancelButton = DOM.createElement({
            element: 'button', 
            text: 'Cancel', 
            class: `oltb-dialog__btn oltb-btn ${isDarkTheme() ? 'oltb-btn--gray-mid' : 'oltb-btn--gray-dark'}`,
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': () => {
                    this.close();
                    typeof this.options.onCancel === 'function' && this.options.onCancel();
                }
            }
        });

        DOM.appendChildren(buttonsWrapper, [
            cancelButton,
            navigateButton
        ]);

        DOM.appendChildren(modalContent, [
            latWrapper,
            lonWrapper,
            buttonsWrapper,
        ]);

        this.show(modalContent);
    }
}

export { CoordinateModal };