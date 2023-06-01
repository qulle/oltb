import { DOM } from '../../helpers/browser/DOM';
import { Config } from '../../core/Config';
import { ModalBase } from '../../common/modals/ModalBase';
import { LogManager } from '../../core/managers/LogManager';
import { isDarkTheme } from '../../helpers/IsDarkTheme';
import { ProjectionManager } from '../../core/managers/ProjectionManager';

const FILENAME = 'modal-extensions/LayerModal.js';
const PREFIX_LAYER_ID = 'oltb-layer-modal';

const DefaultOptions = Object.freeze({
    maximized: false,
    onClose: undefined,
    onCreate: undefined,
    onCancel: undefined
});

class LayerModal extends ModalBase {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super(
            'Create map layer', 
            options.maximized, 
            options.onClose
        );
        
        this.options = { ...DefaultOptions, ...options };
        this.#createModal();
    }

    #createModal() {
        const nameWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-m-0'
        });

        const nameLabel = DOM.createElement({
            element: 'label', 
            text: 'Name',
            class: 'oltb-label', 
            attributes: {
                for: `${PREFIX_LAYER_ID}-layer-name`
            }
        });

        const nameText = DOM.createElement({
            element: 'input', 
            id: `${PREFIX_LAYER_ID}-layer-name`,
            class: 'oltb-input',
            value: 'New map layer', 
            attributes: {
                type: 'text'
            }
        });

        DOM.appendChildren(nameWrapper, [
            nameLabel,
            nameText
        ]);

        const typeWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        const typeLabel = DOM.createElement({
            element: 'label', 
            text: 'Layer',
            class: 'oltb-label', 
            attributes: {
                for: `${PREFIX_LAYER_ID}-layer-type`
            }
        });

        const typeSelect = DOM.createElement({
            element: 'select', 
            id: `${PREFIX_LAYER_ID}-layer-type`,
            class: 'oltb-select'
        });

        [
            'Tile', 
            'Vector'
        ].forEach((type) => {
            const option = DOM.createElement({
                element: 'option', 
                text: type, 
                value: type
            });

            DOM.appendChildren(typeSelect, [
                option
            ]);
        });

        DOM.appendChildren(typeWrapper, [
            typeLabel,
            typeSelect
        ]);

        const sourceWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625' 
        });

        const sourceLabel = DOM.createElement({
            element: 'label', 
            text: 'Source',
            class: 'oltb-label', 
            attributes: {
                for: `${PREFIX_LAYER_ID}-layer-source`
            }
        });

        const sourceSelect = DOM.createElement({
            element: 'select', 
            id: `${PREFIX_LAYER_ID}-layer-source`,
            class: 'oltb-select'
        });

        [
            'TileWMS', 
            'XYZ', 
            'OSM', 
            'Vector'
        ].forEach((type) => {
            const option = DOM.createElement({
                element: 'option', 
                text: type, 
                value: type
            });

            DOM.appendChildren(sourceSelect, [
                option
            ]);
        });

        DOM.appendChildren(sourceWrapper, [
            sourceLabel,
            sourceSelect
        ]);

        const projectionWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625' 
        });

        const projectionLabel = DOM.createElement({
            element: 'label', 
            text: 'Projection',
            class: 'oltb-label', 
            attributes: {
                for: `${PREFIX_LAYER_ID}-layer-projection`
            }
        });

        const projectionSelect = DOM.createElement({
            element: 'select', 
            id: `${PREFIX_LAYER_ID}-layer-projection`,
            class: 'oltb-select'
        });

        const projections = ProjectionManager.getProjections();
        projections.forEach((projection) => {
            const option = DOM.createElement({
                element: 'option', 
                text: `${projection.name} (${projection.code})`, 
                value: projection.code
            });

            DOM.appendChildren(projectionSelect, [
                option
            ]);
        });

        // Set the default selected values
        projectionSelect.value = Config.projection.default;

        DOM.appendChildren(projectionWrapper, [
            projectionLabel,
            projectionSelect
        ]);

        const urlWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        const urlLabel = DOM.createElement({
            element: 'label', 
            text: 'URL', 
            class: 'oltb-label',
            attributes: {
                for: `${PREFIX_LAYER_ID}-layer-url`
            }
        });

        const urlText = DOM.createElement({
            element: 'input',
            id: `${PREFIX_LAYER_ID}-layer-url`, 
            class: 'oltb-input',
            attributes: {
                type: 'text'
            }
        });

        DOM.appendChildren(urlWrapper, [
            urlLabel,
            urlText
        ]);

        const parametersWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        const parametersLabel = DOM.createElement({
            element: 'label', 
            text: 'Parameters (JSON)', 
            class: 'oltb-label',
            attributes: {
                for: `${PREFIX_LAYER_ID}-layer-parameters`
            }
        });

        const parametersText = DOM.createElement({
            element: 'input', 
            id: `${PREFIX_LAYER_ID}-layer-parameters`,
            class: 'oltb-input', 
            attributes: {
                type: 'text', 
                placeholder: '{"Layers": "HPD_TRP"}'
            }
        });

        DOM.appendChildren(parametersWrapper, [
            parametersLabel,
            parametersText
        ]);

        const wrapXWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        const wrapXLabel = DOM.createElement({
            element: 'label', 
            text: 'WrapX',
            class: 'oltb-label', 
            attributes: {
                for: `${PREFIX_LAYER_ID}-layer-wrapx`
            }
        });

        const wrapXSelect = DOM.createElement({
            element: 'select',
            id: `${PREFIX_LAYER_ID}-layer-wrapx`, 
            class: 'oltb-select'
        });

        [
            'False', 
            'True'
        ].forEach((item) => {
            const option = DOM.createElement({
                element: 'option', 
                text: item, 
                value: item
            });

            DOM.appendChildren(wrapXSelect, [
                option
            ]);
        });

        DOM.appendChildren(wrapXWrapper, [
            wrapXLabel,
            wrapXSelect
        ]);

        const corsWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        const corsLabel = DOM.createElement({
            element: 'label', 
            text: 'CORS',
            class: 'oltb-label', 
            attributes: {
                for: `${PREFIX_LAYER_ID}-layer-cors`
            }
        });

        const corsSelect = DOM.createElement({
            element: 'select',
            id: `${PREFIX_LAYER_ID}-layer-cors`, 
            class: 'oltb-select'
        });

        [
            {
                text: 'Anonymous',
                value: 'anonymous'
            }, 
            {
                text: 'Credentials',
                value: 'use-credentials'
            },
            {
                text: 'None',
                value: 'undefined'
            }
        ].forEach((item) => {
            const option = DOM.createElement({
                element: 'option', 
                text: item.text, 
                value: item.value
            });

            DOM.appendChildren(corsSelect, [
                option
            ]);
        });

        DOM.appendChildren(corsWrapper, [
            corsLabel,
            corsSelect
        ]);

        const attributionsWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        const attributionsLabel = DOM.createElement({
            element: 'label', 
            text: 'Attributions', 
            class: 'oltb-label',
            attributes: {
                for: `${PREFIX_LAYER_ID}-layer-attributions`
            }
        });

        const attributionsText = DOM.createElement({
            element: 'input',
            id: `${PREFIX_LAYER_ID}-layer-attributions`, 
            class: 'oltb-input',
            attributes: {
                type: 'text'
            }
        });

        DOM.appendChildren(attributionsWrapper, [
            attributionsLabel,
            attributionsText
        ]);

        const buttonsWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-d-flex oltb-justify-content-between oltb-mt-15'
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
                        projection: projectionSelect.value || Config.projection.default,
                        url: urlText.value,
                        parameters: parametersText.value || '{}',
                        wrapX: wrapXSelect.value,
                        crossOrigin: corsSelect.value,
                        attributions: attributionsText.value
                    };
        
                    this.close();
                    this.options.onCreate instanceof Function && this.options.onCreate(layer);
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
                    this.options.onCancel instanceof Function && this.options.onCancel();
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
            corsWrapper,
            attributionsWrapper,
            buttonsWrapper
        ]);

        this.show(modalContent);
    }
}

export { LayerModal };