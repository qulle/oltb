import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { DOM } from '../../browser-helpers/dom-factory';
import { BaseToast } from './base-toast';
import { ConfigManager } from '../../toolbar-managers/config-manager/config-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

describe('BaseToast', () => {
    beforeEach(() => {
        jest.spyOn(ElementManager, 'getToastElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should create a default toast', () => {
        const toast = new BaseToast();
        
        expect(toast).toBeTruthy();
        expect(toast.getTitle()).toBe('Toast');
        expect(toast.getMessage()).toBe('');
        expect(toast.getI18NKey()).toBeUndefined();
        expect(toast.isAutoremove()).toBe(false);
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
        const spyOnRemoveElement = jest.spyOn(DOM, 'removeElement');
        const timeout = ConfigManager.getConfig().autoRemovalDuation.normal;
        const toast = new BaseToast({
            autoremove: true
        });

        window.setTimeout(() => {
            expect(toast.isAutoremove()).toBe(true);
            expect(spyOnRemoveElement).toHaveBeenCalled();
        }, timeout);
    });

    it('should create a toast and remove it', () => {
        const spyOnRemoveElement = jest.spyOn(DOM, 'removeElement');
        const timeout = ConfigManager.getConfig().autoRemovalDuation.normal;
        const toast = new BaseToast();
        toast.remove();

        window.setTimeout(() => {
            expect(spyOnRemoveElement).toHaveBeenCalled();
        }, timeout);
    });
});
