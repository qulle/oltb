import ModalBase from './ModalBase';
import DOM from '../../helpers/Browser/DOM';

const DEFAULT_OPTIONS = {
    title: 'Modal title',
    content: 'Modal content'
};

class ModalWindow extends ModalBase {
    constructor(options = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options };

        super(this.options.title);

        const modalContent = DOM.createElement({
            element: 'div', 
            class: 'oltb-modal__content'
        });

        if(typeof this.options.content === 'string') {
            modalContent.innerHTML = this.options.content;
        }else {
            modalContent.appendChild(this.options.content);
        }

        this.show(modalContent);
    }
}

export default ModalWindow;