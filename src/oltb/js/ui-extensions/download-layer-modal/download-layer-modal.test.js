import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { DownloadLayerModal } from './download-layer-modal';

const FILENAME = 'download-layer-modal.js';

describe('DownloadLayerModal', () => {
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
        const modal = new DownloadLayerModal({
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
        const modal = new DownloadLayerModal({
            onCancel: callback.onCancel
        });

        const cancelButton = modal.getButtons()[0];
        cancelButton.click();

        expect(cancelButton.nodeName).toBe('BUTTON');
        expect(spyOnOnCancel).toHaveBeenCalled();
    });

    it('should test callback [onDownload]', () => {
        const callback = {onDownload: () => {}};
        const spyOnOnDownload = jest.spyOn(callback, 'onDownload');
        const modal = new DownloadLayerModal({
            onDownload: callback.onDownload
        });

        const downloadButton = modal.getButtons()[1];
        downloadButton.click();

        expect(downloadButton.nodeName).toBe('BUTTON');
        expect(spyOnOnDownload).toHaveBeenCalledWith({
            format: 'GeoJSON'
        });
    });
});