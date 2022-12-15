import DOM from '../../helpers/browser/DOM';
import CONFIG from '../../core/Config';
import ModalBase from '../../common/modals/ModalBase';
import { isDarkTheme } from '../../helpers/IsDarkTheme';

const PREFIX_LAYER_ID = 'oltb-layer-modal';

class LayerModal extends ModalBase {
    constructor(onCreate, onCancel) {
        super('Create map layer');

        // Create textbox for layer name
        const nameDiv = DOM.createElement({
            element: 'div',
            class: 'oltb-m-0'
        });

        nameDiv.appendChild(DOM.createElement({
            element: 'label', 
            text: 'Name',
            class: 'oltb-label', 
            attributes: {
                for: `${PREFIX_LAYER_ID}-layer-name`
            }
        }));

        const nameText = DOM.createElement({
            element: 'input', 
            id: `${PREFIX_LAYER_ID}-layer-name`,
            class: 'oltb-input',
            value: 'New map layer', 
            attributes: {
                type: 'text'
            }
        });

        nameDiv.appendChild(nameText);

        // Create and populate select element with the layer types
        const typeDiv = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        typeDiv.appendChild(DOM.createElement({
            element: 'label', 
            text: 'Layer',
            class: 'oltb-label', 
            attributes: {
                for: `${PREFIX_LAYER_ID}-layer-type`
            }
        }));

        const typeSelect = DOM.createElement({
            element: 'select', 
            id: `${PREFIX_LAYER_ID}-layer-type`,
            class: 'oltb-select'
        });

        ['Tile', 'Vector'].forEach((type) => {
            typeSelect.appendChild(
                DOM.createElement({
                    element: 'option', 
                    text: type, 
                    value: type
                }
            ));
        });

        typeDiv.appendChild(typeSelect);

        // Create and populate select element with the source types
        const sourceDiv = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625' 
        });

        sourceDiv.appendChild(DOM.createElement({
            element: 'label', 
            text: 'Source',
            class: 'oltb-label', 
            attributes: {
                for: `${PREFIX_LAYER_ID}-layer-source`
            }
        }));

        const sourceSelect = DOM.createElement({
            element: 'select', 
            id: `${PREFIX_LAYER_ID}-layer-source`,
            class: 'oltb-select'
        });

        ['TileWMS', 'XYZ', 'OSM', 'Vector'].forEach((type) => {
            sourceSelect.appendChild(
                DOM.createElement({
                    element: 'option', 
                    text: type, 
                    value: type
                }
            ));
        });

        sourceDiv.appendChild(sourceSelect);

        // Create textbox for projection
        const projectionDiv = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625' 
        });

        projectionDiv.appendChild(DOM.createElement({
            element: 'label', 
            text: 'Projection',
            class: 'oltb-label', 
            attributes: {
                for: `${PREFIX_LAYER_ID}-layer-projection`
            }
        }));

        const projectionText = DOM.createElement({
            element: 'input', 
            id: `${PREFIX_LAYER_ID}-layer-projection`,
            class: 'oltb-input', 
            attributes: {
                type: 'text', 
                placeholder: CONFIG.projection.default
            }
        });

        projectionDiv.appendChild(projectionText);

        // Create textbox for layer URL
        const urlDiv = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        urlDiv.appendChild(DOM.createElement({
            element: 'label', 
            text: 'URL', 
            class: 'oltb-label',
            attributes: {
                for: `${PREFIX_LAYER_ID}-layer-url`
            }
        }));

        const urlText = DOM.createElement({
            element: 'input',
            id: `${PREFIX_LAYER_ID}-layer-url`, 
            class: 'oltb-input',
            attributes: {
                type: 'text'
            }
        });

        urlDiv.appendChild(urlText);

        // Create textbox for parameters
        const parametersDiv = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        parametersDiv.appendChild(DOM.createElement({
            element: 'label', 
            text: 'Parameters (JSON)', 
            class: 'oltb-label',
            attributes: {
                for: `${PREFIX_LAYER_ID}-layer-parameters`
            }
        }));

        const parametersText = DOM.createElement({
            element: 'input', 
            id: `${PREFIX_LAYER_ID}-layer-parameters`,
            class: 'oltb-input', 
            attributes: {
                type: 'text', 
                placeholder: '{"Layers": "HPD_TRP"}'
            }
        });

        parametersDiv.appendChild(parametersText);

        // Create and populate select element with layer wrapX values
        const wrapXDiv = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        wrapXDiv.appendChild(DOM.createElement({
            element: 'label', 
            text: 'WrapX',
            class: 'oltb-label', 
            attributes: {
                for: `${PREFIX_LAYER_ID}-layer-wrapx`
            }
        }));

        const wrapXSelect = DOM.createElement({
            element: 'select',
            id: `${PREFIX_LAYER_ID}-layer-wrapx`, 
            class: 'oltb-select'
        });

        ['False', 'True'].forEach((value) => {
            wrapXSelect.appendChild(
                DOM.createElement({
                    element: 'option', 
                    text: value, 
                    value: value
                }
            ));
        });

        wrapXDiv.appendChild(wrapXSelect);

        // Create textbox for layer attributions
        const attributionsDiv = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        attributionsDiv.appendChild(DOM.createElement({
            element: 'label', 
            text: 'Attributions', 
            class: 'oltb-label',
            attributes: {
                for: `${PREFIX_LAYER_ID}-layer-attributions`
            }
        }));

        const attributionsText = DOM.createElement({
            element: 'input',
            id: `${PREFIX_LAYER_ID}-layer-attributions`, 
            class: 'oltb-input',
            attributes: {
                type: 'text'
            }
        });

        attributionsDiv.appendChild(attributionsText);

        // Create buttons for create and cancel
        const buttonsDiv = DOM.createElement({
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
                        name: nameText.value,
                        layer: typeSelect.value,
                        source: sourceSelect.value,
                        url: urlText.value,
                        parameters: parametersText.value || '{}',
                        wrapX: wrapXSelect.value,
                        attributions: attributionsText.value
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

        buttonsDiv.appendChild(cancelButton);
        buttonsDiv.appendChild(createButton);

        // Add all DOM elements to the modalContent
        const modalContent = DOM.createElement({
            element: 'div',
            class: 'oltb-modal__content'
        });
        
        DOM.appendChildren(modalContent, [
            nameDiv,
            typeDiv,
            sourceDiv,
            projectionDiv,
            urlDiv,
            parametersDiv,
            wrapXDiv,
            attributionsDiv,
            buttonsDiv
        ]);

        this.show(modalContent);
    }
}

export default LayerModal;