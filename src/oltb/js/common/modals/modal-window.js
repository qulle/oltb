import _ from 'lodash';
import { DOM } from '../../helpers/browser/document-object-model';
import { ModalBase } from './ModalBase';
import { LogManager } from '../../managers/LogManager';

const FILENAME = 'modals/ModalWindow.js';
const CLASS_MODAL = 'oltb-modal';

const DefaultOptions = Object.freeze({
    title: 'Modal',
    content: 'Oops missing content'
});

class ModalWindow extends ModalBase {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        super(
            options.title || DefaultOptions.title,
            options.maximized,
            options.onClose
        );

        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        this.#createModal();
    }

    #createModal() {
        this.modalContent = DOM.createElement({
            element: 'div', 
            class: `${CLASS_MODAL}__content`
        });

        this.setContent(this.options.content);
        this.show(this.modalContent);
    }

    //--------------------------------------------------------------------
    // # Section: Public API
    //--------------------------------------------------------------------
    setContent(content) {
        if(typeof content === 'string') {
            this.modalContent.innerHTML = content;
        }else {
            DOM.appendChildren(this.modalContent, [
                content
            ]);
        }
    }
}

export { ModalWindow };