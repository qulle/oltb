import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { DOM } from '../../browser-helpers/dom-factory';
import { PromptDialog } from './prompt-dialog';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

describe('PromptDialog', () => {
    beforeEach(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should create prompt-dialog', () => {
        const dialog = new PromptDialog();

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
        const dialog = new PromptDialog({});
        expect(dialog).toBeTruthy();
        expect(dialog).toBeInstanceOf(PromptDialog);
        expect(dialog.backdrop.nodeName).toBe('DIV');

        const dialogElement = dialog.backdrop.childNodes[0];
        expect(dialogElement.nodeName).toBe('DIV');
        expect(dialogElement.childNodes.length).toBe(4);
    });

    it('should create prompt-dialog with two buttons', () => {
        const dialog = new PromptDialog({});

        expect(dialog.buttons.length).toBe(2);
        expect(dialog.buttons[0].nodeName).toBe('BUTTON');
        expect(dialog.buttons[1].nodeName).toBe('BUTTON');
    });

    it('should close prompt-dialog when cancelButton is clicked', () => {
        const dialog = new PromptDialog({});
        const spyOnRemoveElement = jest.spyOn(DOM, 'removeElement');
        const cancelButton = dialog.buttons[0];

        cancelButton.click();
        expect(spyOnRemoveElement).toHaveBeenCalled();
    });

    it('should close prompt-dialog when confirmButton is clicked', () => {
        const dialog = new PromptDialog({});
        const spyOnRemoveElement = jest.spyOn(DOM, 'removeElement');
        const confirmButton = dialog.buttons[1];

        confirmButton.click();
        expect(spyOnRemoveElement).toHaveBeenCalled();
    });
});