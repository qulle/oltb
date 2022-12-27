import { DOM } from '../../helpers/browser/DOM';
import { CONFIG } from '../../core/Config';
import { ModalBase } from '../../common/modals/ModalBase';
import { isDarkTheme } from '../../helpers/IsDarkTheme';

const PREFIX_LAYER_ID = 'oltb-layer-modal';
const DEFAULT_OPTIONS = Object.freeze({
    onClose: undefined,
    onCreate: undefined,
    onCancel: undefined
});

class LayerModal extends ModalBase {
    constructor(options = {}) {
        super('Create map layer', options.onClose);
        this.options = { ...DEFAULT_OPTIONS, ...options };

        // Create textbox for layer name
        const nameWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-m-0'
        });

        nameWrapper.appendChild(DOM.createElement({
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

        nameWrapper.appendChild(nameText);

        // Create and populate select element with the layer types
        const typeWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        typeWrapper.appendChild(DOM.createElement({
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

        typeWrapper.appendChild(typeSelect);

        // Create and populate select element with the source types
        const sourceWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625' 
        });

        sourceWrapper.appendChild(DOM.createElement({
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

        sourceWrapper.appendChild(sourceSelect);

        // Create textbox for projection
        const projectionWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625' 
        });

        projectionWrapper.appendChild(DOM.createElement({
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
                placeholder: CONFIG.Projection.Default
            }
        });

        projectionWrapper.appendChild(projectionText);

        // Create textbox for layer URL
        const urlWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        urlWrapper.appendChild(DOM.createElement({
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

        urlWrapper.appendChild(urlText);

        // Create textbox for parameters
        const parametersWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        parametersWrapper.appendChild(DOM.createElement({
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

        parametersWrapper.appendChild(parametersText);

        // Create and populate select element with layer wrapX values
        const wrapXWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        wrapXWrapper.appendChild(DOM.createElement({
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

        wrapXWrapper.appendChild(wrapXSelect);

        // Create textbox for layer attributions
        const attributionsWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        attributionsWrapper.appendChild(DOM.createElement({
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

        attributionsWrapper.appendChild(attributionsText);

        // Create buttons for create and cancel
        const buttonsWrapper = DOM.createElement({
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
                    typeof this.options.onCreate === 'function' && this.options.onCreate(layer);
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
            createButton
        ]);

        const modalContent = DOM.createElement({
            element: 'div',
            class: 'oltb-modal__content'
        });
        
        DOM.appendChildren(modalContent, [
            nameWrapper,
            typeWrapper,
            sourceWrapper,
            projectionWrapper,
            urlWrapper,
            parametersWrapper,
            wrapXWrapper,
            attributionsWrapper,
            buttonsWrapper
        ]);

        this.show(modalContent);
    }
}

export { LayerModal };