import _ from 'lodash';
import { DOM } from '../../helpers/browser/dom-factory';
import { BaseModal } from './base-modal';
import { LogManager } from '../../managers/log-manager/log-manager';

const FILENAME = 'ModalWindow.js';
const CLASS_MODAL = 'oltb-modal';

const DefaultOptions = Object.freeze({
    title: 'Modal',
    content: 'Oops missing content'
});

class ModalWindow extends BaseModal {
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