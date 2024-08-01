import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { ImportLayerModal } from './import-layer-modal';

const FILENAME = 'import-layer-modal.js';

describe('ImportLayerModal', () => {
    beforeEach(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should create modal-extension', () => {
        const modal = new ImportLayerModal({
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
        const modal = new ImportLayerModal({
            onCancel: callback.onCancel
        });

        const cancelButton = modal.getButtons()[0];
        cancelButton.click();

        expect(cancelButton.nodeName).toBe('BUTTON');
        expect(spyOnOnCancel).toHaveBeenCalled();
    });

    it('should test callback [onImport]', () => {
        const callback = {onImport: () => {}};
        const spyOnOnImport = jest.spyOn(callback, 'onImport');
        const modal = new ImportLayerModal({
            onImport: callback.onImport
        });

        const importButton = modal.getButtons()[1];
        importButton.click();

        expect(importButton.nodeName).toBe('BUTTON');
        expect(spyOnOnImport).toHaveBeenCalledWith({
            featureProjection: 'EPSG:3857',
            dataProjection: 'EPSG:4326'
        });
    });
});