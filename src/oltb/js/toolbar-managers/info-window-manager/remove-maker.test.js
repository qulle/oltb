import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { Dialog } from '../../ui-common/ui-dialogs/dialog';
import { removeMarker } from './remove-marker';
import { LayerManager } from '../layer-manager/layer-manager';
import { ElementManager } from '../element-manager/element-manager';

describe('removeMarker', () => {
    beforeAll(() => {
        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    it('should remove marker', async () => {
        const spyOnDialog = jest.spyOn(Dialog, 'confirm');
        const spyOnLayerManager = jest.spyOn(LayerManager, 'removeFeatureFromFeatureLayers').mockImplementation(() => {
            return;
        });

        const manager = {hideOverlay: () => {}};
        const marker = {
            id: 'jest'
        };

        const callbacks = {
            removed: (event) => {
                expect(event.detail.feature).toStrictEqual(marker);
            }
        };

        const spyOnCallback = jest.spyOn(callbacks, 'removed');
        window.addEventListener('oltb.feature.removed', callbacks.removed);

        const dialog = removeMarker(manager, marker);
        const confirmButton = dialog.buttons[1];
        confirmButton.click();

        expect(spyOnDialog).toHaveBeenCalled();
        expect(spyOnLayerManager).toHaveBeenCalledWith(marker);
        expect(spyOnCallback).toHaveBeenCalled();
    });
});