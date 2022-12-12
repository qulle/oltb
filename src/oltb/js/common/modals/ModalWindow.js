import DOM from '../../helpers/Browser/DOM';
import ModalBase from './ModalBase';

const DEFAULT_OPTIONS = {
    title: 'Default modal title',
    content: 'Default modal content'
};

class ModalWindow extends ModalBase {
    constructor(options = {}) {
        super(
            options.title || DEFAULT_OPTIONS.title,
            options.onClose
        );

        this.options = { ...DEFAULT_OPTIONS, ...options };

        this.modalContent = DOM.createElement({
            element: 'div', 
            class: 'oltb-modal__content'
        });

        this.setContent(this.options.content);
        this.show(this.modalContent);
    }

    setContent(content) {
        if(typeof content === 'string') {
            this.modalContent.innerHTML = content;
        }else {
            this.modalContent.appendChild(content);
        }
    }
}

export default ModalWindow;