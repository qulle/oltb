import ModalBase from '../../common/Modals/ModalBase';
import DOM from '../../helpers/Browser/DOM';
import Toast from '../../common/Toast';
import { copyToClipboard } from '../../helpers/Browser/CopyToClipboard';

class DebugInfoModal extends ModalBase {
    constructor(map, information) {
        super('Debug information');

        const textArea = DOM.createElement({
            element: 'textarea', 
            value: JSON.stringify(information, undefined, 4),
            class: 'oltb-input oltb-hide-scrollbars',
            attributes: {
                rows: 15,
                cols: 50,
                spellcheck: 'false'
            }
        });

        const copyButton = DOM.createElement({
            element: 'button',
            text: 'Copy debug info',
            class: 'oltb-btn oltb-btn--green-mid oltb-mt-1',
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': async () => {
                    const didCopy = await copyToClipboard(textArea.value);
        
                    if(didCopy) {
                        Toast.success({text: 'Debug info copied to clipboard', autoremove: 3000});
                    }else {
                        Toast.error({text: 'Failed to copy debug info'});
                    } 
                }
            }
        });

        const logFullMapObjectButton = DOM.createElement({
            element: 'button',
            text: 'Log map object',
            class: 'oltb-btn oltb-btn--green-mid oltb-mt-1 oltb-ml-0625',
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': () => {
                    console.log(map);
                    Toast.success({text: 'Map object logged to console (F12)', autoremove: 3000});
                }
            }
        });
        
        const buttonWrapper = DOM.createElement({
            element: 'div'
        }); 

        DOM.appendChildren(buttonWrapper, [
            copyButton, 
            logFullMapObjectButton
        ]);

        // Add all DOM elements to the modalContent
        const modalContent = DOM.createElement({
            element: 'div',
            class: 'oltb-modal__content oltb-flex-content-center' 
        });
        
        DOM.appendChildren(modalContent, [
            textArea, 
            buttonWrapper
        ]);
        
        this.show(modalContent);
    }
}

export default DebugInfoModal;