import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { editMarker } from './edit-marker';
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

    it('should edit marker', () => {
        const options = {
            lon: 0,
            lat: 0
        };

        const beforeMarker = FeatureManager.generateIconMarker(options);
        const modal = editMarker(InfoWindowManager, beforeMarker);

        expect(modal).toBeTruthy();
    });
});