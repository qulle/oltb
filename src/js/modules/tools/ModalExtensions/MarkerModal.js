import ModalBase from '../../common/Modals/ModalBase';
import DOM from '../../helpers/Browser/DOM';
import { SVGPaths } from '../../core/Icons';
import { isDarkTheme } from '../../helpers/IsDarkTheme';

const PREFIX_MARKER_ID = 'oltb-marker-modal';

const DEFAULT_OPTIONS = {};

class MarkerModal extends ModalBase {
    constructor(options, onCreate, onCancel) {
        const isEdit = options.edit ?? false;
        
        super(`${isEdit ? 'Edit' : 'Create'} marker`);

        this.options = { ...DEFAULT_OPTIONS, ...options };

        // Create textbox name
        const nameDiv = DOM.createElement({
            element: 'div',
            class: 'oltb-m-0'
        });

        nameDiv.appendChild(DOM.createElement({
            element: 'label', 
            text: 'Name',
            class: 'oltb-label', 
            attributes: {
                for: 'marker-name'
            }
        }));

        const nameText = DOM.createElement({
            element: 'input', 
            id: PREFIX_MARKER_ID + '-marker-name',
            class: 'oltb-input',
            value: isEdit && this.options.name.length ? this.options.name : 'Marker',
            attributes: {
                type: 'text'
            }
        });

        nameDiv.appendChild(nameText);

        // Create textbox info
        const infoDiv = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        infoDiv.appendChild(DOM.createElement({
            element: 'label', 
            text: 'Info text',
            class: 'oltb-label', 
            attributes: {
                for: PREFIX_MARKER_ID + '-marker-info'
            }
        }));

        const infoText = DOM.createElement({
            element: 'input', 
            id: PREFIX_MARKER_ID + '-marker-info',
            class: 'oltb-input',
            value: isEdit && this.options.info.length ? this.options.info : '',
            attributes: {
                type: 'text',
                placeholder: 'Some information about the marker'
            }
        });

        infoDiv.appendChild(infoText);

        // Create and populate select element with all icons
        const iconDiv = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        const iconSelect = DOM.createElement({
            element: 'select',
            id: PREFIX_MARKER_ID + '-icon', 
            class: 'oltb-select'
        });
 
        for(const path in SVGPaths) {
            iconSelect.appendChild(
                DOM.createElement({
                    element: 'option', 
                    text: path, 
                    value: path
                }
            ));
        }

        const targetIcon = isEdit ? this.options.icon : 'GeoPin';

        // Select the GeoPin icon as default
        for(var i = 0; i < iconSelect.length; i++) {
            if(iconSelect[i].value === targetIcon) {
                iconSelect.selectedIndex = i;
                break;
            }
        }
 
        iconDiv.appendChild(DOM.createElement({
            element: 'label', 
            text: 'Icon',
            class: 'oltb-label', 
            attributes: {
                for: PREFIX_MARKER_ID + '-icon'
            }
        }));
 
        iconDiv.appendChild(iconSelect);

        // Create textbox latitude
        const latDiv = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        latDiv.appendChild(DOM.createElement({
            element: 'label', 
            text: 'Latitud',
            class: 'oltb-label', 
            attributes: {
                for: PREFIX_MARKER_ID + '-marker-lat'
            }
        }));

        const latText = DOM.createElement({
            element: 'input',
            id: PREFIX_MARKER_ID + '-marker-lat',
            class: 'oltb-input',
            value: this.options.coordinates[1],
            attributes: {
                type: 'text'
            }
        });

        latDiv.appendChild(latText);

        // Create textbox longitude
        const lonDiv = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        lonDiv.appendChild(DOM.createElement({
            element: 'label', 
            text: 'Longitud', 
            class: 'oltb-label',
            attributes: {
                for: PREFIX_MARKER_ID + '-marker-lon'
            }
        }));

        const lonText = DOM.createElement({
            element: 'input',
            id: PREFIX_MARKER_ID + '-marker-lon',
            class: 'oltb-input',
            value: this.options.coordinates[0],
            attributes: {
                type: 'text'
            }
        });

        lonDiv.appendChild(lonText);

        // Create color picker
        const backgroundColorDiv = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        backgroundColorDiv.appendChild(DOM.createElement({
            element: 'label', 
            text: 'Background color',
            class: 'oltb-label', 
            attributes: {
                for: PREFIX_MARKER_ID + '-marker-bgColor'
            }
        }));

        const backgroundColor = isEdit ? this.options.backgroundColor : '#0166A5FF';

        const backgroundColorInput = DOM.createElement({
            element: 'div',
            id: PREFIX_MARKER_ID + '-marker-bgColor',
            class: 'oltb-color-input oltb-color-tippy',
            attributes: {
                tabindex: 0,
                'data-oltb-color-target': '#' + PREFIX_MARKER_ID + '-marker-bgColor',
                'data-oltb-color': backgroundColor
            }
        });

        backgroundColorInput.appendChild(DOM.createElement({
            element: 'div',
            style: `background-color: ${backgroundColor}`,
            class: 'oltb-color-input__inner'
        }));

        backgroundColorDiv.appendChild(backgroundColorInput);

        // Create color picker
        const colorDiv = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625' 
        });

        colorDiv.appendChild(DOM.createElement({
            element: 'label', 
            text: 'Color',
            class: 'oltb-label', 
            attributes: {
                for: PREFIX_MARKER_ID + '-marker-color'
            }
        }));

        const color = isEdit ? this.options.color : '#FFFFFFFF';

        const colorInput = DOM.createElement({
            element: 'div',
            id: PREFIX_MARKER_ID + '-marker-color',
            class: 'oltb-color-input oltb-color-tippy',
            attributes: {
                tabindex: 0,
                'data-oltb-color-target': '#' + PREFIX_MARKER_ID + '-marker-color',
                'data-oltb-color': color
            }
        });

        colorInput.appendChild(DOM.createElement({
            element: 'div',
            style: `background-color: ${color}`,
            class: 'oltb-color-input__inner'
        }));

        colorDiv.appendChild(colorInput);

        // Create buttons for create and cancel
        const markerButtonsDiv = DOM.createElement({
            element: 'div',
            class: 'oltb-d-flex oltb-justify-content-between oltb-mt-1'
        });

        const createButton = DOM.createElement({
            element: 'button', 
            text: `${isEdit ? 'Save changes' : 'Create marker'}`, 
            class: 'oltb-dialog__btn oltb-btn oltb-btn--green-mid',
            attributes: {
                type: 'button',
            },
            listeners: {
                'click': () => {
                    const response = {
                        name: nameText.value.trim(),
                        info: infoText.value.trim(),
                        icon: iconSelect.value,
                        latitude: parseFloat(latText.value),
                        longitude: parseFloat(lonText.value),
                        backgroundColor: backgroundColorInput.getAttribute('data-oltb-color'),
                        color: colorInput.getAttribute('data-oltb-color')
                    };
        
                    this.close();
                    typeof onCreate === 'function' && onCreate(response);
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
                    typeof onCancel === 'function' && onCancel();
                }
            }
        });

        markerButtonsDiv.appendChild(cancelButton);
        markerButtonsDiv.appendChild(createButton);

        // Add all DOM elements to the modalContent
        const modalContent = DOM.createElement({
            element: 'div',
            class: 'oltb-modal__content'
        });
        
        DOM.appendChildren(modalContent, [
            nameDiv,
            infoDiv,
            iconDiv,
            latDiv,
            lonDiv,
            backgroundColorDiv,
            colorDiv,
            markerButtonsDiv
        ]);

        this.show(modalContent);
    }
}

export default MarkerModal;