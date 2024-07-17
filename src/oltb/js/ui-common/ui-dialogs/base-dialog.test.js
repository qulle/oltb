import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { DOM } from '../../browser-helpers/dom-factory';
import { BaseDialog } from './base-dialog';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { simulateKeyPress } from '../../../../../__mocks__/simulate-key-press';

describe('BaseDialog', () => {
    beforeEach(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should create base-dialog', () => {
        const dialog = new BaseDialog();

        expect(dialog).toBeTruthy();
        expect(dialog).toBeInstanceOf(BaseDialog);
        expect(dialog.backdrop.nodeName).toBe('DIV');
    });

    it('should trigger animation of dialog when backdrop is clicked', () => {
        const dialog = new BaseDialog({});
        const spyOnRunAnimation = jest.spyOn(DOM, 'runAnimation');

        dialog.backdrop.click();
        expect(spyOnRunAnimation).toHaveBeenCalled();
    });

    it('should close dialog when Escape-key is pressed', () => {
        const dialog = new BaseDialog({});
        const spyOnClose = jest.spyOn(dialog, 'close');
        simulateKeyPress('keyup', window, 'Escape');
        
        expect(spyOnClose).toHaveBeenCalledTimes(1);
    });
});