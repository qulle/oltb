import { jest, beforeAll, beforeEach, describe, it, expect } from '@jest/globals';
import { DOM } from '../../helpers/browser/dom-factory';
import { SelectDialog } from './select-dialog';
import { ElementManager } from '../../managers/element-manager/element-manager';

describe('SelectDialog', () => {
    let dialog = undefined;

    beforeAll(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    beforeEach(() => {
        dialog = new SelectDialog({
            options: [
                {text: 'Lord Of The Rings', value: 'lotr'},
                {text: 'Game Of Thrones', value: 'got'},
                {text: 'Harry Potter', value: 'hp'}
            ],
            value: 'hp'
        });
    });

    it('should create select-dialog with correct HTML-structure', () => {
        expect(dialog).toBeTruthy();
        expect(dialog).toBeInstanceOf(SelectDialog);
        expect(dialog.backdrop.nodeName).toBe('DIV');

        const dialogElement = dialog.backdrop.childNodes[0];
        expect(dialogElement.nodeName).toBe('DIV');
        expect(dialogElement.childNodes.length).toBe(4);
    });

    it('should create select-dialog with two buttons', () => {
        expect(dialog.buttons.length).toBe(2);
        expect(dialog.buttons[0].nodeName).toBe('BUTTON');
        expect(dialog.buttons[1].nodeName).toBe('BUTTON');
    });

    it('should close select-dialog when cancelButton is clicked', () => {
        const spy = jest.spyOn(DOM, 'removeElement');
        const cancelButton = dialog.buttons[0];

        cancelButton.click();
        expect(spy).toHaveBeenCalled();
    });

    it('should close select-dialog when confirmButton is clicked', () => {
        const spy = jest.spyOn(DOM, 'removeElement');
        const confirmButton = dialog.buttons[1];

        confirmButton.click();
        expect(spy).toHaveBeenCalled();
    });

    it('should contain three options with "hp" selected', () => {
        const dialogElement = dialog.backdrop.childNodes[0];
        const selectElement = dialogElement.childNodes[2];

        expect(selectElement.childNodes.length).toBe(3);
        expect(selectElement.value).toBe('hp');
    });
});