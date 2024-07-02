import { describe, it, expect } from '@jest/globals';
import { LocalStorageKeys } from './local-storage-keys';

describe('LocalStorageKeys', () => {
    const sut = Object.freeze({
        bookmarkTool: 'bookmarkTool',
        coordinatesTool: 'coordinatesTool',
        directionTool: 'directionTool',
        drawTool: 'drawTool',
        editTool: 'editTool',
        graticuleTool: 'graticuleTool',
        homeTool: 'homeTool',
        layerTool: 'layerTool',
        magnifyTool: 'magnifyTool',
        mapData: 'mapData',
        measureTool: 'measureTool',
        overviewTool: 'overviewTool',
        scaleLineTool: 'scalelineTool',
        scissorsTool: 'scissorsTool',
        settingsManager: 'settingsManager',
        splitViewTool: 'splitviewTool',
        themeTool: 'themeTool',
        toolboxTool: 'toolboxTool',
        translationManager: 'translationManager',
        zoomboxTool: 'zoomboxTool'
    });
    
    it('should have the same structure as the runtime-object', () => {
        expect(LocalStorageKeys).toStrictEqual(sut);
    });
});
