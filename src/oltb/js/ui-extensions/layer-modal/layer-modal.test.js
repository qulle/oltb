import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { LayerModal } from './layer-modal';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

const FILENAME = 'layer-modal.js';

describe('LayerModal', () => {
    beforeAll(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    it('should create modal-extension', () => {
        const modal = new LayerModal({
            title: 'jest'
        });

        expect(modal).toBeTruthy();
        expect(modal.getName()).toBe(FILENAME);
        expect(modal.getTitle()).toBe('jest');
        expect(modal.getButtons().length).toBe(2);
    });

    it('should test callback [onCancel]', () => {
        const callback = {onCancel: () => {}};
        const spy = jest.spyOn(callback, 'onCancel');
        const modal = new LayerModal({
            onCancel: callback.onCancel
        });

        const cancelButton = modal.getButtons()[0];
        cancelButton.click();

        expect(cancelButton.nodeName).toBe('BUTTON');
        expect(spy).toHaveBeenCalled();
    });

    it('should test callback [onCreate]', () => {
        const callback = {onCreate: () => {}};
        const spy = jest.spyOn(callback, 'onCreate');
        const modal = new LayerModal({
            onCreate: callback.onCreate
        });

        const createButton = modal.getButtons()[1];
        createButton.click();

        expect(createButton.nodeName).toBe('BUTTON');
        expect(spy).toHaveBeenCalledWith({
            name: '',
            layer: 'Tile',
            source: 'TileWMS',
            projection: 'EPSG:3857',
            url: '',
            parameters: '{}',
            wrapX: 'False',
            crossOrigin: 'anonymous',
            attributions: '',
            isDynamicallyAdded: true
        });
    });
});