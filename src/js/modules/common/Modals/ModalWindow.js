import ModalBase from './ModalBase';

class ModalWindow extends ModalBase {
    constructor(options = {}) {
        const {
            title = 'Modal title',
            content = 'Modal content'
        } = options;

        super(title);
    
        const modalContent = document.createElement('div');
        modalContent.className = 'oltb-modal__content';

        if(typeof content === 'string') {
            modalContent.innerHTML = content;
        }else {
            modalContent.appendChild(content);
        }

        this.show(modalContent);
    }
}

export default ModalWindow;