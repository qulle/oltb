import _ from 'lodash';
import { DOM } from '../helpers/browser/dom-factory';
import { BaseModal } from '../common/modals/base-modal';
import { isDarkTheme } from '../helpers/is-dark-theme';
import { LayerOptions } from '../ol-mappers/ol-layer';
import { SourceOptions } from '../ol-mappers/ol-source';
import { ConfigManager } from '../managers/config-manager/config-manager';
import { createUIInput } from '../creators/create-ui-input';
import { createUISelect } from '../creators/create-ui-select';
import { ProjectionManager } from '../managers/projection-manager/projection-manager';
import { TranslationManager } from '../managers/translation-manager/translation-manager';

const FILENAME = 'layer-modal.js';
const ID__PREFIX = 'oltb-layer-modal';
const I18N__BASE = 'modalExtensions.layerModal';

const DefaultOptions = Object.freeze({
    maximized: false,
    onClose: undefined,
    onCreate: undefined,
    onCancel: undefined
});

/**
 * About:
 * Manager that handles creation of Map-Layers
 */
class LayerModal extends BaseModal {
    constructor(options = {}) {
        super(
            TranslationManager.get(`${I18N__BASE}.title`), 
            options.maximized, 
            options.onClose
        );
        
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        this.#createModal();
    }

    getName() {
        return FILENAME;
    }

    //--------------------------------------------------------------------
    // # Section: User Interface
    //--------------------------------------------------------------------
    #createModal() {
        const i18n = TranslationManager.get(`${I18N__BASE}.form`);
        const [ nameWrapper, nameInput ] = createUIInput({
            idPrefix: ID__PREFIX,
            idPostfix: '-name',
            text: i18n.name,
            value: 'New map layer'
        });

        const [ typeWrapper, typeSelect ] = createUISelect({
            idPrefix: ID__PREFIX,
            idPostfix: '-type',
            text: i18n.layer,
            options: _.cloneDeep(LayerOptions)
        });

        const [ sourceWrapper, sourceSelect ] = createUISelect({
            idPrefix: ID__PREFIX,
            idPostfix: '-source',
            text: i18n.source,
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
            idPrefix: ID__PREFIX,
            idPostfix: '-projection',
            text: i18n.projection,
            options: projectionOptions,
            value: ConfigManager.getConfig().projection.default
        });

        const [ urlWrapper, urlInput ] = createUIInput({
            idPrefix: ID__PREFIX,
            idPostfix: '-url',
            text: i18n.url
        });

        const [ parametersWrapper, parametersInput ] = createUIInput({
            idPrefix: ID__PREFIX,
            idPostfix: '-parameters',
            text: i18n.parameters,
            placeholder: '{"Layers": "HPD_TRP"}'
        });

        const [ wrapXWrapper, wrapXSelect ] = createUISelect({
            idPrefix: ID__PREFIX,
            idPostfix: '-wrapx',
            text: i18n.wrapX,
            options: [
                {
                    text: 'False',
                    value: 'False'
                }, {
                    text: 'True',
                    value: 'True'
                }
            ]
        });

        const [ corsWrapper, corsSelect ] = createUISelect({
            idPrefix: ID__PREFIX,
            idPostfix: '-cors',
            text: i18n.cors,
            options: [
                {
                    text: 'Anonymous',
                    value: 'anonymous'
                }, {
                    text: 'Credentials',
                    value: 'use-credentials'
                }, {
                    text: 'None',
                    value: 'undefined'
                }
            ]
        });

        const [ attributionsWrapper, attributionsInput ] = createUIInput({
            idPrefix: ID__PREFIX,
            idPostfix: '-attributions',
            text: i18n.attributions
        });

        const buttonsWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-d-flex oltb-justify-content-between oltb-mt-15'
        });

        const defaultProjection = ConfigManager.getConfig().projection.default;
        const createButton = DOM.createElement({
            element: 'button', 
            text: i18n.createLayer,
            class: 'oltb-dialog__btn oltb-btn oltb-btn--green-mid', 
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': () => {
                    this.#onClick({
                        name: nameInput.value.trim(),
                        layer: typeSelect.value.trim(),
                        source: sourceSelect.value.trim(),
                        projection: projectionSelect.value.trim() || defaultProjection,
                        url: urlInput.value.trim(),
                        parameters: parametersInput.value.trim() || '{}',
                        wrapX: wrapXSelect.value.trim(),
                        crossOrigin: corsSelect.value.trim(),
                        attributions: attributionsInput.value.trim(),
                        isDynamicallyAdded: true
                    });
                }
            }
        });

        const cancelButton = DOM.createElement({
            element: 'button', 
            text: i18n.cancel, 
            class: `oltb-dialog__btn oltb-btn ${
                isDarkTheme() ? 'oltb-btn--gray-mid' : 'oltb-btn--gray-dark'
            }`,
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': this.#onCancel.bind(this)
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

    //--------------------------------------------------------------------
    // # Section: Events
    //--------------------------------------------------------------------
    #onClick(result) {
        this.close();
        this.options.onCreate instanceof Function && this.options.onCreate(result);
    }

    #onCancel() {
        this.close();
        this.options.onCancel instanceof Function && this.options.onCancel();
    }
}

export { LayerModal };