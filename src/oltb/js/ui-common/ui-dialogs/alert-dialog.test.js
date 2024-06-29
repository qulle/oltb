import { jest, beforeAll, beforeEach, describe, it, expect } from '@jest/globals';
import { DOM } from '../../browser-helpers/dom-factory';
import { AlertDialog } from './alert-dialog';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

describe('AlertDialog', () => {
    let dialog = undefined;

    beforeAll(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    beforeEach(() => {
        dialog = new AlertDialog({});
    });

    it('should create alert-dialog', () => {
        expect(dialog).toBeTruthy();
        expect(dialog.options).toStrictEqual({
            title: 'Alert',
            message: '',
            confirmText: 'Ok',
            onConfirm: undefined
        });
    });

    it('should create alert-dialog with correct HTML-structure', () => {
        expect(dialog).toBeTruthy();
        expect(dialog).toBeInstanceOf(AlertDialog);
        expect(dialog.backdrop.nodeName).toBe('DIV');

        const dialogElement = dialog.backdrop.childNodes[0];
        expect(dialogElement.nodeName).toBe('DIV');
        expect(dialogElement.childNodes.length).toBe(3);
    });

    it('should create alert-dialog with one button', () => {
        expect(dialog.buttons.length).toBe(1);
        expect(dialog.buttons[0].nodeName).toBe('BUTTON');
    });

    it('should close alert-dialog when okButton is clicked', () => {
        const spy = jest.spyOn(DOM, 'removeElement');
        const okButton = dialog.buttons[0];

        okButton.click();
        expect(spy).toHaveBeenCalled();
    });
});