import { jest, beforeAll, describe, it, expect } from '@jest/globals';
import { BaseTool } from '../base-tool';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { ImportVectorLayerTool } from './import-vector-layer-tool';

const FILENAME = 'import-vector-layer-tool.js';

describe('ImportVectorLayerTool', () => {
    beforeAll(() => {
        jest.spyOn(ElementManager, 'getToolbarElement').mockImplementation(() => {
            return window.document.createElement('div');
        });
    });

    it('should init the tool', () => {
        const tool = new ImportVectorLayerTool();

        expect(tool).toBeTruthy();
        expect(tool).toBeInstanceOf(BaseTool);
        expect(tool).toBeInstanceOf(ImportVectorLayerTool);
        expect(tool.getName()).toBe(FILENAME);
    });

    it('should test user callbacks [onInitiated, onClicked]', () => {
        const options = {
            onInitiated: () => {},
            onClicked: () => {}
        };

        const spyOnInitiated = jest.spyOn(options, 'onInitiated');
        const spyOnClicked = jest.spyOn(options, 'onClicked');
        const tool = new ImportVectorLayerTool(options);

        tool.onClickTool();

        expect(spyOnInitiated).toHaveBeenCalled();
        expect(spyOnClicked).toHaveBeenCalled();
    });
});