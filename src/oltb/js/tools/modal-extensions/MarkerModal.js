import { DOM } from '../../helpers/browser/DOM';
import { SVG_PATHS } from '../../core/icons/GetIcon';
import { ModalBase } from '../../common/modals/ModalBase';
import { isDarkTheme } from '../../helpers/IsDarkTheme';

const FILENAME = 'modal-extensions/MarkerModal.js';
const ID_PREFIX = 'oltb-marker-modal-marker';
const DEFAULT_OPTIONS = Object.freeze({
    edit: false,
    coordinates: [0, 0],
    title: 'Marker',
    description: '',
    backgroundColor: '#0166A5FF',
    color: '#FFFFFFFF',
    icon: 'GeoPin.Filled',
    maximized: false,
    onClose: undefined,
    onCreate: undefined,
    onCancel: undefined
});

class MarkerModal extends ModalBase {
    constructor(options = {}) {
        super('Marker configuration', options.maximized, options.onClose);
        
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.#createModal();
    }

    #createModal() {
        const titleWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-m-0'
        });

        const titleLabel = DOM.createElement({
            element: 'label', 
            text: 'Title',
            class: 'oltb-label', 
            attributes: {
                for: `${ID_PREFIX}-title`
            }
        });

        const titleText = DOM.createElement({
            element: 'input', 
            id: `${ID_PREFIX}-title`,
            class: 'oltb-input',
            value: this.options.title,
            attributes: {
                type: 'text'
            }
        });

        DOM.appendChildren(titleWrapper, [
            titleLabel,
            titleText
        ]);

        const descriptionWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        const descriptionLabel = DOM.createElement({
            element: 'label', 
            text: 'Description',
            class: 'oltb-label', 
            attributes: {
                for: `${ID_PREFIX}-description`
            }
        });

        const descriptionText = DOM.createElement({
            element: 'input', 
            id: `${ID_PREFIX}-description`,
            class: 'oltb-input',
            value: this.options.description,
            attributes: {
                type: 'text',
                placeholder: 'Detailed description about the marker'
            }
        });

        DOM.appendChildren(descriptionWrapper, [
            descriptionLabel,
            descriptionText
        ]);

        const iconWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        const iconLabel = DOM.createElement({
            element: 'label', 
            text: 'Icon',
            class: 'oltb-label', 
            attributes: {
                for: `${ID_PREFIX}-icon`
            }
        });

        const iconSelect = DOM.createElement({
            element: 'select',
            id: `${ID_PREFIX}-icon`, 
            class: 'oltb-select'
        });
 
        for(const path in SVG_PATHS) {
            for(const version in SVG_PATHS[path]) {
                const option = DOM.createElement({
                    element: 'option', 
                    text: `${path} (${version})`, 
                    value: `${path}.${version}`
                });

                DOM.appendChildren(iconSelect, [
                    option
                ]);
            }
        }

        // Select the correct icon, fall back on GeoPin as default icon
        iconSelect.value = this.options.icon;

        DOM.appendChildren(iconWrapper, [
            iconLabel,
            iconSelect
        ]);

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
            value: this.options.coordinates[1],
            attributes: {
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
            value: this.options.coordinates[0],
            attributes: {
                type: 'text'
            }
        });

        DOM.appendChildren(lonWrapper, [
            lonLabel,
            lonText
        ]);

        const backgroundColorWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        const backgroundLabel = DOM.createElement({
            element: 'label', 
            text: 'Background color',
            class: 'oltb-label', 
            attributes: {
                for: `${ID_PREFIX}-background`
            }
        });

        const backgroundColorInput = DOM.createElement({
            element: 'div',
            id: `${ID_PREFIX}-background`,
            class: 'oltb-color-input oltb-color-tippy',
            attributes: {
                tabindex: 0,
                'data-oltb-color-target': `#${ID_PREFIX}-background`,
                'data-oltb-color': this.options.backgroundColor
            }
        });

        const backgroundColorInputInner = DOM.createElement({
            element: 'div',
            style: `background-color: ${this.options.backgroundColor}`,
            class: 'oltb-color-input__inner'
        });

        DOM.appendChildren(backgroundColorInput, [
            backgroundColorInputInner
        ]);

        DOM.appendChildren(backgroundColorWrapper, [
            backgroundLabel,
            backgroundColorInput
        ]);

        const colorWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625' 
        });

        const colorLabel = DOM.createElement({
            element: 'label', 
            text: 'Color',
            class: 'oltb-label', 
            attributes: {
                for: `${ID_PREFIX}-color`
            }
        });

        const colorInput = DOM.createElement({
            element: 'div',
            id: `${ID_PREFIX}-color`,
            class: 'oltb-color-input oltb-color-tippy',
            attributes: {
                tabindex: 0,
                'data-oltb-color-target': `#${ID_PREFIX}-color`,
                'data-oltb-color': this.options.color
            }
        });

        const colorInputInner = DOM.createElement({
            element: 'div',
            style: `background-color: ${this.options.color}`,
            class: 'oltb-color-input__inner'
        });

        DOM.appendChildren(colorInput, [
            colorInputInner
        ]);

        DOM.appendChildren(colorWrapper, [
            colorLabel,
            colorInput
        ]);

        const buttonsWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-d-flex oltb-justify-content-between oltb-mt-15'
        });

        const createButton = DOM.createElement({
            element: 'button', 
            text: `${this.options.edit ? 'Save changes' : 'Create marker'}`, 
            class: 'oltb-dialog__btn oltb-btn oltb-btn--green-mid',
            attributes: {
                type: 'button',
            },
            listeners: {
                'click': () => {
                    const response = {
                        title: titleText.value.trim(),
                        description: descriptionText.value.trim(),
                        icon: iconSelect.value,
                        latitude: parseFloat(latText.value),
                        longitude: parseFloat(lonText.value),
                        backgroundColor: backgroundColorInput.getAttribute('data-oltb-color'),
                        color: colorInput.getAttribute('data-oltb-color')
                    };
        
                    this.close();
                    typeof this.options.onCreate === 'function' && this.options.onCreate(response);
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
            createButton
        ]);

        const modalContent = DOM.createElement({
            element: 'div',
            class: 'oltb-modal__content'
        });
        
        DOM.appendChildren(modalContent, [
            titleWrapper,
            descriptionWrapper,
            iconWrapper,
            latWrapper,
            lonWrapper,
            backgroundColorWrapper,
            colorWrapper,
            buttonsWrapper
        ]);

        this.show(modalContent);
    }
}

export { MarkerModal };