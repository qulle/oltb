import { jest, beforeAll, beforeEach, describe, it, expect } from '@jest/globals';
import { DOM } from '../../helpers/browser/dom-factory';
import { ConfirmDialog } from './confirm-dialog';
import { ElementManager } from '../../managers/element-manager/element-manager';

describe('ConfirmDialog', () => {
    let dialog = undefined;

    beforeAll(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    beforeEach(() => {
        dialog = new ConfirmDialog({});
    });

    it('should create confirm-dialog with correct HTML-structure', () => {
        expect(dialog).toBeTruthy();
        expect(dialog).toBeInstanceOf(ConfirmDialog);
        expect(dialog.backdrop.nodeName).toBe('DIV');

        const dialogElement = dialog.backdrop.childNodes[0];
        expect(dialogElement.nodeName).toBe('DIV');
        expect(dialogElement.childNodes.length).toBe(3);
    });

    it('should create confirm-dialog with two buttons', () => {
        expect(dialog.buttons.length).toBe(2);
        expect(dialog.buttons[0].nodeName).toBe('BUTTON');
        expect(dialog.buttons[1].nodeName).toBe('BUTTON');
    });

    it('should close confirm-dialog when cancelButton is clicked', () => {
        const spy = jest.spyOn(DOM, 'removeElement');
        const cancelButton = dialog.buttons[0];

        cancelButton.click();
        expect(spy).toHaveBeenCalled();
    });

    it('should close confirm-dialog when confirmButton is clicked', () => {
        const spy = jest.spyOn(DOM, 'removeElement');
        const confirmButton = dialog.buttons[1];

        confirmButton.click();
        expect(spy).toHaveBeenCalled();
    });
});