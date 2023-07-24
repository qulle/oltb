import _ from 'lodash';
import { DOM } from '../../helpers/browser/DOM';
import { Config } from '../../core/Config';
import { ModalBase } from '../../common/modals/ModalBase';
import { LogManager } from '../../core/managers/LogManager';
import { isDarkTheme } from '../../helpers/IsDarkTheme';
import { LayerOptions } from '../../core/ol-types/LayerType';
import { SourceOptions } from '../../core/ol-types/SourceType';
import { createUIInput } from '../../creators/CreateUIInput';
import { createUISelect } from '../../creators/CreateUISelect';
import { ProjectionManager } from '../../core/managers/ProjectionManager';

const FILENAME = 'modal-extensions/LayerModal.js';
const ID_PREFIX = 'oltb-layer-modal';

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
        
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        this.#createModal();
    }

    #createModal() {
        const [ nameWrapper, nameInput ] = createUIInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-name',
            text: 'Name',
            value: 'New map layer'
        });

        const [ typeWrapper, typeSelect ] = createUISelect({
            idPrefix: ID_PREFIX,
            idPostfix: '-type',
            text: 'Layer',
            options: _.cloneDeep(LayerOptions)
        });

        const [ sourceWrapper, sourceSelect ] = createUISelect({
            idPrefix: ID_PREFIX,
            idPostfix: '-source',
            text: 'Layer',
            options: _.cloneDeep(SourceOptions)
        });

        const projectionOptions = [];
        const projections = ProjectionManager.getProjections();
        projections.forEach(projection => {
            projectionOptions.push({
                text: `${projection.name} (${projection.code})`, 
                value: projection.code
            });
        });

        const [ projectionWrapper, projectionSelect ] = createUISelect({
            idPrefix: ID_PREFIX,
            idPostfix: '-projection',
            text: 'Projection',
            options: projectionOptions,
            value: Config.projection.default
        });

        const [ urlWrapper, urlInput ] = createUIInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-url',
            text: 'URL'
        });

        const [ parametersWrapper, parametersInput ] = createUIInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-parameters',
            text: 'Parameters (JSON)',
            placeholder: '{"Layers": "HPD_TRP"}'
        });

        const [ wrapXWrapper, wrapXSelect ] = createUISelect({
            idPrefix: ID_PREFIX,
            idPostfix: '-wrapx',
            text: 'WrapX',
            options: [
                {
                    text: 'False',
                    value: 'False'
                },
                {
                    text: 'True',
                    value: 'True'
                }
            ]
        });

        const [ corsWrapper, corsSelect ] = createUISelect({
            idPrefix: ID_PREFIX,
            idPostfix: '-cors',
            text: 'CORS',
            options: [
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
            ]
        });

        const [ attributionsWrapper, attributionsInput ] = createUIInput({
            idPrefix: ID_PREFIX,
            idPostfix: '-attributions',
            text: 'Attributions'
        });

        const buttonsWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-d-flex oltb-justify-content-between oltb-mt-15'
        });

        const createButton = DOM.createElement({
            element: 'button', 
            text: 'Create layer',
            class: 'oltb-dialog__btn oltb-btn oltb-btn--green-mid', 
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': () => {
                    const result = {
                        name: nameInput.value.trim(),
                        layer: typeSelect.value.trim(),
                        source: sourceSelect.value.trim(),
                        projection: projectionSelect.value.trim() || Config.projection.default,
                        url: urlInput.value.trim(),
                        parameters: parametersInput.value.trim() || '{}',
                        wrapX: wrapXSelect.value.trim(),
                        crossOrigin: corsSelect.value.trim(),
                        attributions: attributionsInput.value.trim(),
                        isDynamicallyAdded: true
                    };

                    this.close();
                    this.options.onCreate instanceof Function && this.options.onCreate(result);
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
                'type': 'button'
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