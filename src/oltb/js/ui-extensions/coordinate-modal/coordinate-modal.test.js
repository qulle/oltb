import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { CoordinateModal } from './coordinate-modal';

const FILENAME = 'coordinate-model.js';

describe('CoordinateModal', () => {
    beforeAll(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    it('should create modal-extension', () => {
        const modal = new CoordinateModal({
            title: 'jest'
        });

        expect(modal).toBeTruthy();
        expect(modal.getName()).toBe(FILENAME);
        expect(modal.getTitle()).toBe('jest');
        expect(modal.getButtons().length).toBe(2);
    });

    it('should test callback [onCancel]', () => {
        const callback = {onCancel: () => {}};
        const spy = jest.spyOn(callback, 'onCancel');
        const modal = new CoordinateModal({
            onCancel: callback.onCancel
        });

        const cancelButton = modal.getButtons()[0];
        cancelButton.click();

        expect(cancelButton.nodeName).toBe('BUTTON');
        expect(spy).toHaveBeenCalled();
    });

    it('should test callback [onNavigate]', () => {
        const callback = {onNavigate: () => {}};
        const spy = jest.spyOn(callback, 'onNavigate');
        const modal = new CoordinateModal({
            onNavigate: callback.onNavigate
        });

        const navigateButton = modal.getButtons()[1];
        navigateButton.click();

        expect(navigateButton.nodeName).toBe('BUTTON');
        expect(spy).toHaveBeenCalledWith(['', '']);
    });
});