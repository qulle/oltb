import ModalBase from '../../common/Modals/ModalBase';
import DOM from '../../helpers/DOM';
import Config from '../../core/Config';
import { isDarkTheme } from '../../helpers/IsDarkTheme';

const prefixLayerId = 'oltb-layer-modal';

class LayerModal extends ModalBase {
    constructor(onCreate, onCancel) {
        super('Create map layer');

        // Create textbox for entering layer name
        const layerNameDiv = DOM.createElement({element: 'div', attributes: {class: 'oltb-m-0'}});
        const layerNameTxt = DOM.createElement({element: 'input', 
            attributes: {
                type: 'text', 
                value: 'New map layer', 
                id: prefixLayerId + '-layer-name', 
                class: 'oltb-input'
            }
        });

        layerNameDiv.appendChild(DOM.createElement({element: 'label', 
            text: 'Name', 
            attributes: {
                class: 'oltb-label',
                for: prefixLayerId + '-layer-name'
            }
        }));

        layerNameDiv.appendChild(layerNameTxt);

        // Create and populate select element with the layer types
        const layerTypeDiv = DOM.createElement({element: 'div', attributes: {class: 'oltb-mt-0625'}});
        const layerTypeSelect = DOM.createElement({element: 'select', 
            attributes: {
                id: prefixLayerId + '-layer-type', 
                class: 'oltb-select'
            }
        });

        ['Tile', 'Vector'].forEach(type => {
            layerTypeSelect.appendChild(
                DOM.createElement({element: 'option', text: type, attributes: {value: type}}
            ));
        });

        layerTypeDiv.appendChild(DOM.createElement({element: 'label', 
            text: 'Layer', 
            attributes: {
                class: 'oltb-label',
                for: prefixLayerId + '-layer-type'
            }
        }));

        layerTypeDiv.appendChild(layerTypeSelect);

        // Create and populate select element with the source types
        const layerSourceDiv = DOM.createElement({element: 'div', attributes: {class: 'oltb-mt-0625'}});
        const layerSourceSelect = DOM.createElement({element: 'select', 
            attributes: {
                id: prefixLayerId + '-layer-source', 
                class: 'oltb-select'
            }
        });

        ['TileWMS', 'XYZ', 'OSM', 'Vector'].forEach(type => {
            layerSourceSelect.appendChild(
                DOM.createElement({element: 'option', text: type, attributes: {value: type}}
            ));
        });

        layerSourceDiv.appendChild(DOM.createElement({element: 'label', 
            text: 'Source', 
            attributes: {
                class: 'oltb-label',
                for: prefixLayerId + '-layer-source'
            }
        }));

        layerSourceDiv.appendChild(layerSourceSelect);

        // Create textbox for entering projection
        const layerProjectionDiv = DOM.createElement({element: 'div', attributes: {class: 'oltb-mt-0625'}});
        const layerProjectionTxt = DOM.createElement({element: 'input', 
            attributes: {
                type: 'text', 
                id: prefixLayerId + '-layer-projection', 
                class: 'oltb-input', 
                placeholder: Config.baseProjection
            }
        });

        layerProjectionDiv.appendChild(DOM.createElement({element: 'label', 
            text: 'Projection', 
            attributes: {
                class: 'oltb-label',
                for: prefixLayerId + '-layer-projection'
            }
        }));

        layerProjectionDiv.appendChild(layerProjectionTxt);

        // Create textbox for entering layer URL
        const layerURLDiv = DOM.createElement({element: 'div', attributes: {class: 'oltb-mt-0625'}});
        const layerURLTxt = DOM.createElement({element: 'input', 
            attributes: {
                type: 'text', 
                id: prefixLayerId + '-layer-url', 
                class: 'oltb-input'
            }
        });

        layerURLDiv.appendChild(DOM.createElement({element: 'label', 
            text: 'URL', 
            attributes: {
                class: 'oltb-label',
                for: prefixLayerId + '-layer-url'
            }
        }));

        layerURLDiv.appendChild(layerURLTxt);

        // Create textbox for entering parameters in JSON format
        const layerParametersDiv = DOM.createElement({element: 'div', attributes: {class: 'oltb-mt-0625'}});
        const layerParametersTxt = DOM.createElement({element: 'input', 
            attributes: {
                type: 'text', 
                id: prefixLayerId + '-layer-parameters', 
                class: 'oltb-input', 
                placeholder: '{"Layers": "HPD_TRP"}'
            }
        });

        layerParametersDiv.appendChild(DOM.createElement({element: 'label', 
            text: 'Parameters (JSON)', 
            attributes: {
                class: 'oltb-label',
                for: prefixLayerId + '-layer-parameters'
            }
        }));

        layerParametersDiv.appendChild(layerParametersTxt);

        // Create and populate select element with layer wrapX values
        const layerWrapXDiv = DOM.createElement({element: 'div', attributes: {class: 'oltb-mt-0625'}});
        const layerWrapXSelect = DOM.createElement({element: 'select', 
            attributes: {
                id: prefixLayerId + '-layer-wrapx', 
                class: 'oltb-select'
            }
        });

        ['False', 'True'].forEach(value => {
            layerWrapXSelect.appendChild(
                DOM.createElement({element: 'option', text: value, attributes: {value: value}}
            ));
        });

        layerWrapXDiv.appendChild(DOM.createElement({element: 'label', 
            text: 'WrapX', 
            attributes: {
                class: 'oltb-label',
                for: prefixLayerId + '-layer-wrapx'
            }
        }));

        layerWrapXDiv.appendChild(layerWrapXSelect);

        // Create textbox for entering layer attributions
        const layerAttributionsDiv = DOM.createElement({element: 'div', attributes: {class: 'oltb-mt-0625'}});
        const layerAttributionsTxt = DOM.createElement({element: 'input', 
            attributes: {
                type: 'text',
                id: prefixLayerId + '-layer-attributions', 
                class: 'oltb-input'
            }
        });

        layerAttributionsDiv.appendChild(DOM.createElement({element: 'label', 
            text: 'Attributions', 
            attributes: {
                class: 'oltb-label',
                for: prefixLayerId + '-layer-attributions'
            }
        }));

        layerAttributionsDiv.appendChild(layerAttributionsTxt);

        // Create buttons for create and cancel
        const layerButtonsDiv = DOM.createElement({element: 'div', attributes: {class: 'oltb-d-flex oltb-justify-content-between oltb-mt-1'}});
        const createButton = DOM.createElement({element: 'button', 
            text: 'Create layer', 
            attributes: {
                type: 'button', 
                class: 'oltb-dialog__btn oltb-btn oltb-btn--dark-green'
            }
        });

        createButton.addEventListener('click', (event) => {
            const layer = {
                name: layerNameTxt.value,
                layer: layerTypeSelect.value,
                source: layerSourceSelect.value,
                url: layerURLTxt.value,
                parameters: layerParametersTxt.value || '{}',
                wrapX: layerWrapXSelect.value,
                attributions: layerAttributionsTxt.value
            };

            this.close();
            typeof onCreate === 'function' && onCreate(layer);
        });

        const cancelButton = DOM.createElement({element: 'button', 
            text: 'Cancel', 
            attributes: {
                type: 'button', 
                class: `oltb-dialog__btn oltb-btn ${isDarkTheme() ? 'oltb-btn--mid-gray' : 'oltb-btn--dark-gray'}`
            }
        });

        cancelButton.addEventListener('click', (event) => {
            this.close();
            typeof onCancel === 'function' && onCancel();
        });

        layerButtonsDiv.appendChild(cancelButton);
        layerButtonsDiv.appendChild(createButton);

        // Add all DOM elements to the modalContent
        const modalContent = DOM.createElement({element: 'div', attributes: {class: 'oltb-modal__content'}});
        DOM.appendChildren(modalContent, [
            layerNameDiv,
            layerTypeDiv,
            layerSourceDiv,
            layerProjectionDiv,
            layerURLDiv,
            layerParametersDiv,
            layerWrapXDiv,
            layerAttributionsDiv,
            layerButtonsDiv
        ]);

        this.show(modalContent);
    }
}

export default LayerModal;