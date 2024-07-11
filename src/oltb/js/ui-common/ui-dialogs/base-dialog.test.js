import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { DOM } from '../../browser-helpers/dom-factory';
import { BaseDialog } from './base-dialog';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { simulateKeyPress } from '../../../../../__mocks__/simulate-key-press';

describe('BaseDialog', () => {
    beforeAll(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    it('should create base-dialog', () => {
        const dialog = new BaseDialog();

        expect(dialog).toBeTruthy();
        expect(dialog).toBeInstanceOf(BaseDialog);
        expect(dialog.backdrop.nodeName).toBe('DIV');
    });

    it('should trigger animation of dialog when backdrop is clicked', () => {
        const dialog = new BaseDialog({});
        const spy = jest.spyOn(DOM, 'runAnimation');
        dialog.backdrop.click();
        expect(spy).toHaveBeenCalled();
    });

    it('should close dialog when Escape-key is pressed', () => {
        new BaseDialog({});
        const spy = jest.spyOn(BaseDialog.prototype, 'close');
        simulateKeyPress('keyup', window, 'Escape');

        // Note:
        // Since using prototype spy, more have-been-called-results than one first might expect.
        // 3 times called by key-binding on window-object
        expect(spy).toHaveBeenCalledTimes(3);
    });
});