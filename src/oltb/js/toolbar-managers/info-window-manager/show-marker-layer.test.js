import { jest, describe, it, expect } from '@jest/globals';
import { LogManager } from '../log-manager/log-manager';
import { LayerManager } from '../layer-manager/layer-manager';
import { ConfigManager } from '../config-manager/config-manager';
import { showMarkerLayer } from './show-marker-layer';

const FILENAME = 'show-marker-layer.js';
const CLASS__TOOLBOX_INDICATE_ITEM = 'oltb-toolbox-list__item--indicate';

describe('showMarkerLayer', () => {
    it('should show marker-layer but fail due to no layer-object', async () => {
        const spyOnLogManager = jest.spyOn(LogManager, 'logWarning');
        const spyOnLayer = jest.spyOn(LayerManager, 'getLayerWrapperFromFeature').mockImplementation(() => {
            return undefined
        });

        const manager = {};
        const marker = {};
        showMarkerLayer(manager, marker);

        expect(spyOnLayer).toHaveBeenCalledWith(marker);
        expect(spyOnLogManager).toHaveBeenCalledWith(FILENAME, 'showMarkerLayer', 'No layer found');
    });

    it('should show marker-layer but fail due to no layer-element', async () => {
        const layerId = '123-456-789-abc-def';
        const spyOnLogManager = jest.spyOn(LogManager, 'logWarning');
        const spyOnLayer = jest.spyOn(LayerManager, 'getLayerWrapperFromFeature').mockImplementation(() => {
            return {
                getId: () => {
                    return layerId;
                }
            }
        });

        const spyOnQuerrySelector = jest.spyOn(window.document, 'querySelector').mockImplementation(() => {
            return undefined;
        });

        const manager = {};
        const marker = {};
        showMarkerLayer(manager, marker);

        expect(spyOnLayer).toHaveBeenCalledWith(marker);
        expect(spyOnQuerrySelector).toHaveBeenCalledWith(`[data-oltb-id='${layerId}']`);
        expect(spyOnLogManager).toHaveBeenCalledWith(FILENAME, 'showMarkerLayer', 'No layer-element found');
    });

    it('should show marker-layer', async () => {
        const layerId = '123-456-789-abc-def';
        const layerElement = window.document.createElement('div');

        const spyOnLayer = jest.spyOn(LayerManager, 'getLayerWrapperFromFeature').mockImplementation(() => {
            return {
                getId: () => {
                    return layerId;
                }
            }
        });

        const spyOnQuerrySelector = jest.spyOn(window.document, 'querySelector').mockImplementation(() => {
            return layerElement;
        });

        const manager = {};
        const marker = {};
        showMarkerLayer(manager, marker);

        expect(spyOnLayer).toHaveBeenCalledWith(marker);
        expect(spyOnQuerrySelector).toHaveBeenCalledWith(`[data-oltb-id='${layerId}']`);
        expect(layerElement.classList.contains(CLASS__TOOLBOX_INDICATE_ITEM)).toBe(true);

        const timeout = ConfigManager.getConfig().animationDuration.slow;
        window.setTimeout(() => {
            expect(layerElement.classList.contains(CLASS__TOOLBOX_INDICATE_ITEM)).toBe(false);
        }, timeout);
    });
});