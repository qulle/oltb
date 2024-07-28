import { jest, describe, it, expect } from '@jest/globals';
import { InfoWindowManager } from './info-window-manager';

const FILENAME = 'info-window-manager.js';

describe('InfoWindowManager', () => {
    beforeAll(() => {
        jest.useFakeTimers()
    });

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

    it('should show an overlay with content', () => {
        const functionButtonClass = 'oltb-func-btn';
        const infoWindowId = 'oltb-info-window-marker';

        const infoWindow = {
            title: 'jest-title',
            content: 'jest-content',
            footer: `
                <span class="oltb-info-window__coordinates">N1 S2</span>
                <div class="oltb-info-window__buttons-wrapper">
                    <button class="${functionButtonClass} ${functionButtonClass}--delete oltb-tippy" title="Delete" id="${infoWindowId}-remove"></button>
                    <button class="${functionButtonClass} ${functionButtonClass}--edit oltb-tippy" title="Edit" id="${infoWindowId}-edit"></button>
                    <button class="${functionButtonClass} ${functionButtonClass}--crosshair oltb-tippy" title="Copy Coordinates" id="${infoWindowId}-copy-coordinates" data-oltb-coordinates="N1 S2"></button>
                    <button class="${functionButtonClass} ${functionButtonClass}--copy oltb-tippy" title="Copy Text" id="${infoWindowId}-copy-text" data-oltb-copy="jest-content"></button>
                    <button class="${functionButtonClass} ${functionButtonClass}--layer oltb-tippy" title="Show Layer" id="${infoWindowId}-show-layer"></button>
                </div>
            `
        };

        const oltb = {
            infoWindow: infoWindow
        };

        const feature = {
            getProperties: () => {
                return {
                    oltb: oltb
                }
            },
            getGeometry: () => {
                return {
                    getExtent: () => {
                        return [0, 0, 10, 10];
                    }
                }
            }
        };
    
        InfoWindowManager.showOverlay(feature, [0, 0]);
        expect(InfoWindowManager.getInfoWindow()).toBeTruthy();
        
        InfoWindowManager.hideOverlay();
        expect(InfoWindowManager.isContentEmpty()).toBe(true);
        
        InfoWindowManager.showOverlay(feature);
        expect(InfoWindowManager.getInfoWindow()).toBeTruthy();

        jest.runAllTimers();
    });

    it('should find min animation radius', () => {
        const properties = {};
        expect(InfoWindowManager.getAnimationMin(properties)).toBe(0);

        properties['marker'] = {radius: 40};
        expect(InfoWindowManager.getAnimationMin(properties)).toBe(40);
    });

    it('should find max animation radius', () => {
        const properties = {};
        expect(InfoWindowManager.getAnimationMax(properties)).toBe(14);

        properties['marker'] = {radius: 40};
        expect(InfoWindowManager.getAnimationMax(properties)).toBe(60);
    });

    it('should find animation color', () => {
        const properties = {};
        expect(InfoWindowManager.getAnimationColor(properties)).toBe('#3B4352FF');

        properties['marker'] = {fill: '#0099FFFF'};
        expect(InfoWindowManager.getAnimationColor(properties)).toBe('#0099FFFF');

        delete properties['marker'];
        properties['icon'] = {stroke: '#ff0000ff'};
        expect(InfoWindowManager.getAnimationColor(properties)).toBe('#ff0000ff');
    });
});