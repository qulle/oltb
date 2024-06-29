import { jest, beforeAll, beforeEach, describe, it, expect } from '@jest/globals';
import { DOM } from '../../browser-helpers/dom-factory';
import { PromptDialog } from './prompt-dialog';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

describe('PromptDialog', () => {
    let dialog = undefined;

    beforeAll(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    beforeEach(() => {
        dialog = new PromptDialog();
    });

    it('should create prompt-dialog', () => {
        expect(dialog).toBeTruthy();
        expect(dialog.options).toStrictEqual({
            title: 'Prompt',
            message: '',
            placeholder: undefined,
            value: undefined,
            confirmClass: 'oltb-btn--green-mid',
            confirmText: 'Confirm',
            cancelText: 'Cancel',
            onConfirm: undefined,
            onCancel: undefined,
            onInput: undefined
        });
    });

    it('should create prompt-dialog with correct HTML-structure', () => {
        expect(dialog).toBeTruthy();
        expect(dialog).toBeInstanceOf(PromptDialog);
        expect(dialog.backdrop.nodeName).toBe('DIV');

        const dialogElement = dialog.backdrop.childNodes[0];
        expect(dialogElement.nodeName).toBe('DIV');
        expect(dialogElement.childNodes.length).toBe(4);
    });

    it('should create prompt-dialog with two buttons', () => {
        expect(dialog.buttons.length).toBe(2);
        expect(dialog.buttons[0].nodeName).toBe('BUTTON');
        expect(dialog.buttons[1].nodeName).toBe('BUTTON');
    });

    it('should close prompt-dialog when cancelButton is clicked', () => {
        const spy = jest.spyOn(DOM, 'removeElement');
        const cancelButton = dialog.buttons[0];

        cancelButton.click();
        expect(spy).toHaveBeenCalled();
    });

    it('should close prompt-dialog when confirmButton is clicked', () => {
        const spy = jest.spyOn(DOM, 'removeElement');
        const confirmButton = dialog.buttons[1];

        confirmButton.click();
        expect(spy).toHaveBeenCalled();
    });
});