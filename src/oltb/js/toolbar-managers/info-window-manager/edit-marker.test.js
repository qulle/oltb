import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { editMarker } from './edit-marker';
import { LayerManager } from '../layer-manager/layer-manager';
import { FeatureManager } from '../feature-manager/feature-manager';
import { ElementManager } from '../element-manager/element-manager';
import { InfoWindowManager } from '../info-window-manager/info-window-manager';
import '../../browser-prototypes/string';

describe('editMarker', () => {
    beforeAll(async () => {
        await InfoWindowManager.initAsync();

        jest.spyOn(ElementManager, 'getMapElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    it('should edit marker and create global event', () => {
        const options = {
            lon: 0,
            lat: 0
        };

        const beforeMarker = FeatureManager.generateIconMarker(options);
        const modal = editMarker(InfoWindowManager, beforeMarker);

        const spyOnHideOverlay = jest.spyOn(InfoWindowManager, 'hideOverlay');
        const spyOnRemoveFeatureFromLayer = jest.spyOn(LayerManager, 'removeFeatureFromFeatureLayers');
        const spyOnWindowDispatchEvent = jest.spyOn(window, 'dispatchEvent');

        const buttons = modal.getButtons();
        const createButton = buttons[1];
        createButton.click();

        expect(modal).toBeTruthy();
        expect(spyOnHideOverlay).toHaveBeenCalled();
        expect(spyOnRemoveFeatureFromLayer).toHaveBeenCalledTimes(1);
        expect(spyOnWindowDispatchEvent).toHaveBeenCalled();
    });
});