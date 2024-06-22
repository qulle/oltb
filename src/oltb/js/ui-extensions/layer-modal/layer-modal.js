import _ from 'lodash';
import { DOM } from '../../browser-helpers/dom-factory';
import { BaseModal } from '../../ui-common/ui-modals/base-modal';
import { isDarkTheme } from '../../ui-helpers/is-dark-theme/is-dark-theme';
import { LayerOptions } from '../../ol-mappers/ol-layer/ol-layer';
import { SourceOptions } from '../../ol-mappers/ol-source/ol-source';
import { ConfigManager } from '../../toolbar-managers/config-manager/config-manager';
import { createUIInput } from '../../ui-creators/ui-input/create-ui-input';
import { createUISelect } from '../../ui-creators/ui-select/create-ui-select';
import { ProjectionManager } from '../../toolbar-managers/projection-manager/projection-manager';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';

const FILENAME = 'layer-modal.js';
const ID__PREFIX = 'oltb-layer-modal';
const I18N__BASE = 'modalExtensions.layerModal';

// Note:
// Only specify the unique options to this class
// Things to override on the BaseModal is passed directly
const DefaultOptions = Object.freeze({
    name: '',
    onCreate: undefined,
    onCancel: undefined
});

/**
 * About:
 * Manager that handles creation of Map-Layers
 */
class LayerModal extends BaseModal {
    #buttons = [];
    
    constructor(options = {}) {
        super({
            filename: FILENAME,
            title: TranslationManager.get(`${I18N__BASE}.title`), 
            ...options
        });
        
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        this.#createModalContent();
    }

    //--------------------------------------------------------------------
    // # Section: Overridden
    //--------------------------------------------------------------------
    getName() {
        return super.getName();
    }

    //--------------------------------------------------------------------
    // # Section: User Interface
    //--------------------------------------------------------------------
    #createModalContent() {
        const i18n = TranslationManager.get(`${I18N__BASE}.form`);
        const [ nameWrapper, nameInput ] = createUIInput({
            idPrefix: ID__PREFIX,
            idPostfix: '-name',
            text: i18n.name,
            value: this.options.name ?? 'New map layer'
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
                    this.#onCreate({
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

        this.#buttons = [cancelButton, createButton];
        this.show(modalContent);
    }

    //--------------------------------------------------------------------
    // # Section: Events
    //--------------------------------------------------------------------
    #onCreate(result) {
        this.close();
        this.options.onCreate && this.options.onCreate(result);
    }

    #onCancel() {
        this.close();
        this.options.onCancel && this.options.onCancel();
    }

    //--------------------------------------------------------------------
    // # Section: Public API
    //--------------------------------------------------------------------
    getButtons() {
        return this.#buttons;
    }
}

export { LayerModal };