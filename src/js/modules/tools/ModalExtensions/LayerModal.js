import ModalBase from '../../common/Modals/ModalBase';
import DOM from '../../helpers/Browser/DOM';
import Config from '../../core/Config';
import { isDarkTheme } from '../../helpers/IsDarkTheme';

const PREFIX_LAYER_ID = 'oltb-layer-modal';

class LayerModal extends ModalBase {
    constructor(onCreate, onCancel) {
        super('Create map layer');

        // Create textbox for entering layer name
        const layerNameDiv = DOM.createElement({
            element: 'div',
            class: 'oltb-m-0'
        });

        const layerNameTxt = DOM.createElement({
            element: 'input', 
            id: PREFIX_LAYER_ID + '-layer-name',
            class: 'oltb-input',
            value: 'New map layer', 
            attributes: {
                type: 'text'
            }
        });

        layerNameDiv.appendChild(DOM.createElement({
            element: 'label', 
            text: 'Name',
            class: 'oltb-label', 
            attributes: {
                for: PREFIX_LAYER_ID + '-layer-name'
            }
        }));

        layerNameDiv.appendChild(layerNameTxt);

        // Create and populate select element with the layer types
        const layerTypeDiv = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        const layerTypeSelect = DOM.createElement({
            element: 'select', 
            id: PREFIX_LAYER_ID + '-layer-type',
            class: 'oltb-select'
        });

        ['Tile', 'Vector'].forEach((type) => {
            layerTypeSelect.appendChild(
                DOM.createElement({
                    element: 'option', 
                    text: type, 
                    value: type
                }
            ));
        });

        layerTypeDiv.appendChild(DOM.createElement({
            element: 'label', 
            text: 'Layer',
            class: 'oltb-label', 
            attributes: {
                for: PREFIX_LAYER_ID + '-layer-type'
            }
        }));

        layerTypeDiv.appendChild(layerTypeSelect);

        // Create and populate select element with the source types
        const layerSourceDiv = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625' 
        });

        const layerSourceSelect = DOM.createElement({
            element: 'select', 
            id: PREFIX_LAYER_ID + '-layer-source',
            class: 'oltb-select'
        });

        ['TileWMS', 'XYZ', 'OSM', 'Vector'].forEach((type) => {
            layerSourceSelect.appendChild(
                DOM.createElement({
                    element: 'option', 
                    text: type, 
                    value: type
                }
            ));
        });

        layerSourceDiv.appendChild(DOM.createElement({
            element: 'label', 
            text: 'Source',
            class: 'oltb-label', 
            attributes: {
                for: PREFIX_LAYER_ID + '-layer-source'
            }
        }));

        layerSourceDiv.appendChild(layerSourceSelect);

        // Create textbox for entering projection
        const layerProjectionDiv = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625' 
        });

        const layerProjectionTxt = DOM.createElement({
            element: 'input', 
            id: PREFIX_LAYER_ID + '-layer-projection',
            class: 'oltb-input', 
            attributes: {
                type: 'text', 
                placeholder: Config.projection
            }
        });

        layerProjectionDiv.appendChild(DOM.createElement({
            element: 'label', 
            text: 'Projection',
            class: 'oltb-label', 
            attributes: {
                for: PREFIX_LAYER_ID + '-layer-projection'
            }
        }));

        layerProjectionDiv.appendChild(layerProjectionTxt);

        // Create textbox for entering layer URL
        const layerURLDiv = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        const layerURLTxt = DOM.createElement({
            element: 'input',
            id: PREFIX_LAYER_ID + '-layer-url', 
            class: 'oltb-input',
            attributes: {
                type: 'text'
            }
        });

        layerURLDiv.appendChild(DOM.createElement({
            element: 'label', 
            text: 'URL', 
            class: 'oltb-label',
            attributes: {
                for: PREFIX_LAYER_ID + '-layer-url'
            }
        }));

        layerURLDiv.appendChild(layerURLTxt);

        // Create textbox for entering parameters in JSON format
        const layerParametersDiv = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        const layerParametersTxt = DOM.createElement({
            element: 'input', 
            id: PREFIX_LAYER_ID + '-layer-parameters',
            class: 'oltb-input', 
            attributes: {
                type: 'text', 
                placeholder: '{"Layers": "HPD_TRP"}'
            }
        });

        layerParametersDiv.appendChild(DOM.createElement({
            element: 'label', 
            text: 'Parameters (JSON)', 
            class: 'oltb-label',
            attributes: {
                for: PREFIX_LAYER_ID + '-layer-parameters'
            }
        }));

        layerParametersDiv.appendChild(layerParametersTxt);

        // Create and populate select element with layer wrapX values
        const layerWrapXDiv = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        const layerWrapXSelect = DOM.createElement({
            element: 'select',
            id: PREFIX_LAYER_ID + '-layer-wrapx', 
            class: 'oltb-select'
        });

        ['False', 'True'].forEach((value) => {
            layerWrapXSelect.appendChild(
                DOM.createElement({
                    element: 'option', 
                    text: value, 
                    value: value
                }
            ));
        });

        layerWrapXDiv.appendChild(DOM.createElement({
            element: 'label', 
            text: 'WrapX',
            class: 'oltb-label', 
            attributes: {
                for: PREFIX_LAYER_ID + '-layer-wrapx'
            }
        }));

        layerWrapXDiv.appendChild(layerWrapXSelect);

        // Create textbox for entering layer attributions
        const layerAttributionsDiv = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        const layerAttributionsTxt = DOM.createElement({
            element: 'input',
            id: PREFIX_LAYER_ID + '-layer-attributions', 
            class: 'oltb-input',
            attributes: {
                type: 'text'
            }
        });

        layerAttributionsDiv.appendChild(DOM.createElement({
            element: 'label', 
            text: 'Attributions', 
            class: 'oltb-label',
            attributes: {
                for: PREFIX_LAYER_ID + '-layer-attributions'
            }
        }));

        layerAttributionsDiv.appendChild(layerAttributionsTxt);

        // Create buttons for create and cancel
        const layerButtonsDiv = DOM.createElement({
            element: 'div',
            class: 'oltb-d-flex oltb-justify-content-between oltb-mt-1'
        });

        const createButton = DOM.createElement({
            element: 'button', 
            text: 'Create layer',
            class: 'oltb-dialog__btn oltb-btn oltb-btn--green-mid', 
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': () => {
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

        layerButtonsDiv.appendChild(cancelButton);
        layerButtonsDiv.appendChild(createButton);

        // Add all DOM elements to the modalContent
        const modalContent = DOM.createElement({
            element: 'div',
            class: 'oltb-modal__content'
        });
        
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