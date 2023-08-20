import { Keys } from '../constants/Keys';

const trapFocus = function(event) {
    const isTabKey = event.key === Keys.valueTab;
    if(!isTabKey) {
        return;
    }

    const elements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const uiRefFirstElement = this.querySelectorAll(elements)[0];
    const uiRefContent = this.querySelectorAll(elements);
    const uiRefLastElement = uiRefContent[uiRefContent.length - 1];

    if(event.shiftKey) {
        if(document.activeElement === uiRefFirstElement) {
            uiRefLastElement.focus();
            event.preventDefault();
        }
    }else {
        if(document.activeElement === uiRefLastElement) {
            uiRefFirstElement.focus();
            event.preventDefault();
        }
    }
}

export { trapFocus };