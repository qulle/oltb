import ModalBase from '../../common/Modals/ModalBase';
import DOM from '../../helpers/Browser/DOM';
import Toast from '../../common/Toast';
import { copyToClipboard } from '../../helpers/Browser/CopyToClipboard';

class DebugInfoModal extends ModalBase {
    constructor(map, information) {
        super('Debug information');

        const textArea = DOM.createElement({element: 'textarea', 
            value: JSON.stringify(information, undefined, 4),
            attributes: {
                class: 'oltb-input oltb-hide-scrollbars',
                rows: 15,
                cols: 50,
                spellcheck: 'false'
            }
        });

        const copyButton = DOM.createElement({element: 'button',
            text: 'Copy debug info',
            attributes: {
                type: 'button',
                class: 'oltb-btn oltb-btn--green-mid oltb-mt-1'
            }
        });

        copyButton.addEventListener('click', function(params) {
            const copyStatus = copyToClipboard(textArea.value);
        
            if(copyStatus) {
                Toast.success({text: 'Debug info copied to clipboard', autoremove: 3000});
            }else {
                Toast.error({text: 'Failed to copy debug info'});
            }
        });

        const logFullMapObjectButton = DOM.createElement({element: 'button',
            text: 'Log map object',
            attributes: {
                type: 'button',
                class: 'oltb-btn oltb-btn--green-mid oltb-mt-1 oltb-ml-0625'
            }
        });

        logFullMapObjectButton.addEventListener('click', function() {
            console.log(map);
            Toast.success({text: 'Map object logged to console (F12)', autoremove: 3000});
        });

        const buttonWrapper = DOM.createElement({element: 'div'}); 

        DOM.appendChildren(buttonWrapper, [copyButton, logFullMapObjectButton]);

        // Add all DOM elements to the modalContent
        const modalContent = DOM.createElement({element: 'div', attributes: {class: 'oltb-modal__content oltb-flex-content-center'}});
        DOM.appendChildren(modalContent, [textArea, buttonWrapper]);
        
        this.show(modalContent);
    }
}

export default DebugInfoModal;