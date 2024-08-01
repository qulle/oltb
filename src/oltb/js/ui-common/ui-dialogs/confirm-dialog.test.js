import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { DOM } from '../../browser-helpers/dom-factory';
import { ConfirmDialog } from './confirm-dialog';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

describe('ConfirmDialog', () => {
    beforeEach(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should create confirm-dialog', () => {
        const dialog = new ConfirmDialog();

        expect(dialog).toBeTruthy();
        expect(dialog.options).toStrictEqual({
            title: 'Confirm',
            message: '',
            confirmClass: 'oltb-btn--red-mid',
            confirmText: 'Yes',
            cancelText: 'Cancel',
            onConfirm: undefined,
            onCancel: undefined
        });
    });

    it('should create confirm-dialog with correct HTML-structure', () => {
        const dialog = new ConfirmDialog({});

        expect(dialog).toBeTruthy();
        expect(dialog).toBeInstanceOf(ConfirmDialog);
        expect(dialog.backdrop.nodeName).toBe('DIV');

        const dialogElement = dialog.backdrop.childNodes[0];
        expect(dialogElement.nodeName).toBe('DIV');
        expect(dialogElement.childNodes.length).toBe(3);
    });

    it('should create confirm-dialog with two buttons', () => {
        const dialog = new ConfirmDialog({});

        expect(dialog.buttons.length).toBe(2);
        expect(dialog.buttons[0].nodeName).toBe('BUTTON');
        expect(dialog.buttons[1].nodeName).toBe('BUTTON');
    });

    it('should close confirm-dialog when cancelButton is clicked', () => {
        const dialog = new ConfirmDialog({});
        const spyOnRemoveElement = jest.spyOn(DOM, 'removeElement');
        const cancelButton = dialog.buttons[0];

        cancelButton.click();
        expect(spyOnRemoveElement).toHaveBeenCalled();
    });

    it('should close confirm-dialog when confirmButton is clicked', () => {
        const dialog = new ConfirmDialog({});
        const spyOnRemoveElement = jest.spyOn(DOM, 'removeElement');
        const confirmButton = dialog.buttons[1];

        confirmButton.click();
        expect(spyOnRemoveElement).toHaveBeenCalled();
    });
});