import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { Modal } from './modal';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

describe('Modal', () => {
    beforeEach(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should test the modal-shortcut-interface', () => {
        const modal = Modal.create({});
        
        expect(modal).toBeTruthy();
        expect(modal.getTitle()).toBe('Modal');
        expect(modal.getContent()).toBeUndefined();
        expect(modal.getOnClose()).toBeUndefined();
        expect(modal.isMaximized()).toBe(false);
    });
});