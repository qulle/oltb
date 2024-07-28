import { jest, describe, it, expect } from '@jest/globals';
import { InfoWindowManager } from './info-window-manager';

const FILENAME = 'info-window-manager.js';

describe('InfoWindowManager', () => {
    it('should init the manager', async () => {
        return InfoWindowManager.initAsync({}).then((result) => {
            expect(InfoWindowManager.getInfoWindow()).toBeTruthy();
            expect(result).toStrictEqual({
                filename: FILENAME,
                result: true
            });
        });
    });

    it('should have two overridden methods [setMap, getName]', () => {
        const spyOnSetMap = jest.spyOn(InfoWindowManager, 'setMap');
        const map = {
            on: (event, callback) => {},
            addOverlay: (overlay) => {}
        };

        InfoWindowManager.setMap(map);
        expect(spyOnSetMap).toHaveBeenCalled();
        expect(InfoWindowManager.getName()).toBe(FILENAME);
    });

    it('should set view-port-cursor', () => {
        const cursor = 'pointer';
        const viewport = {
            style: {
                cursor: 'default'
            }
        };

        const map = {
            on: (event, callback) => {},
            addOverlay: (overlay) => {},
            getViewport: () => {
                return viewport;
            }
        };

        InfoWindowManager.setMap(map);
        expect(InfoWindowManager.getViewportCursor()).toBe('default');
        InfoWindowManager.setViewportCursor(cursor);
        expect(InfoWindowManager.getViewportCursor()).toBe('pointer');
    });

    it('should check if feature is selected', () => {
        expect(InfoWindowManager.isFeatureSelected()).toBe(false);
        InfoWindowManager.selectFeature({});
        expect(InfoWindowManager.isFeatureSelected()).toBe(true);
        InfoWindowManager.deselectFeature();
        expect(InfoWindowManager.isFeatureSelected()).toBe(false);
    });

    it('should select and deselect hover-vector-section', () => {
        expect(InfoWindowManager.isHoveredVectorSectionSelected()).toBe(false);
        InfoWindowManager.selectHoveredVectorSection({
            setStyle: () => {}
        });
        expect(InfoWindowManager.isHoveredVectorSectionSelected()).toBe(true);
        InfoWindowManager.deselectHoveredVectorSection();
        expect(InfoWindowManager.isHoveredVectorSectionSelected()).toBe(false);
    });

    it('should select and deselect vector-section', () => {
        expect(InfoWindowManager.isVectorSectionSelected()).toBe(false);
        InfoWindowManager.selectVectorSection({
            setStyle: () => {}
        });
        expect(InfoWindowManager.isVectorSectionSelected()).toBe(true);
        InfoWindowManager.deselectVectorSection();
        expect(InfoWindowManager.isVectorSectionSelected()).toBe(false);
    });
});