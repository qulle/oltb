import _ from 'lodash';
import { DOM } from '../../helpers/browser/DOM';
import { ModalBase } from '../../common/modals/ModalBase';
import { LogManager } from '../../managers/LogManager';
import { isDarkTheme } from '../../helpers/IsDarkTheme';
import { FormatOptions } from '../../ol-types/FormatType';
import { createUISelect } from '../../creators/CreateUISelect';
import { TranslationManager } from '../../managers/TranslationManager';

const FILENAME = 'modal-extensions/DownloadLayerModal.js';
const ID_PREFIX = 'oltb-download-layer-modal';
const I18N_BASE = 'modalExtensions.downloadLayerModal';

const DefaultOptions = Object.freeze({
    maximized: false,
    onClose: undefined,
    onDownload: undefined,
    onCancel: undefined
});

/**
 * About:
 * Manager that handles downloading of vector layers
 */
class DownloadLayerModal extends ModalBase {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super(
            TranslationManager.get(`${I18N_BASE}.title`),
            options.maximized, 
            options.onClose
        );

        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        this.#createModal();
    }

    getName() {
        return FILENAME;
    }

    // -------------------------------------------------------------------
    // # Section: User Interface
    // -------------------------------------------------------------------

    #createModal() {
        const i18n = TranslationManager.get(`${I18N_BASE}.form`);
        const [ formatWrapper, formatSelect ] = createUISelect({
            idPrefix: ID_PREFIX,
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
                    this.#onClick({
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

        this.show(modalContent);
    }

    // -------------------------------------------------------------------
    // # Section: Events
    // -------------------------------------------------------------------

    #onClick(result) {
        this.close();
        this.options.onDownload instanceof Function && this.options.onDownload(result);
    }

    #onCancel() {
        this.close();
        this.options.onCancel instanceof Function && this.options.onCancel();
    }
}

export { DownloadLayerModal };