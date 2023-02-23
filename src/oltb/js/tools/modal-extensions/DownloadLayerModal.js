import { DOM } from '../../helpers/browser/DOM';
import { ModalBase } from '../../common/modals/ModalBase';
import { isDarkTheme } from '../../helpers/IsDarkTheme';

const PREFIX_LAYER_ID = 'oltb-download-layer-modal';
const DEFAULT_OPTIONS = Object.freeze({
    maximized: false,
    onClose: undefined,
    onDownload: undefined,
    onCancel: undefined
});

class DownloadLayerModal extends ModalBase {
    constructor(options = {}) {
        super('Download layer', options.maximized, options.onClose);
        this.options = { DEFAULT_OPTIONS, ...options };

        const formatWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        formatWrapper.appendChild(DOM.createElement({
            element: 'label', 
            text: 'Layer format',
            class: 'oltb-label', 
            attributes: {
                for: `${PREFIX_LAYER_ID}-layer-wrapx`
            }
        }));

        const formatSelect = DOM.createElement({
            element: 'select',
            id: `${PREFIX_LAYER_ID}-layer-type`,  
            class: 'oltb-select'
        });

        ['GeoJSON', 'KML'].forEach((item) => {
            formatSelect.appendChild(
                DOM.createElement({
                    element: 'option', 
                    text: item, 
                    value: item
                }
            ));
        });

        formatWrapper.appendChild(formatSelect);

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
                        format: formatSelect.value
                    };
        
                    this.close();
                    typeof this.options.onDownload === 'function' && this.options.onDownload(result);
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