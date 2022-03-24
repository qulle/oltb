import ModalBase from '../../common/Modals/ModalBase';
import DOM from '../../helpers/DOM';
import { SVGPaths } from '../../core/Icons';
import { isDarkTheme } from '../../helpers/IsDarkTheme';

const prefixMarkerId = 'oltb-marker-modal';

class MarkerModal extends ModalBase {
    constructor(options, onCreate, onCancel) {
        const isEdit = options.edit ?? false;

        super(`${isEdit ? 'Edit' : 'Create'} marker`);

        // Create textbox name
        const nameDiv = DOM.createElement({element: 'div', attributes: {class: 'oltb-m-0'}});
        nameDiv.appendChild(DOM.createElement({element: 'label', 
            text: 'Name', 
            attributes: {
                class: 'oltb-label',
                for: 'marker-name'
            }
        }));

        const nameText = DOM.createElement({element: 'input', 
            attributes: {
                type: 'text',
                value: isEdit && options.name.length ? options.name : 'Marker',
                id: prefixMarkerId + '-marker-name',
                class: 'oltb-input'
            }
        });

        nameDiv.appendChild(nameText);

        // Create textbox info
        const infoDiv = DOM.createElement({element: 'div', attributes: {class: 'oltb-mt-0625'}});
        infoDiv.appendChild(DOM.createElement({element: 'label', 
            text: 'Info text', 
            attributes: {
                class: 'oltb-label',
                for: prefixMarkerId + '-marker-info'
            }
        }));

        const infoText = DOM.createElement({element: 'input', 
            attributes: {
                type: 'text',
                placeholder: 'Some information about the marker',
                value: isEdit && options.info.length ? options.info : '',
                id: prefixMarkerId + '-marker-info',
                class: 'oltb-input'
            }
        });

        infoDiv.appendChild(infoText);

        // Create and populate select element with all icons
        const iconDiv = DOM.createElement({element: 'div', attributes: {class: 'oltb-mt-0625'}});
        const iconSelect = DOM.createElement({element: 'select', 
            attributes: {
                id: prefixMarkerId + '-icon', 
                class: 'oltb-select'
            }
        });
 
        for(const path in SVGPaths) {
            iconSelect.appendChild(
                DOM.createElement({element: 'option', text: path, attributes: {value: path}}
            ));
        }

        const targetIcon = isEdit ? options.icon : 'GeoPin';

        // Select the GeoPin icon as default
        for(var i = 0; i < iconSelect.length; i++) {
            if(iconSelect[i].value === targetIcon) {
                iconSelect.selectedIndex = i;
                break;
            }
        }
 
        iconDiv.appendChild(DOM.createElement({element: 'label', 
            text: 'Icon', 
            attributes: {
                class: 'oltb-label',
                for: prefixMarkerId + '-icon'
            }
        }));
 
        iconDiv.appendChild(iconSelect);

        // Create textbox latitude
        const latDiv = DOM.createElement({element: 'div', attributes: {class: 'oltb-mt-0625'}});
        latDiv.appendChild(DOM.createElement({element: 'label', 
            text: 'Latitud', 
            attributes: {
                class: 'oltb-label',
                for: prefixMarkerId + '-marker-lat'
            }
        }));

        const latText = DOM.createElement({element: 'input', 
            attributes: {
                type: 'text',
                value: options.coordinates[1],
                id: prefixMarkerId + '-marker-lat',
                class: 'oltb-input'
            }
        });

        latDiv.appendChild(latText);

        // Create textbox longitude
        const lonDiv = DOM.createElement({element: 'div', attributes: {class: 'oltb-mt-0625'}});
        lonDiv.appendChild(DOM.createElement({element: 'label', 
            text: 'Longitud', 
            attributes: {
                class: 'oltb-label',
                for: prefixMarkerId + '-marker-lon'
            }
        }));

        const lonText = DOM.createElement({element: 'input', 
            attributes: {
                type: 'text',
                value: options.coordinates[0],
                id: prefixMarkerId + '-marker-lon',
                class: 'oltb-input'
            }
        });

        lonDiv.appendChild(lonText);

        // Create color picker
        const backgroundColorDiv = DOM.createElement({element: 'div', attributes: {class: 'oltb-mt-0625'}});
        backgroundColorDiv.appendChild(DOM.createElement({element: 'label', 
            text: 'Background color', 
            attributes: {
                class: 'oltb-label',
                for: prefixMarkerId + '-marker-bgColor'
            }
        }));

        const backgroundColor = isEdit ? options.backgroundColor : '#0166A5FF';

        const backgroundColorInput = DOM.createElement({element: 'div',
            attributes: {
                class: 'oltb-color-input oltb-color-tippy',
                id: prefixMarkerId + '-marker-bgColor',
                tabindex: 0,
                'data-oltb-color-target': '#' + prefixMarkerId + '-marker-bgColor',
                'data-oltb-color': backgroundColor
            }
        });

        backgroundColorInput.appendChild(DOM.createElement({element: 'div',
            style: `background-color: ${backgroundColor}`,
            attributes: {
                class: 'oltb-color-input__inner'
            }
        }));

        backgroundColorDiv.appendChild(backgroundColorInput);

        // Create color picker
        const colorDiv = DOM.createElement({element: 'div', attributes: {class: 'oltb-mt-0625'}});
        colorDiv.appendChild(DOM.createElement({element: 'label', 
            text: 'Color', 
            attributes: {
                class: 'oltb-label',
                for: prefixMarkerId + '-marker-color'
            }
        }));

        const color = isEdit ? options.color : '#FFFFFFFF';

        const colorInput = DOM.createElement({element: 'div',
            attributes: {
                class: 'oltb-color-input oltb-color-tippy',
                id: prefixMarkerId + '-marker-color',
                tabindex: 0,
                'data-oltb-color-target': '#' + prefixMarkerId + '-marker-color',
                'data-oltb-color': color
            }
        });

        colorInput.appendChild(DOM.createElement({element: 'div',
            style: `background-color: ${color}`,
            attributes: {
                class: 'oltb-color-input__inner'
            }
        }));

        colorDiv.appendChild(colorInput);

        // Create buttons for create and cancel
        const markerButtonsDiv = DOM.createElement({element: 'div', attributes: {class: 'oltb-d-flex oltb-justify-content-between oltb-mt-1'}});
        const createButton = DOM.createElement({element: 'button', 
            text: `${isEdit ? 'Save changes' : 'Create marker'}`, 
            attributes: {
                type: 'button', 
                class: 'oltb-dialog__btn oltb-btn oltb-btn--green-mid'
            }
        });

        createButton.addEventListener('click', (event) => {
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
        });

        const cancelButton = DOM.createElement({element: 'button', 
            text: 'Cancel',
            attributes: {
                type: 'button', 
                class: `oltb-dialog__btn oltb-btn ${isDarkTheme() ? 'oltb-btn--gray-mid' : 'oltb-btn--gray-dark'}`
            }
        });

        cancelButton.addEventListener('click', (event) => {
            this.close();
            typeof onCancel === 'function' && onCancel();
        });

        markerButtonsDiv.appendChild(cancelButton);
        markerButtonsDiv.appendChild(createButton);

        // Add all DOM elements to the modalContent
        const modalContent = DOM.createElement({element: 'div', attributes: {class: 'oltb-modal__content'}});
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