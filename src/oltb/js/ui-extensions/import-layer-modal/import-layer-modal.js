import _ from 'lodash';
import { DOM } from '../helpers/browser/dom-factory';
import { BaseModal } from '../common/modals/base-modal';
import { isDarkTheme } from '../helpers/is-dark-theme';
import { ConfigManager } from '../managers/config-manager/config-manager';
import { createUISelect } from '../creators/create-ui-select';
import { ProjectionManager } from '../managers/projection-manager/projection-manager';
import { TranslationManager } from '../managers/translation-manager/translation-manager';

const FILENAME = 'import-layer-modal.js';
const ID__PREFIX = 'oltb-import-layer-modal';
const I18N__BASE = 'modalExtensions.importLayerModal';

const DefaultOptions = Object.freeze({
    maximized: false,
    onClose: undefined,
    onImport: undefined,
    onCancel: undefined
});

/**
 * About:
 * Manager that handles importing of vector layers
 */
class ImportLayerModal extends BaseModal {
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
        const featureProjectionOptions = [];
        const dataProjectionOptions = [];

        const projections = ProjectionManager.getProjections();
        projections.forEach((projection) => {
            featureProjectionOptions.push({
                text: `${projection.name} (${projection.code})`, 
                value: projection.code
            });

            dataProjectionOptions.push({
                text: `${projection.name} (${projection.code})`, 
                value: projection.code
            });
        });

        const projection = ConfigManager.getConfig().projection;
        const [ featureProjectionWrapper, featureProjectionSelect ] = createUISelect({
            idPrefix: ID__PREFIX,
            idPostfix: '-feature-projection',
            text: i18n.featureProjection,
            options: featureProjectionOptions,
            value: projection.default
        });

        const [ dataProjectionWrapper, dataProjectionSelect ] = createUISelect({
            idPrefix: ID__PREFIX,
            idPostfix: '-data-projection',
            text: i18n.dataProjection,
            options: dataProjectionOptions,
            value: projection.wgs84
        });

        const buttonsWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-d-flex oltb-justify-content-between oltb-mt-15' 
        });

        const importButton = DOM.createElement({
            element: 'button', 
            text: i18n.import,
            class: 'oltb-dialog__btn oltb-btn oltb-btn--green-mid', 
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': () => {
                    this.#onClick({
                        featureProjection: featureProjectionSelect.value.trim(),
                        dataProjection: dataProjectionSelect.value.trim()
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
            importButton
        ]);

        const modalContent = DOM.createElement({
            element: 'div',
            class: 'oltb-modal__content'
        });
        
        DOM.appendChildren(modalContent, [
            featureProjectionWrapper,
            dataProjectionWrapper,
            buttonsWrapper
        ]);

        this.show(modalContent);
    }

    //--------------------------------------------------------------------
    // # Section: Events
    //--------------------------------------------------------------------
    #onClick(result) {
        this.close();
        this.options.onImport instanceof Function && this.options.onImport(result);
    }

    #onCancel() {
        this.close();
        this.options.onCancel instanceof Function && this.options.onCancel();
    }
}

export { ImportLayerModal };