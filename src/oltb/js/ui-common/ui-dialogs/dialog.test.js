import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { Dialog } from './dialog';
import { AlertDialog } from './alert-dialog';
import { PromptDialog } from './prompt-dialog';
import { SelectDialog } from './select-dialog';
import { ConfirmDialog } from './confirm-dialog';
import { ElementManager } from '../../managers/element-manager/element-manager';

const CLASS__DIALOG = 'oltb-dialog';

describe('Dialog', () => {
    beforeAll(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    it('should create a default alert-dialog', () => {
        const dialog = Dialog.alert({});
        expect(dialog).toBeTruthy();
        expect(dialog).toBeInstanceOf(AlertDialog);
        expect(dialog.getClassType()).toBe(`${CLASS__DIALOG}--alert`);
    });

    it('should create a default confirm-dialog', () => {
        const dialog = Dialog.confirm({});
        expect(dialog).toBeTruthy();
        expect(dialog).toBeInstanceOf(ConfirmDialog);
        expect(dialog.getClassType()).toBe(`${CLASS__DIALOG}--confirm`);
    });

    it('should create a default prompt-dialog', () => {
        const dialog = Dialog.prompt({});
        expect(dialog).toBeTruthy();
        expect(dialog).toBeInstanceOf(PromptDialog);
        expect(dialog.getClassType()).toBe(`${CLASS__DIALOG}--prompt`);
    });

    it('should create a default select-dialog', () => {
        const dialog = Dialog.select({});
        expect(dialog).toBeTruthy();
        expect(dialog).toBeInstanceOf(SelectDialog);
        expect(dialog.getClassType()).toBe(`${CLASS__DIALOG}--select`);
    });
});