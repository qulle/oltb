import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { DOM } from '../../helpers/browser/dom-factory';
import { Modal } from './modal';
import { ElementManager } from '../../managers/element-manager/element-manager';

describe('Modal', () => {
    beforeAll(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    it('should create a default modal', () => {
        const modal = Modal.create();
        
        expect(modal).toBeTruthy();
        expect(modal.getTitle()).toBe('Modal');
        expect(modal.getContent()).toBeUndefined();
        expect(modal.getOnClose()).toBeUndefined();
        expect(modal.isMaximized()).toBe(false);
    });

    it('should create a modal with title of "Simple modal"', () => {
        const modal = Modal.create({
            title: 'Simple modal'
        });

        expect(modal.getTitle()).toBe('Simple modal');
    });

    it('should create a modal with string content of "Modal message"', () => {
        const modal = Modal.create({
            content: 'Modal message'
        });

        expect(modal.getContent()).toBe('Modal message');
    });

    it('should create a modal with element content of "DIV"', () => {
        const content = window.document.createElement('DIV');
        const modal = Modal.create({
            content: content
        });

        expect(modal.getContent().nodeName).toBe('DIV');
    });

    it('should create a maximized modal', () => {
        const modal = Modal.create({
            maximized: true
        });

        expect(modal.isMaximized()).toBe(true);
    });

    it('should create a modal and close it', () => {
        const spy = jest.spyOn(DOM, 'removeElement');
        const toast = Modal.create();
        toast.close();

        expect(spy).toHaveBeenCalled();
    });
});