import ModalBase from '../../common/Modals/ModalBase';
import DOM from '../../helpers/Browser/DOM';
import { isDarkTheme } from '../../helpers/IsDarkTheme';

const PREFIX_LAYER_ID = 'oltb-download-layer-modal';

class DownloadLayerModal extends ModalBase {
    constructor(onCreate, onCancel) {
        super('Download layer');

        // Create and populate select element with layer format values
        const layerFormatDiv = DOM.createElement({
            element: 'div',
            class: 'oltb-mt-0625'
        });

        const layerFormatSelect = DOM.createElement({
            element: 'select',
            id: PREFIX_LAYER_ID + '-layer-type',  
            class: 'oltb-select'
        });

        ['GeoJSON', 'KML'].forEach(value => {
            layerFormatSelect.appendChild(
                DOM.createElement({
                    element: 'option', 
                    text: value, 
                    value: value
                }
            ));
        });

        layerFormatDiv.appendChild(DOM.createElement({
            element: 'label', 
            text: 'Layer format',
            class: 'oltb-label', 
            attributes: {
                for: PREFIX_LAYER_ID + '-layer-wrapx'
            }
        }));

        layerFormatDiv.appendChild(layerFormatSelect);

        // Create buttons for download and cancel
        const layerButtonsDiv = DOM.createElement({
            element: 'div',
            class: 'oltb-d-flex oltb-justify-content-between oltb-mt-1' 
        });

        const downloadButton = DOM.createElement({
            element: 'button', 
            text: 'Download layer',
            class: 'oltb-dialog__btn oltb-btn oltb-btn--green-mid', 
            attributes: {
                type: 'button'
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
            class: `oltb-dialog__btn oltb-btn ${isDarkTheme() ? 'oltb-btn--gray-mid' : 'oltb-btn--gray-dark'}`,
            attributes: {
                type: 'button'
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
            class: 'oltb-modal__content'
        });
        
        DOM.appendChildren(modalContent, [
            layerFormatDiv,
            layerButtonsDiv
        ]);

        this.show(modalContent);
    }
}

export default DownloadLayerModal;