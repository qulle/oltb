import ModalBase from './ModalBase';
import DOM from '../../helpers/Browser/DOM';

class ModalWindow extends ModalBase {
    constructor(options = {}) {
        const {
            title = 'Modal title',
            content = 'Modal content'
        } = options;

        super(title);

        const modalContent = DOM.createElement({
            element: 'div', 
            class: 'oltb-modal__content'
        });

        if(typeof content === 'string') {
            modalContent.innerHTML = content;
        }else {
            modalContent.appendChild(content);
        }

        this.show(modalContent);
    }
}

export default ModalWindow;