import _ from 'lodash';
import { DOM } from '../../helpers/browser/DOM';
import { ModalBase } from '../../common/modals/ModalBase';
import { LogManager } from '../../core/managers/LogManager';
import { isDarkTheme } from '../../helpers/IsDarkTheme';
import { FormatOptions } from '../../core/ol-types/FormatType';
import { generateSelect } from '../../generators/GenerateSelect';

const FILENAME = 'modal-extensions/DownloadLayerModal.js';
const ID_PREFIX = 'oltb-download-layer-modal';

const DefaultOptions = Object.freeze({
    maximized: false,
    onClose: undefined,
    onDownload: undefined,
    onCancel: undefined
});

class DownloadLayerModal extends ModalBase {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super(
            'Download layer', 
            options.maximized, 
            options.onClose
        );

        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        this.#createModal();
    }

    #createModal() {
        const [ formatWrapper, formatSelect ] = generateSelect({
            idPrefix: ID_PREFIX,
            idPostfix: '-format',
            text: 'Layer format',
            options: structuredClone(FormatOptions)
        });

        const buttonsWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-d-flex oltb-justify-content-between oltb-mt-15' 
        });

        const downloadButton = DOM.createElement({
            element: 'button', 
            text: 'Download layer',
            class: 'oltb-dialog__btn oltb-btn oltb-btn--green-mid', 
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': () => {
                    const result = {
                        format: formatSelect.value.trim()
                    };
        
                    this.close();
                    this.options.onDownload instanceof Function && this.options.onDownload(result);
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
}

export { DownloadLayerModal };