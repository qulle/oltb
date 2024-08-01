import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { SettingsModal } from './settings-modal';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { SettingsManager } from '../../toolbar-managers/settings-manager/settings-manager';

const FILENAME = 'settings-modal.js';

describe('SettingsModal', () => {
    beforeEach(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });

        jest.spyOn(SettingsManager, 'getSettings').mockImplementation(() => {
            return [];
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should create modal-extension', () => {
        const modal = new SettingsModal({
            title: 'jest'
        });

        expect(modal).toBeTruthy();
        expect(modal.getName()).toBe(FILENAME);
        expect(modal.getTitle()).toBe('jest');
        expect(modal.getButtons().length).toBe(2);
    });

    it('should test callback [onCancel]', () => {
        const callback = {onCancel: () => {}};
        const spyOnOnCancel = jest.spyOn(callback, 'onCancel');
        const modal = new SettingsModal({
            onCancel: callback.onCancel
        });

        const cancelButton = modal.getButtons()[0];
        cancelButton.click();

        expect(cancelButton.nodeName).toBe('BUTTON');
        expect(spyOnOnCancel).toHaveBeenCalled();
    });

    it('should test callback [onSave]', () => {
        const callback = {onSave: () => {}};
        const spyOnOnSave = jest.spyOn(callback, 'onSave');
        const modal = new SettingsModal({
            onSave: callback.onSave
        });

        const saveButton = modal.getButtons()[1];
        saveButton.click();

        expect(saveButton.nodeName).toBe('BUTTON');
        expect(spyOnOnSave).toHaveBeenCalled();
    });
});