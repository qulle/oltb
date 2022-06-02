import ModalBase from '../../common/Modals/ModalBase';
import DOM from '../../helpers/Browser/DOM';
import { isDarkTheme } from '../../helpers/IsDarkTheme';

const prefixLayerId = 'oltb-download-layer-modal';

class DownloadLayerModal extends ModalBase {
    constructor(onCreate, onCancel) {
        super('Download feature layer');

        // Create and populate select element with layer format values
        const layerFormatDiv = DOM.createElement({
            element: 'div', 
            attributes: {
                class: 'oltb-mt-0625'
            }
        });

        const layerFormatSelect = DOM.createElement({element: 'select', 
            attributes: {
                id: prefixLayerId + '-layer-type', 
                class: 'oltb-select'
            }
        });

        ['GeoJSON', 'KML'].forEach(value => {
            layerFormatSelect.appendChild(
                DOM.createElement({
                    element: 'option', 
                    text: value, 
                    attributes: {
                        value: value
                    }
                }
            ));
        });

        layerFormatDiv.appendChild(DOM.createElement({
            element: 'label', 
            text: 'Layer format', 
            attributes: {
                class: 'oltb-label',
                for: prefixLayerId + '-layer-wrapx'
            }
        }));

        layerFormatDiv.appendChild(layerFormatSelect);

        // Create buttons for download and cancel
        const layerButtonsDiv = DOM.createElement({
            element: 'div', 
            attributes: {
                class: 'oltb-d-flex oltb-justify-content-between oltb-mt-1'
            }
        });

        const downloadButton = DOM.createElement({
            element: 'button', 
            text: 'Download layer', 
            attributes: {
                type: 'button', 
                class: 'oltb-dialog__btn oltb-btn oltb-btn--green-mid'
            }
        });

        downloadButton.addEventListener('click', (event) => {
            const result = {
                format: layerFormatSelect.value
            };

            this.close();
            typeof onCreate === 'function' && onCreate(result);
        });

        const cancelButton = DOM.createElement({
            element: 'button', 
            text: 'Cancel', 
            attributes: {
                type: 'button', 
                class: `oltb-dialog__btn oltb-btn ${isDarkTheme() 
                    ? 'oltb-btn--gray-mid' 
                    : 'oltb-btn--gray-dark'}`
            }
        });

        cancelButton.addEventListener('click', (event) => {
            this.close();
            typeof onCancel === 'function' && onCancel();
        });

        layerButtonsDiv.appendChild(cancelButton);
        layerButtonsDiv.appendChild(downloadButton);

        // Add all DOM elements to the modalContent
        const modalContent = DOM.createElement({
            element: 'div', 
            attributes: {
                class: 'oltb-modal__content'
            }
        });
        
        DOM.appendChildren(modalContent, [
            layerFormatDiv,
            layerButtonsDiv
        ]);

        this.show(modalContent);
    }
}

export default DownloadLayerModal;