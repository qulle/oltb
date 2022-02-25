import { mapElement } from '../../core/ElementReferences';
import { SVGPaths, getIcon } from '../../core/Icons';
import { trapFocusKeyListener } from '../../helpers/TrapFocus';

const animationClass = 'oltb-animations--bounce';

class ModalBase {
    constructor(title = 'Modal title') {
        const modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'oltb-modal-backdrop oltb-modal-backdrop--fixed';
        modalBackdrop.setAttribute('tabindex', '-1');
        modalBackdrop.addEventListener('keydown', trapFocusKeyListener);
        modalBackdrop.addEventListener('click', this.bounceAnimation);

        const modal = document.createElement('div');
        modal.className = 'oltb-modal oltb-animations--bounce';

        const modalHeader = document.createElement('div');
        modalHeader.className = 'oltb-modal__header';

        const modalTitle = document.createElement('h2');
        modalTitle.className = 'oltb-modal__title';
        modalTitle.innerHTML = title;

        const modalClose = document.createElement('button');
        modalClose.setAttribute('type', 'button');
        modalClose.className = 'oltb-modal__close oltb-btn oltb-btn--blank';
        modalClose.innerHTML = getIcon({
            path: SVGPaths.Close, 
            fill: 'none', 
            stroke: 'currentColor'
        });
        modalClose.addEventListener('click', (event) => {
            event.preventDefault();
            this.close();
        });

        modalBackdrop.appendChild(modal);
        modal.appendChild(modalHeader);
        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(modalClose);

        this.modalBackdrop = modalBackdrop;
        this.modal = modal;

        window.addEventListener('keyup', (event) => {
            if(event.key === 'Escape') {
                this.close();
            }
        });
    }

    bounceAnimation(event) {
        // To prevent trigger the animation if clicked in the modal and not the backdrop
        if(event.target !== this) {
            return;
        }

        const modal = this.firstElementChild;
        modal.classList.remove(animationClass);

        // Trigger reflow of DOM, reruns animation when class is added back
        void modal.offsetWidth;

        modal.classList.add(animationClass);
    }

    show(modalContent) {
        this.modal.appendChild(modalContent);
        mapElement.appendChild(this.modalBackdrop);
        this.modalBackdrop.focus();
    }

    close() {
        this.modalBackdrop.removeEventListener('keydown', trapFocusKeyListener);
        this.modalBackdrop.remove();
    }
}

export default ModalBase;