import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { DOM } from '../../browser-helpers/dom-factory';
import { SelectDialog } from './select-dialog';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

describe('SelectDialog', () => {
    beforeEach(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should create select-dialog with correct HTML-structure', () => {
        const dialog = new SelectDialog();
        expect(dialog).toBeTruthy();
        expect(dialog).toBeInstanceOf(SelectDialog);
        expect(dialog.backdrop.nodeName).toBe('DIV');

        const dialogElement = dialog.backdrop.childNodes[0];
        expect(dialogElement.nodeName).toBe('DIV');
        expect(dialogElement.childNodes.length).toBe(4);
    });

    it('should create select-dialog with two buttons', () => {
        const dialog = new SelectDialog({});
        expect(dialog.buttons.length).toBe(2);
        expect(dialog.buttons[0].nodeName).toBe('BUTTON');
        expect(dialog.buttons[1].nodeName).toBe('BUTTON');
    });

    it('should close select-dialog when cancelButton is clicked', () => {
        const dialog = new SelectDialog({});
        const spyOnRemoveElement = jest.spyOn(DOM, 'removeElement');
        const cancelButton = dialog.buttons[0];

        cancelButton.click();
        expect(spyOnRemoveElement).toHaveBeenCalled();
    });

    it('should close select-dialog when confirmButton is clicked', () => {
        const dialog = new SelectDialog({});
        const spyOnRemoveElement = jest.spyOn(DOM, 'removeElement');
        const confirmButton = dialog.buttons[1];

        confirmButton.click();
        expect(spyOnRemoveElement).toHaveBeenCalled();
    });

    it('should contain three options with "hp" selected', () => {
        const dialog = new SelectDialog({
            options: [
                {text: 'Lord Of The Rings', value: 'lotr'},
                {text: 'Game Of Thrones', value: 'got'},
                {text: 'Harry Potter', value: 'hp'}
            ],
            value: 'hp'
        });
        const dialogElement = dialog.backdrop.childNodes[0];
        const selectElement = dialogElement.childNodes[2];

        expect(selectElement.childNodes.length).toBe(3);
        expect(selectElement.value).toBe('hp');
    });
});