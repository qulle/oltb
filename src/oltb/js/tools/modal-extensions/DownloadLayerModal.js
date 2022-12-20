import { DOM } from '../../helpers/browser/DOM';
import { ModalBase } from '../../common/modals/ModalBase';
import { isDarkTheme } from '../../helpers/IsDarkTheme';

const PREFIX_LAYER_ID = 'oltb-download-layer-modal';

class DownloadLayerModal extends ModalBase {
    constructor(onCreate, onCancel) {
        super('Download layer');

        // Create and populate select element with layer format values
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

        ['GeoJSON', 'KML'].forEach((value) => {
            formatSelect.appendChild(
                DOM.createElement({
                    element: 'option', 
                    text: value, 
                    value: value
                }
            ));
        });

        formatWrapper.appendChild(formatSelect);

        // Create buttons for download and cancel
        const buttonsWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-d-flex oltb-justify-content-between oltb-mt-1' 
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
                    typeof onCreate === 'function' && onCreate(result);
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
                    typeof onCancel === 'function' && onCancel();
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