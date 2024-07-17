import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { Dialog } from './dialog';
import { AlertDialog } from './alert-dialog';
import { PromptDialog } from './prompt-dialog';
import { SelectDialog } from './select-dialog';
import { ConfirmDialog } from './confirm-dialog';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

const CLASS__DIALOG = 'oltb-dialog';

describe('Dialog', () => {
    beforeEach(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should get success-class [oltb-btn--green-mid]', () => {
        const className = Dialog.Success;
        expect(className).toBe('oltb-btn--green-mid');
    });

    it('should get danger-class [oltb-btn--red-mid]', () => {
        const className = Dialog.Danger;
        expect(className).toBe('oltb-btn--red-mid');
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