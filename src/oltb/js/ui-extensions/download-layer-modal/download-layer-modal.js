import _ from 'lodash';
import { DOM } from '../../browser-helpers/dom-factory';
import { BaseModal } from '../../ui-common/ui-modals/base-modal';
import { isDarkTheme } from '../../ui-helpers/is-dark-theme/is-dark-theme';
import { FormatOptions } from '../../ol-mappers/ol-format/ol-format';
import { createUISelect } from '../../ui-creators/ui-select/create-ui-select';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';

const FILENAME = 'download-layer-modal.js';
const ID__PREFIX = 'oltb-download-layer-modal';
const I18N__BASE = 'modalExtensions.downloadLayerModal';

// Note:
// Only specify the unique options to this class
// Things to override on the BaseModal is passed directly
const DefaultOptions = Object.freeze({
    onDownload: undefined,
    onCancel: undefined
});

/**
 * About:
 * Manager that handles downloading of vector layers
 */
class DownloadLayerModal extends BaseModal {
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
        const [ formatWrapper, formatSelect ] = createUISelect({
            idPrefix: ID__PREFIX,
            idPostfix: '-format',
            text: i18n.layerFormat,
            options: _.cloneDeep(FormatOptions)
        });

        const buttonsWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-d-flex oltb-justify-content-between oltb-mt-15' 
        });

        const downloadButton = DOM.createElement({
            element: 'button', 
            text: i18n.download,
            class: 'oltb-dialog__btn oltb-btn oltb-btn--green-mid', 
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': () => {
                    this.#onDownload({
                        format: formatSelect.value.trim()
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
            downloadButton
        ]);

        const modalContent = DOM.createElement({
            element: 'div',
            class: 'oltb-modal__content'
        });
        
        DOM.appendChildren(modalContent, [
            formatWrapper,
            buttonsWrapper
        ]);

        this.#buttons = [cancelButton, downloadButton];
        this.show(modalContent);
    }

    //--------------------------------------------------------------------
    // # Section: Events
    //--------------------------------------------------------------------
    #onDownload(result) {
        this.close();
        this.options.onDownload && this.options.onDownload(result);
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

export { DownloadLayerModal };