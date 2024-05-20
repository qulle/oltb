import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { DOM } from '../../helpers/browser/dom-factory';
import { Toast } from "./toast";
import { ElementManager } from '../../managers/element-manager/element-manager';

describe('Toast', () => {
    beforeAll(() => {
        // Note:
        // The ElementManager creates and returns a reference to the HTML element where all 
        // Toasts are injected in the DOM. Creating a new Toast will call the getToastElement and thus
        // it needs to be mocked and return a temp element for that can be used during the tests.
        jest.spyOn(ElementManager, 'getToastElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    it('should create a information-toast', () => {
        const toast = Toast.info();
        expect(toast).toBeTruthy();
        expect(toast.getType()).toBe('info');
    });

    it('should create a warning-toast', () => {
        const toast = Toast.warning();
        expect(toast).toBeTruthy();
        expect(toast.getType()).toBe('warning');
    });

    it('should create a error-toast', () => {
        const toast = Toast.error();
        expect(toast).toBeTruthy();
        expect(toast.getType()).toBe('error');
    });

    it('should create a success-toast', () => {
        const toast = Toast.success();
        expect(toast).toBeTruthy();
        expect(toast.getType()).toBe('success');
    });

    it('should create a information-toast with title "Foo" and message "Bar"', () => {
        const toast = Toast.info({
            title: 'Foo',
            message: 'Bar'
        });

        expect(toast.getTitle()).toBe('Foo');
        expect(toast.getMessage()).toBe('Bar');
    });

    it('should create a information-toast that has a spinner', () => {
        const toast = Toast.info({
            spinner: true
        });

        expect(toast.isSpinner()).toBe(true);
        expect(toast.getElement().childNodes[0].nodeName).toBe('DIV');
        expect(toast.getElement().childNodes[0].classList).toContain('oltb-spinner');
    });

    it('should create a information-toast that can not be removed by user', () => {
        const toast = Toast.info({
            clickToRemove: false
        });

        expect(toast.isClickableToRemove()).toBe(false);
        expect(toast.getElement().nodeName).toBe('DIV');
        expect(toast.getElement().classList).not.toContain('oltb-toast--clickable');
    });

    it('should create a information-toast that is removed after 5 seconds', () => {
        const spy = jest.spyOn(DOM, 'removeElement');
        const toast = Toast.info({
            autoremove: 5000
        });

        expect(toast.getAutoremoveNumber()).toBe(5000);

        window.setTimeout(() => {
            expect(spy).toHaveBeenCalled();
        }, 5000);
    });
});
