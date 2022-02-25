import ModalBase from '../../common/Modals/ModalBase';
import DOM from '../../helpers/DOM';
import Toast from '../../common/Toast';
import { copyToClipboard } from '../../helpers/CopyToClipboard';

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
                class: 'oltb-btn oltb-btn--dark-green oltb-mt-1'
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
                class: 'oltb-btn oltb-btn--dark-green oltb-mt-1 oltb-ml-0625'
            }
        });

        logFullMapObjectButton.addEventListener('click', function() {
            console.log(map);
            Toast.success({text: 'Map object logged to console (F12)', autoremove: 3000});
        });

        const buttonWrapper = DOM.createElement({element: 'div'}); 

        DOM.appendChildren(buttonWrapper, [copyButton, logFullMapObjectButton]);

        const wrapper = DOM.createElement({element: 'div', 
            attributes: {
                class: 'oltb-flex-content-center'
            }
        });

        DOM.appendChildren(wrapper, [textArea, buttonWrapper]);

        this.show(wrapper);
    }
}

export default DebugInfoModal;