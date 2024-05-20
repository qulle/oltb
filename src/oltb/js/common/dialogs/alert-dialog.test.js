import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { DOM } from '../../helpers/browser/dom-factory';
import { AlertDialog } from './alert-dialog';
import { ElementManager } from '../../managers/element-manager/element-manager';

describe('AlertDialog', () => {
    beforeAll(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    it('should create alert-dialog with correct HTML-structure', () => {
        const dialog = new AlertDialog({});

        expect(dialog).toBeTruthy();
        expect(dialog.backdrop.nodeName).toBe('DIV');

        const dialogElement = dialog.backdrop.childNodes[0];
        expect(dialogElement.nodeName).toBe('DIV');
        expect(dialogElement.childNodes.length).toBe(3);
    });

    it('should create alert-dialog with one button', () => {
        const dialog = new AlertDialog({});

        expect(dialog.buttons.length).toBe(1);
        expect(dialog.buttons[0].nodeName).toBe('BUTTON');
    });

    it('should close alert-dialog when okButton is clicked', () => {
        const dialog = new AlertDialog({});
        const spy = jest.spyOn(DOM, 'removeElement');
        
        const okButton = dialog.buttons[0];
        okButton.click();

        expect(spy).toHaveBeenCalled();
    });
});