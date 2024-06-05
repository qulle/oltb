import { jest, beforeAll, beforeEach, describe, it, expect } from '@jest/globals';
import { DOM } from '../../browser-helpers/dom-factory';
import { BaseDialog } from './base-dialog';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

describe('BaseDialog', () => {
    let dialog = undefined;

    beforeAll(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    beforeEach(() => {
        dialog = new BaseDialog({});
    });

    it('should create base-dialog', () => {
        expect(dialog).toBeTruthy();
        expect(dialog).toBeInstanceOf(BaseDialog);
        expect(dialog.backdrop.nodeName).toBe('DIV');
    });

    it('should trigger animation of dialog when backdrop is clicked', () => {
        const spy = jest.spyOn(DOM, 'runAnimation');
        dialog.backdrop.click();
        expect(spy).toHaveBeenCalled();
    });
});