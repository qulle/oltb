import { DOM } from '../../helpers/browser/DOM';
import { SvgPaths } from '../../core/icons/GetIcon';
import { ModalBase } from '../../common/modals/ModalBase';
import { isDarkTheme } from '../../helpers/IsDarkTheme';

const FILENAME = 'modal-extensions/MarkerModal.js';
const ID_PREFIX = 'oltb-marker-modal-marker';

const DefaultOptions = Object.freeze({
    edit: false,
    coordinates: [0, 0],
    title: 'Marker',
    description: '',
    fill: '#0166A5FF',
    stroke: '#FFFFFFFF',
    icon: 'geoPin.filled',
    maximized: false,
    onClose: undefined,
    onCreate: undefined,
    onCancel: undefined
});

class MarkerModal extends ModalBase {
    constructor(options = {}) {
        super(
            'Marker configuration', 
            options.maximized, 
            options.onClose
        );
        
        this.options = { ...DefaultOptions, ...options };
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
 
        for(const path in SvgPaths) {
            for(const version in SvgPaths[path]) {
                const option = DOM.createElement({
                    element: 'option', 
                    text: `${path.capitalize()} (${version})`, 
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

        const fillWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        const fillLabel = DOM.createElement({
            element: 'label', 
            text: 'Fill color',
            class: 'oltb-label', 
            attributes: {
                for: `${ID_PREFIX}-fill`
            }
        });

        const fillInput = DOM.createElement({
            element: 'div',
            id: `${ID_PREFIX}-fill`,
            class: 'oltb-color-input oltb-color-tippy',
            attributes: {
                tabindex: 0,
                'data-oltb-color-target': `#${ID_PREFIX}-fill`,
                'data-oltb-color': this.options.fill
            }
        });

        const fillInputInner = DOM.createElement({
            element: 'div',
            style: `background-color: ${this.options.fill}`,
            class: 'oltb-color-input__inner'
        });

        DOM.appendChildren(fillInput, [
            fillInputInner
        ]);

        DOM.appendChildren(fillWrapper, [
            fillLabel,
            fillInput
        ]);

        const strokeWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625' 
        });

        const strokeLabel = DOM.createElement({
            element: 'label', 
            text: 'Stroke color',
            class: 'oltb-label', 
            attributes: {
                for: `${ID_PREFIX}-stroke`
            }
        });

        const strokeInput = DOM.createElement({
            element: 'div',
            id: `${ID_PREFIX}-stroke`,
            class: 'oltb-color-input oltb-color-tippy',
            attributes: {
                tabindex: 0,
                'data-oltb-color-target': `#${ID_PREFIX}-stroke`,
                'data-oltb-color': this.options.stroke
            }
        });

        const strokeInputInner = DOM.createElement({
            element: 'div',
            style: `background-color: ${this.options.stroke}`,
            class: 'oltb-color-input__inner'
        });

        DOM.appendChildren(strokeInput, [
            strokeInputInner
        ]);

        DOM.appendChildren(strokeWrapper, [
            strokeLabel,
            strokeInput
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
                        fill: fillInput.getAttribute('data-oltb-color'),
                        stroke: strokeInput.getAttribute('data-oltb-color')
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
            fillWrapper,
            strokeWrapper,
            buttonsWrapper
        ]);

        this.show(modalContent);
    }
}

export { MarkerModal };