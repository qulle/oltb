import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { DOM } from '../../helpers/browser/dom-factory';
import { BaseToast } from './base-toast';
import { ElementManager } from '../../managers/element-manager/element-manager';

describe('BaseToast', () => {
    beforeAll(() => {
        jest.spyOn(ElementManager, 'getToastElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    it('should create a default toast', () => {
        const toast = new BaseToast({});
        
        expect(toast).toBeTruthy();
        expect(toast.getTitle()).toBe('Toast');
        expect(toast.getMessage()).toBe('');
        expect(toast.getI18NKey()).toBeUndefined();
        expect(toast.getAutoremoveNumber()).toBeUndefined();
        expect(toast.isClickableToRemove()).toBe(true);
        expect(toast.isSpinner()).toBe(false);
    });

    it('should create a toast with title "Foo" and message "Bar"', () => {
        const toast = new BaseToast({
            title: 'Foo',
            message: 'Bar'
        });

        expect(toast.getTitle()).toBe('Foo');
        expect(toast.getMessage()).toBe('Bar');
    });

    it('should create a toast that has a spinner', () => {
        const toast = new BaseToast({
            spinner: true
        });

        expect(toast.isSpinner()).toBe(true);
        expect(toast.getElement().childNodes[0].nodeName).toBe('DIV');
        expect(toast.getElement().childNodes[0].classList).toContain('oltb-spinner');
    });

    it('should create a toast that can not be removed by user', () => {
        const toast = new BaseToast({
            clickToRemove: false
        });

        expect(toast.isClickableToRemove()).toBe(false);
        expect(toast.getElement().nodeName).toBe('DIV');
        expect(toast.getElement().classList).not.toContain('oltb-toast--clickable');
    });

    it('should create a toast that is removed after 5 seconds', () => {
        const spy = jest.spyOn(DOM, 'removeElement');
        const toast = new BaseToast({
            autoremove: 5000
        });

        expect(toast.getAutoremoveNumber()).toBe(5000);

        window.setTimeout(() => {
            expect(spy).toHaveBeenCalled();
        }, 5000);
    });
});
