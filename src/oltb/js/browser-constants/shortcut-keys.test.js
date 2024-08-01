import { describe, it, expect } from '@jest/globals';
import { ShortcutKeys } from './shortcut-keys';

describe('ShortcutKeys', () => {
    const sut = Object.freeze({
        overviewTool: 'A',
        bookmarkTool: 'B',
        coordinatesTool: 'C',
        directionTool: 'D',
        exportPngTool: 'E',
        fullscreenTool: 'F',
        myLocationTool: 'G',
        homeTool: 'H',
        infoTool: 'I',
        graticuleTool: 'J',
        scaleLineTool: 'K',
        layerTool: 'L',
        measureTool: 'M',
        resetNorthTool: 'N',
        importVectorLayerTool: 'O',
        drawTool: 'P',
        zoomInTool: 'Q',
        refreshPageTool: 'R',
        splitViewTool: 'S',
        themeTool: 'T',
        zoomboxTool: 'U',
        editTool: 'V',
        zoomOutTool: 'W',
        scissorsTool: 'X',
        toolboxTool: 'Y',
        magnifyTool: 'Z',
        helpTool: '1',
        settingsTool: '2',
        translationTool: '3',
        debugInfoTool: '4'
    });

    it('should have the same structure as the runtime-object', () => {
        expect(ShortcutKeys).toStrictEqual(sut);
    });
});
