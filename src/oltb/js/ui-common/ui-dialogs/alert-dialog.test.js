import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { DOM } from '../../browser-helpers/dom-factory';
import { AlertDialog } from './alert-dialog';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

describe('AlertDialog', () => {
    beforeEach(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should create alert-dialog', () => {
        const dialog = new AlertDialog();

        expect(dialog).toBeTruthy();
        expect(dialog.options).toStrictEqual({
            title: 'Alert',
            message: '',
            confirmText: 'Ok',
            onConfirm: undefined
        });
    });

    it('should create alert-dialog with correct HTML-structure', () => {
        const dialog = new AlertDialog({});
        expect(dialog).toBeTruthy();
        expect(dialog).toBeInstanceOf(AlertDialog);
        expect(dialog.backdrop.nodeName).toBe('DIV');

        const dialogElement = dialog.backdrop.childNodes[0];
        expect(dialogElement.nodeName).toBe('DIV');
        expect(dialogElement.childNodes.length).toBe(3);
    });

    it('should create alert-dialog with one button', () => {
        const dialog = new AlertDialog({});
        expect(dialog.buttons.length).toBe(1);
        expect(dialog.buttons[0].nodeName).toBe('BUTTON');
    });

    it('should close alert-dialog when okButton is clicked', () => {
        const dialog = new AlertDialog({});
        const spyOnRemoveElement = jest.spyOn(DOM, 'removeElement');
        const okButton = dialog.buttons[0];

        okButton.click();
        expect(spyOnRemoveElement).toHaveBeenCalled();
    });
});