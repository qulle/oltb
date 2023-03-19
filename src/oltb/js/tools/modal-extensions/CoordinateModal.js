import { DOM } from '../../helpers/browser/DOM';
import { ModalBase } from '../../common/modals/ModalBase';
import { isDarkTheme } from '../../helpers/IsDarkTheme';

const FILENAME = 'modal-extensions/CoordinateModal.js';
const ID_PREFIX = 'oltb-coordinates-modal';

const DefaultOptions = Object.freeze({
    maximized: false,
    onClose: undefined,
    onNavigate: undefined,
    onCancel: undefined
});

class CoordinateModal extends ModalBase {
    constructor(options = {}) {
        super(
            'Coordinates', 
            options.maximized, 
            options.onClose
        );
        
        this.options = { ...DefaultOptions, ...options };
        this.#createModal();
    }

    #createModal() {
        const latWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        const latLabel = DOM.createElement({
            element: 'label', 
            text: 'Latitud',
            class: 'oltb-label', 
            attributes: {
                for: `${ID_PREFIX}-lat`
            }
        });

        const latText = DOM.createElement({
            element: 'input',
            id: `${ID_PREFIX}-lat`,
            class: 'oltb-input',
            value: '',
            attributes: {
                placeholder: '51.5072',
                type: 'text'
            }
        });

        DOM.appendChildren(latWrapper, [
            latLabel,
            latText
        ]);

        const lonWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        const lonLabel = DOM.createElement({
            element: 'label', 
            text: 'Longitud', 
            class: 'oltb-label',
            attributes: {
                for: `${ID_PREFIX}-lon`
            }
        });

        const lonText = DOM.createElement({
            element: 'input',
            id: `${ID_PREFIX}-lon`,
            class: 'oltb-input',
            value: '',
            attributes: {
                placeholder: '0.1276',
                type: 'text'
            }
        });

        DOM.appendChildren(lonWrapper, [
            lonLabel,
            lonText
        ]);
        
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
            class: `oltb-dialog__btn oltb-btn ${
                isDarkTheme() ? 'oltb-btn--gray-mid' : 'oltb-btn--gray-dark'
            }`,
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

        const modalContent = DOM.createElement({
            element: 'div',
            class: 'oltb-modal__content'
        });

        const coordinatesLabel = DOM.createElement({
            element: 'label', 
            text: 'Coordinates are given in WGS84/EPSG:4326',
            class: 'oltb-label oltb-mt-1'
        });

        DOM.appendChildren(modalContent, [
            latWrapper,
            lonWrapper,
            coordinatesLabel,
            buttonsWrapper,
        ]);

        this.show(modalContent);
    }
}

export { CoordinateModal };