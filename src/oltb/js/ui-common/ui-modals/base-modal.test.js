import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { DOM } from '../../browser-helpers/dom-factory';
import { BaseModal } from './base-modal';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { simulateKeyPress } from '../../../../../__mocks__/simulate-key-press';

describe('BaseModal', () => {
    beforeEach(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should create a default modal', () => {
        const modal = new BaseModal();
        
        expect(modal).toBeTruthy();
        expect(modal.getTitle()).toBe('Modal');
        expect(modal.getContent()).toBeUndefined();
        expect(modal.getOnClose()).toBeUndefined();
        expect(modal.isMaximized()).toBe(false);
        expect(modal.options).toStrictEqual({
            title: 'Modal',
            maximized: false,
            pushWidth: false,
            content: undefined,
            onClose: undefined
        });
    });

    it('should create a modal with title of "Simple modal"', () => {
        const modal = new BaseModal({
            title: 'Simple modal'
        });

        expect(modal.getTitle()).toBe('Simple modal');
    });

    it('should create a modal with string content of "Modal message"', () => {
        const modal = new BaseModal({
            content: 'Modal message'
        });

        expect(modal.getContent()).toBe('Modal message');
    });

    it('should create a modal with element content of "DIV"', () => {
        const content = window.document.createElement('div');
        const modal = new BaseModal({
            content: content
        });

        expect(modal.getContent().nodeName).toBe('DIV');
    });

    it('should create a maximized modal', () => {
        const modal = new BaseModal({
            maximized: true
        });

        expect(modal.isMaximized()).toBe(true);
    });

    it('should create a modal and close it', () => {
        const options = {onClose: () => {}};
        const spyOnOnClose = jest.spyOn(options, 'onClose');
        const spyOnRemoveElement = jest.spyOn(DOM, 'removeElement');

        const toast = new BaseModal(options);
        toast.close();

        expect(spyOnRemoveElement).toHaveBeenCalled();
        expect(spyOnOnClose).toHaveBeenCalled();
    });

    it('should close modal when Escape-key is pressed', () => {
        const modal = new BaseModal();
        const spyOnClose = jest.spyOn(modal, 'close');
        simulateKeyPress('keyup', window, 'Escape');

        expect(spyOnClose).toHaveBeenCalled();
    });

    it('should modal if backdrop is clicked', () => {
        const spyOnRunAnimation = jest.spyOn(DOM, 'runAnimation');
        const modal = new BaseModal();
        modal.backdrop.click();

        expect(spyOnRunAnimation).toHaveBeenCalled();
    });
});